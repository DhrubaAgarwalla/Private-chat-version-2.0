import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Room-related functions
export const createRoom = async (roomCode) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  // Check if the room already exists
  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', baseCode)
    .single();

  if (existingRoom) {
    console.log('Room already exists, returning existing room');
    return existingRoom;
  }

  // Create a common room identifier for both codes
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ room_code: baseCode, created_at: new Date() }])
    .select();

  if (error) {
    // If the error is a duplicate key error, the room was created in a race condition
    // Try to get the room again
    if (error.code === '23505') { // Postgres unique violation code
      const { data: retryData } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', baseCode)
        .single();

      if (retryData) {
        return retryData;
      }
    }

    console.error('Error creating room:', error);
    return null;
  }

  return data[0];
};

export const getRoom = async (roomCode) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', baseCode)
    .single();

  if (error) {
    console.error('Error getting room:', error);
    return null;
  }

  return data;
};

// Message-related functions
export const sendMessage = async (roomCode, message, sender) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  // Make sure we're storing the sender ID consistently
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_code: baseCode,
      content: message,
      sender,  // This is the userId that will be used to identify message ownership
      created_at: new Date()
    }])
    .select();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data[0];
};

export const getMessages = async (roomCode) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_code', baseCode)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error getting messages:', error);
    return [];
  }

  return data;
};

export const subscribeToMessages = (roomCode, callback) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  return supabase
    .channel(`room:${baseCode}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_code=eq.${baseCode}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};

export const deleteAllMessages = async (roomCode) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('room_code', baseCode);

  if (error) {
    console.error('Error deleting messages:', error);
    return false;
  }

  return true;
};

// File upload functions
export const uploadFile = async (roomCode, file, fileType, sender) => {
  try {
    console.log('Starting file upload:', fileType, file.name);

    // Extract the base code (without the suffix -1 or -2)
    const baseCode = roomCode.substring(0, roomCode.length - 2);

    // Generate a unique file name
    const fileName = `${baseCode}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    console.log('Uploading to path:', fileName);

    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('chat_media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    console.log('File uploaded successfully:', data);

    // Get the public URL for the file
    const { data: { publicUrl } } = supabase
      .storage
      .from('chat_media')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);

    // Send a message with the file URL
    return await sendMediaMessage(roomCode, publicUrl, fileType, sender);
  } catch (err) {
    console.error('Unexpected error during file upload:', err);
    return null;
  }
};

// Send a message with media (image, video, audio)
export const sendMediaMessage = async (roomCode, mediaUrl, mediaType, sender) => {
  try {
    console.log('Sending media message:', { mediaType, sender });

    // Extract the base code (without the suffix -1 or -2)
    const baseCode = roomCode.substring(0, roomCode.length - 2);

    // Create the message object
    const messageData = {
      room_code: baseCode,
      content: mediaUrl,
      media_type: mediaType, // 'image', 'video', 'audio', 'gif'
      sender,
      created_at: new Date()
    };

    console.log('Message data:', messageData);

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();

    if (error) {
      console.error('Error sending media message:', error);
      return null;
    }

    console.log('Media message sent successfully:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Unexpected error sending media message:', err);
    return null;
  }
};

// Send a GIF message
export const sendGifMessage = async (roomCode, gifUrl, sender) => {
  console.log('Sending GIF message:', gifUrl);
  return await sendMediaMessage(roomCode, gifUrl, 'gif', sender);
};

// Send a voice message
export const sendVoiceMessage = async (roomCode, audioBlob, sender) => {
  console.log('Processing voice message');
  try {
    const file = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
    console.log('Voice file created:', file.name, file.size);
    return await uploadFile(roomCode, file, 'audio', sender);
  } catch (err) {
    console.error('Error creating voice file:', err);
    return null;
  }
};

// Store user ID for a room
export const storeUserIdForRoom = async (roomCode, userId) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);
  const suffix = roomCode.charAt(roomCode.length - 1);

  try {
    // Check if a record already exists
    const { data: existingData } = await supabase
      .from('room_users')
      .select('*')
      .eq('room_code', baseCode)
      .eq('suffix', suffix);

    if (existingData && existingData.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from('room_users')
        .update({ user_id: userId })
        .eq('room_code', baseCode)
        .eq('suffix', suffix);

      if (error) {
        console.error('Error updating user ID for room:', error);
        return false;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('room_users')
        .insert([{
          room_code: baseCode,
          suffix,
          user_id: userId
        }]);

      if (error) {
        console.error('Error storing user ID for room:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Unexpected error storing user ID:', err);
    return false;
  }
};

// Get partner user ID for a room
export const getPartnerUserId = async (roomCode) => {
  // Extract the base code and get the partner suffix
  const baseCode = roomCode.substring(0, roomCode.length - 2);
  const suffix = roomCode.charAt(roomCode.length - 1);
  const partnerSuffix = suffix === '1' ? '2' : '1';

  try {
    const { data, error } = await supabase
      .from('room_users')
      .select('user_id')
      .eq('room_code', baseCode)
      .eq('suffix', partnerSuffix)
      .single();

    if (error) {
      console.error('Error getting partner user ID:', error);
      return null;
    }

    return data?.user_id || null;
  } catch (err) {
    console.error('Unexpected error getting partner user ID:', err);
    return null;
  }
};

// User Status Functions

// Update user online status
export const updateOnlineStatus = async (roomCode, userId, isOnline) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  console.log(`Setting online status for user ${userId} in room ${baseCode} to ${isOnline}`);

  try {
    // Use upsert for more reliable operation
    const { data, error } = await supabase
      .from('user_status')
      .upsert({
        room_code: baseCode,
        user_id: userId,
        is_online: isOnline,
        last_seen: new Date(),
        // Force an update to the updated_at column to trigger realtime
        updated_at: new Date()
      }, {
        onConflict: 'room_code,user_id',
        returning: 'representation'
      });

    if (error) {
      console.error('Error updating online status:', error);
      return false;
    }

    console.log('Online status updated successfully:', data);

    // Also broadcast the status change directly for immediate effect
    const channel = supabase.channel(`broadcast:${baseCode}`);
    channel.send({
      type: 'broadcast',
      event: 'status',
      payload: { userId, isOnline, timestamp: new Date().toISOString() }
    });

    return true;
  } catch (err) {
    console.error('Unexpected error updating online status:', err);
    return false;
  }
};

// Update typing status
export const updateTypingStatus = async (roomCode, userId, isTyping) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  console.log(`Updating typing status for user ${userId} in room ${baseCode} to ${isTyping}`);

  try {
    // First, try a direct update for better performance
    const { data: updateData, error: updateError } = await supabase
      .from('user_status')
      .update({
        is_typing: isTyping,
        is_online: true,
        last_seen: new Date(),
        updated_at: new Date() // Force an update to trigger realtime
      })
      .eq('room_code', baseCode)
      .eq('user_id', userId);

    // If the update failed because the record doesn't exist, insert it
    if (updateError && updateError.code === 'PGRST116') {
      console.log('No existing record found, inserting new record');

      const { data: insertData, error: insertError } = await supabase
        .from('user_status')
        .insert({
          room_code: baseCode,
          user_id: userId,
          is_typing: isTyping,
          is_online: true,
          last_seen: new Date()
        });

      if (insertError) {
        console.error('Error inserting typing status:', insertError);
        return false;
      }

      console.log('Typing status inserted successfully:', insertData);
    } else if (updateError) {
      console.error('Error updating typing status:', updateError);
      return false;
    } else {
      console.log('Typing status updated successfully:', updateData);
    }

    // As a backup, also broadcast the typing status through a channel
    // This ensures real-time updates even if the database triggers are slow
    const channel = supabase.channel(`broadcast:${baseCode}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping, timestamp: new Date().toISOString() }
    });

    return true;
  } catch (err) {
    console.error('Unexpected error updating typing status:', err);
    return false;
  }
};

// Update last read message
export const updateLastReadMessage = async (roomCode, userId, messageId) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  console.log(`Updating last read message for user ${userId} in room ${baseCode} to message ${messageId}`);

  try {
    // Get the current timestamp
    const now = new Date();

    // Use upsert to simplify the operation (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from('user_status')
      .upsert({
        room_code: baseCode,
        user_id: userId,
        last_read_message_id: messageId,
        is_online: true,
        last_seen: now,
        updated_at: now // Force update to trigger realtime
      }, {
        onConflict: 'room_code,user_id',
        returning: 'representation'
      });

    if (error) {
      console.error('Error updating last read message:', error);
      return false;
    }

    console.log('Last read message updated successfully:', data);

    // Also broadcast a direct message to notify about read status
    // This ensures immediate updates even if database triggers are slow
    const channel = supabase.channel(`read_status:${baseCode}`);
    channel.send({
      type: 'broadcast',
      event: 'message_read',
      payload: { userId, messageId, timestamp: now.toISOString() }
    });

    return true;
  } catch (err) {
    console.error('Unexpected error updating last read message:', err);
    return false;
  }
};

// Get partner status
export const getPartnerStatus = async (roomCode, partnerId) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  try {
    const { data, error } = await supabase
      .from('user_status')
      .select('*')
      .eq('room_code', baseCode)
      .eq('user_id', partnerId)
      .single();

    if (error) {
      console.error('Error getting partner status:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error getting partner status:', err);
    return null;
  }
};

// Subscribe to partner status changes
export const subscribeToPartnerStatus = (roomCode, partnerId, onStatusChange) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  console.log(`Subscribing to status changes for partner ${partnerId} in room ${baseCode}`);

  // Create a combined status object that we'll update
  let currentStatus = null;

  // Function to handle status updates
  const handleStatusUpdate = (newStatus) => {
    // Update the current status with the new values
    currentStatus = { ...currentStatus, ...newStatus };
    // Notify the caller
    onStatusChange(currentStatus);
  };

  // Subscribe to database changes for this partner
  const dbSubscription = supabase
    .channel(`user_status_db:${baseCode}`)
    .on('postgres_changes', {
      event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'user_status',
      filter: `room_code=eq.${baseCode} AND user_id=eq.${partnerId}`
    }, (payload) => {
      console.log('Partner status update received from DB:', payload);
      if (payload.new) {
        handleStatusUpdate(payload.new);
        currentStatus = payload.new; // Store the full status
      }
    })
    .subscribe((status) => {
      console.log('DB subscription status:', status);
    });

  // Subscribe to direct broadcasts for immediate updates
  const broadcastSubscription = supabase
    .channel(`broadcast:${baseCode}`)
    // Listen for typing events
    .on('broadcast', { event: 'typing' }, (payload) => {
      console.log('Typing broadcast received:', payload);
      // Only process if it's from our partner
      if (payload.payload && payload.payload.userId === partnerId) {
        // Update just the typing status
        handleStatusUpdate({ is_typing: payload.payload.isTyping });
      }
    })
    // Listen for status events (online/offline)
    .on('broadcast', { event: 'status' }, (payload) => {
      console.log('Status broadcast received:', payload);
      // Only process if it's from our partner
      if (payload.payload && payload.payload.userId === partnerId) {
        // Update the online status
        handleStatusUpdate({
          is_online: payload.payload.isOnline,
          last_seen: payload.payload.timestamp
        });
      }
    })
    // Listen for read status events
    .on('broadcast', { event: 'message_read' }, (payload) => {
      console.log('Read status broadcast received:', payload);
      // Only process if it's from our partner
      if (payload.payload && payload.payload.userId === partnerId) {
        // Update the last read message ID and last seen timestamp
        handleStatusUpdate({
          last_read_message_id: payload.payload.messageId,
          last_seen: payload.payload.timestamp
        });
      }
    })
    .subscribe((status) => {
      console.log('Broadcast subscription status:', status);
    });

  // Return a combined subscription object with an unsubscribe method
  return {
    unsubscribe: () => {
      dbSubscription.unsubscribe();
      broadcastSubscription.unsubscribe();
    }
  };
};
