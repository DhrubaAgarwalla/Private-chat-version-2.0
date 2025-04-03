import Peer from 'peerjs';
import { supabase } from './supabase';

// Configuration for PeerJS
const peerConfig = {
  // Using the free public PeerJS server
  // No host specified means it will use PeerJS's free public server
  debug: 3, // Log level (0-3)
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
    // Add ICE transport policy for better connectivity
    iceTransportPolicy: 'all',
    // Add RTCP MUX policy for better performance
    rtcpMuxPolicy: 'require',
    // Add bundle policy for better performance
    bundlePolicy: 'max-bundle',
    // Add DSCP for quality of service
    enableDscp: true,
    // Add ICE candidate pool size for faster connections
    iceCandidatePoolSize: 10
  }
};

// Call states
export const CALL_STATE = {
  IDLE: 'idle',
  OUTGOING: 'outgoing',
  INCOMING: 'incoming',
  CONNECTED: 'connected'
};

// Call types
export const CALL_TYPE = {
  AUDIO: 'audio',
  VIDEO: 'video'
};

// Initialize PeerJS with the user ID
export const initializePeer = (userId) => {
  // Use the existing userId directly as the peer ID
  // It's already unique for each user in the room
  const peerId = userId;

  console.log('Initializing PeerJS with ID:', peerId);

  // Create a new Peer instance
  const peer = new Peer(peerId, peerConfig);

  return new Promise((resolve, reject) => {
    peer.on('open', (id) => {
      console.log('PeerJS connection established with ID:', id);
      resolve(peer);
    });

    peer.on('error', (error) => {
      console.error('PeerJS error:', error);
      reject(error);
    });
  });
};

// Send a call signal through Supabase
export const sendCallSignal = async (roomCode, callerId, calleeId, callType) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  try {
    // Create a call signal in the database
    const { data, error } = await supabase
      .from('call_signals')
      .insert([{
        room_code: baseCode,
        caller_id: callerId,
        callee_id: calleeId,
        call_type: callType,
        status: 'ringing',
        created_at: new Date()
      }])
      .select();

    if (error) {
      console.error('Error sending call signal:', error);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error('Unexpected error sending call signal:', err);
    return null;
  }
};

// Update a call signal status
export const updateCallSignalStatus = async (signalId, status) => {
  try {
    const { error } = await supabase
      .from('call_signals')
      .update({ status })
      .eq('id', signalId);

    if (error) {
      console.error('Error updating call signal:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating call signal:', err);
    return false;
  }
};

// Subscribe to call signals for a specific room
export const subscribeToCallSignals = (roomCode, userId, onCallSignal, onCallStatusChange) => {
  // Extract the base code (without the suffix -1 or -2)
  const baseCode = roomCode.substring(0, roomCode.length - 2);

  // Subscribe to call signals for this room
  const subscription = supabase
    .channel(`call_signals:${baseCode}`)
    // Listen for new call signals
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'call_signals',
      filter: `room_code=eq.${baseCode}`
    }, (payload) => {
      // Check if this call signal is for the current user
      if (payload.new.callee_id === userId) {
        onCallSignal(payload.new);
      }
    })
    // Listen for call status updates
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'call_signals',
      filter: `room_code=eq.${baseCode}`
    }, (payload) => {
      // Check if this call signal involves the current user (either as caller or callee)
      if (payload.new.caller_id === userId || payload.new.callee_id === userId) {
        // If the call was ended by the other user
        if (payload.new.status === 'ended' || payload.new.status === 'rejected') {
          console.log('Call ended or rejected by the other user');
          onCallStatusChange && onCallStatusChange(payload.new.status, payload.new);
        }
      }
    })
    .subscribe();

  return subscription;
};

// Make an outgoing call
export const makeCall = async (peer, remotePeerId, localStream, callType) => {
  try {
    // Enhanced call options
    const options = {
      metadata: { callType },
      // For audio-only calls, disable video
      video: callType === CALL_TYPE.VIDEO,
      audio: true,
      // Add codec preferences for better quality
      // Note: These are hints and may not be honored by all browsers
      sdpTransform: (sdp) => {
        // Prioritize VP9 codec for better quality at lower bandwidth
        if (callType === CALL_TYPE.VIDEO) {
          sdp = sdp.replace(/m=video .+ VP8/g, 'm=video $1 VP9 VP8');
        }
        // Prioritize Opus codec for better audio quality
        sdp = sdp.replace(/m=audio .+ opus/g, 'm=audio $1 opus');
        return sdp;
      }
    };

    console.log('Making call with options:', options);

    // Make the call
    const call = peer.call(remotePeerId, localStream, options);

    return call;
  } catch (err) {
    console.error('Error making call:', err);
    return null;
  }
};

// Answer an incoming call
export const answerCall = (call, localStream) => {
  try {
    // Enhanced answer options
    const options = {
      // Add codec preferences for better quality
      sdpTransform: (sdp) => {
        // Prioritize VP9 codec for better quality at lower bandwidth
        if (call.metadata && call.metadata.callType === CALL_TYPE.VIDEO) {
          sdp = sdp.replace(/m=video .+ VP8/g, 'm=video $1 VP9 VP8');
        }
        // Prioritize Opus codec for better audio quality
        sdp = sdp.replace(/m=audio .+ opus/g, 'm=audio $1 opus');
        return sdp;
      }
    };

    console.log('Answering call with options:', options);

    // Answer the call with the local stream and options
    call.answer(localStream, options);
    return true;
  } catch (err) {
    console.error('Error answering call:', err);
    return false;
  }
};

// Get local media stream (audio or video)
export const getLocalStream = async (callType) => {
  try {
    // Define high-quality audio constraints
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };

    // Define high-quality video constraints
    const videoConstraints = callType === CALL_TYPE.VIDEO ? {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      frameRate: { ideal: 30, min: 15 },
      facingMode: 'user'
    } : false;

    const constraints = {
      audio: audioConstraints,
      video: videoConstraints
    };

    console.log('Getting media with constraints:', constraints);

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Log the tracks we got
    stream.getTracks().forEach(track => {
      console.log(`Got ${track.kind} track with settings:`, track.getSettings());
    });

    return stream;
  } catch (err) {
    console.error('Error getting local stream:', err);
    return null;
  }
};

// End a call
export const endCall = (call, localStream) => {
  try {
    // Close the call
    if (call) {
      call.close();
    }

    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    return true;
  } catch (err) {
    console.error('Error ending call:', err);
    return false;
  }
};
