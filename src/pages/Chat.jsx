import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRoom,
  getMessages,
  sendMessage,
  subscribeToMessages,
  deleteAllMessages,
  uploadFile,
  sendMediaMessage,
  sendGifMessage,
  sendVoiceMessage,
  storeUserIdForRoom,
  getPartnerUserId,
  updateOnlineStatus,
  updateTypingStatus,
  updateLastReadMessage,
  getPartnerStatus,
  subscribeToPartnerStatus
} from '../services/supabase';
import { getBaseCode, getPartnerCode } from '../utils/roomCode';
import EnhancedChatInput from '../components/EnhancedChatInput';
import MediaMessage from '../components/MediaMessage';
import CallButton from '../components/CallButton';
import CallInterface from '../components/CallInterface';
import StatusIndicator from '../components/StatusIndicator';
import MessageStatus from '../components/MessageStatus';
import TypingIndicator from '../components/TypingIndicator';
import SoundCloudPlayer from '../components/SoundCloudPlayer';
import {
  initializePeer,
  sendCallSignal,
  updateCallSignalStatus,
  subscribeToCallSignals,
  makeCall,
  answerCall,
  getLocalStream,
  endCall,
  CALL_STATE,
  CALL_TYPE
} from '../services/callService';
import {
  ChatContainer,
  ChatHeader,
  ChatMessages,
  ChatInputContainer,
  MessageBubble,
  SystemMessage,
  FlexContainer,
  Button,
  TextArea,
  Title,
  Text,
  LoadingSpinner
} from '../styles/StyledComponents';

const Chat = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [room, setRoom] = useState(null);
  const [connected, setConnected] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate a random user identifier and store it in localStorage for persistence
  const [userId] = useState(() => {
    // Try to get existing userId from localStorage
    const storedUserId = localStorage.getItem(`chat_user_${roomCode.substring(0, roomCode.length - 2)}`);

    if (storedUserId) {
      return storedUserId;
    }

    // Generate a new userId if none exists
    const newUserId = Math.random().toString(36).substring(2, 10);

    // Store it in localStorage with the base room code as part of the key
    localStorage.setItem(`chat_user_${roomCode.substring(0, roomCode.length - 2)}`, newUserId);

    return newUserId;
  });

  // Calling state
  const [peer, setPeer] = useState(null);
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [callType, setCallType] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callSignalId, setCallSignalId] = useState(null);

  // User status state
  const [isTyping, setIsTyping] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [partnerUserId, setPartnerUserId] = useState(null);
  const [statusSubscription, setStatusSubscription] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Music player state
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load room and messages
  useEffect(() => {
    const loadRoom = async () => {
      try {
        // Validate room code format
        const codeRegex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[12]$/;
        if (!codeRegex.test(roomCode)) {
          throw new Error('Invalid room code format');
        }

        // Get room data
        const roomData = await getRoom(roomCode);
        if (!roomData) {
          console.warn('Room not found, using fallback room data');
          // Use a fallback room object with the base code
          const baseCode = roomCode.substring(0, roomCode.length - 2);
          setRoom({ room_code: baseCode });
        } else {
          setRoom(roomData);
        }

        // Get messages
        const messagesData = await getMessages(roomCode);
        setMessages(messagesData);

        // Subscribe to new messages
        const subscription = subscribeToMessages(roomCode, (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        setSubscription(subscription);

        // Store the user ID in Supabase for WebRTC calling
        const success = await storeUserIdForRoom(roomCode, userId);
        if (!success) {
          console.warn('Failed to store user ID for room');
        }

        setConnected(true);
        setLoading(false);

        // Add system message for joining
        const systemMessage = {
          id: `system-${Date.now()}`,
          room_code: roomCode,
          content: 'You joined the chat',
          sender: 'system',
          created_at: new Date().toISOString()
        };

        setMessages((prevMessages) => [...prevMessages, systemMessage]);
      } catch (err) {
        console.error('Error loading room:', err);
        setError(err.message || 'Failed to load chat room');
        setLoading(false);
      }
    };

    loadRoom();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [roomCode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize PeerJS
  useEffect(() => {
    if (userId && connected) {
      const initPeer = async () => {
        try {
          const newPeer = await initializePeer(userId);
          setPeer(newPeer);

          // Set up event listeners for incoming calls
          newPeer.on('call', incomingCall => {
            console.log('Incoming call received', incomingCall);

            // Set call state to incoming
            setCallState(CALL_STATE.INCOMING);
            setCallType(incomingCall.metadata?.callType || CALL_TYPE.AUDIO);
            setCurrentCall(incomingCall);

            // Set up event listeners for the call
            incomingCall.on('stream', stream => {
              console.log('Received remote stream', stream);
              setRemoteStream(stream);
            });

            incomingCall.on('close', () => {
              console.log('Call closed');
              handleEndCall();
            });

            incomingCall.on('error', err => {
              console.error('Call error:', err);
              handleEndCall();
            });
          });
        } catch (err) {
          console.error('Error initializing PeerJS:', err);
        }
      };

      initPeer();

      return () => {
        // Clean up PeerJS connection
        if (peer) {
          peer.destroy();
        }
      };
    }
  }, [userId, connected]);

  // Subscribe to call signals
  useEffect(() => {
    if (room && userId && connected) {
      const callSignalSubscription = subscribeToCallSignals(
        roomCode,
        userId,
        // Handle incoming call signals
        (signal) => {
          console.log('Received call signal:', signal);

          // If we're already in a call, ignore the signal
          if (callState !== CALL_STATE.IDLE) {
            console.log('Already in a call, ignoring signal');
            return;
          }

          // Set the call signal ID for later use
          setCallSignalId(signal.id);
        },
        // Handle call status changes
        (status, signal) => {
          console.log(`Call status changed to: ${status}`, signal);

          // If the call was ended or rejected by the other user
          if ((status === 'ended' || status === 'rejected') && callState !== CALL_STATE.IDLE) {
            console.log('Call ended by the other user, cleaning up...');
            handleEndCall();
          }
        }
      );

      return () => {
        callSignalSubscription.unsubscribe();
      };
    }
  }, [room, roomCode, userId, callState, connected]);

  // Get partner user ID and set up status subscription
  useEffect(() => {
    if (room && userId && connected) {
      const fetchPartnerUserId = async () => {
        try {
          // Get the partner's user ID
          const partnerId = await getPartnerUserId(roomCode);

          if (partnerId) {
            setPartnerUserId(partnerId);

            // Get initial partner status
            const status = await getPartnerStatus(roomCode, partnerId);
            setPartnerStatus(status);

            // Subscribe to partner status changes
            const subscription = subscribeToPartnerStatus(roomCode, partnerId, (newStatus) => {
              console.log('Partner status changed:', newStatus);
              setPartnerStatus(newStatus);
            });

            setStatusSubscription(subscription);
          }
        } catch (err) {
          console.error('Error setting up partner status:', err);
        }
      };

      fetchPartnerUserId();

      return () => {
        if (statusSubscription) {
          statusSubscription.unsubscribe();
        }
      };
    }
  }, [room, roomCode, userId, connected]);

  // Set online status when joining/leaving the chat
  useEffect(() => {
    if (userId && connected) {
      console.log('Setting online status to true');
      // Set online status to true when joining
      updateOnlineStatus(roomCode, userId, true);

      // Set up a heartbeat to keep the online status active
      const heartbeatInterval = setInterval(() => {
        console.log('Sending online heartbeat');
        updateOnlineStatus(roomCode, userId, true);
      }, 30000); // Every 30 seconds

      // Set online status to false when leaving
      return () => {
        console.log('Setting online status to false');
        updateOnlineStatus(roomCode, userId, false);
        clearInterval(heartbeatInterval);
      };
    }
  }, [userId, roomCode, connected]);

  // Also update online status when the window is focused/blurred
  useEffect(() => {
    if (userId && connected) {
      const handleVisibilityChange = () => {
        const isVisible = document.visibilityState === 'visible';
        console.log(`Visibility changed to: ${isVisible ? 'visible' : 'hidden'}`);
        updateOnlineStatus(roomCode, userId, isVisible);
      };

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', () => updateOnlineStatus(roomCode, userId, true));
      window.addEventListener('blur', () => updateOnlineStatus(roomCode, userId, false));

      // Clean up
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', () => updateOnlineStatus(roomCode, userId, true));
        window.removeEventListener('blur', () => updateOnlineStatus(roomCode, userId, false));
      };
    }
  }, [userId, roomCode, connected]);

  // Set up a continuous check for partner status
  useEffect(() => {
    if (connected && partnerUserId) {
      // Periodically check partner status directly from the database
      const statusCheckInterval = setInterval(async () => {
        try {
          const status = await getPartnerStatus(roomCode, partnerUserId);
          if (status) {
            setPartnerStatus(prevStatus => ({
              ...prevStatus,
              ...status,
              // Keep typing status from realtime updates if it exists
              is_typing: prevStatus?.is_typing || status.is_typing
            }));
          }
        } catch (err) {
          console.error('Error checking partner status:', err);
        }
      }, 5000); // Every 5 seconds

      return () => clearInterval(statusCheckInterval);
    }
  }, [connected, partnerUserId, roomCode]);

  // Update last read message when messages change
  useEffect(() => {
    if (userId && connected && messages.length > 0) {
      // Find all messages from the partner
      const partnerMessages = messages.filter(msg => msg.sender !== userId);

      if (partnerMessages.length > 0) {
        // Get the last message from the partner
        const lastPartnerMessage = partnerMessages[partnerMessages.length - 1];

        // Mark it as read
        if (lastPartnerMessage && lastPartnerMessage.id) {
          console.log('Marking partner message as read:', lastPartnerMessage.id);
          updateLastReadMessage(roomCode, userId, lastPartnerMessage.id);
        }
      }
    }
  }, [messages, userId, roomCode, connected]);

  // Also update the last read message when a new message arrives
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // If this is a new message from the partner
      if (lastMessage && lastMessage.sender !== userId && lastMessage.id !== lastMessageRef.current) {
        // Update the last message reference
        lastMessageRef.current = lastMessage.id;

        // Mark it as read
        console.log('New message from partner, marking as read:', lastMessage.id);
        updateLastReadMessage(roomCode, userId, lastMessage.id);
      }
    }
  }, [messages, userId, roomCode]);

  // Set up an interval to periodically update the last read message
  // This ensures the read status is updated even if there are network issues
  useEffect(() => {
    if (userId && connected && messages.length > 0) {
      const intervalId = setInterval(() => {
        // Find the last message from the partner
        const partnerMessages = messages.filter(msg => msg.sender !== userId);

        if (partnerMessages.length > 0) {
          const lastPartnerMessage = partnerMessages[partnerMessages.length - 1];
          if (lastPartnerMessage && lastPartnerMessage.id) {
            console.log('Periodic update of read status for message:', lastPartnerMessage.id);
            updateLastReadMessage(roomCode, userId, lastPartnerMessage.id);
          }
        }
      }, 3000); // Update every 3 seconds

      return () => clearInterval(intervalId);
    }
  }, [messages, userId, roomCode, connected]);

  // Also update the last read message when the component mounts
  useEffect(() => {
    if (userId && connected && messages.length > 0) {
      // Find the last message from the partner
      const partnerMessages = messages.filter(msg => msg.sender !== userId);

      if (partnerMessages.length > 0) {
        const lastPartnerMessage = partnerMessages[partnerMessages.length - 1];
        if (lastPartnerMessage && lastPartnerMessage.id) {
          console.log('Initial update of read status for message:', lastPartnerMessage.id);
          updateLastReadMessage(roomCode, userId, lastPartnerMessage.id);
        }
      }
    }
  }, [connected]); // Only run when connected changes

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      await sendMessage(roomCode, newMessage, userId);

      // Clear the input and reset typing status
      setNewMessage('');
      setIsTyping(false);
      updateTypingStatus(roomCode, userId, false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle clearing all messages
  const handleClearMessages = async () => {
    if (window.confirm('Are you sure you want to delete all messages? This cannot be undone.')) {
      try {
        const success = await deleteAllMessages(roomCode);

        if (success) {
          // Keep only system messages
          setMessages([{
            id: `system-${Date.now()}`,
            room_code: roomCode,
            content: 'All messages have been cleared',
            sender: 'system',
            created_at: new Date().toISOString()
          }]);
        }
      } catch (err) {
        console.error('Error clearing messages:', err);
        setError('Failed to clear messages. Please try again.');
      }
    }
  };

  // Handle starting a call
  const handleStartCall = async (type) => {
    try {
      console.log('Starting call of type:', type);

      // Set call state to outgoing
      setCallState(CALL_STATE.OUTGOING);
      setCallType(type);

      // Get local media stream
      console.log('Getting local media stream...');
      const stream = await getLocalStream(type);

      if (!stream) {
        throw new Error('Could not get local stream');
      }

      console.log('Local stream obtained:', stream.id);
      setLocalStream(stream);

      // Make sure peer is initialized
      if (!peer) {
        throw new Error('PeerJS not initialized');
      }

      // Get the partner's user ID from Supabase
      const partnerUserId = await getPartnerUserId(roomCode);

      if (!partnerUserId) {
        throw new Error('Could not find partner user ID. Make sure your partner has joined the room.');
      }

      console.log('Calling partner with user ID:', partnerUserId);

      // Send call signal through Supabase
      const signal = await sendCallSignal(
        roomCode,
        userId, // Our user ID
        partnerUserId, // Partner's user ID
        type
      );

      if (signal) {
        setCallSignalId(signal.id);
        console.log('Call signal sent with ID:', signal.id);
      }

      // Make the call using the partner's user ID
      console.log('Making call to peer:', partnerUserId);
      const call = await makeCall(peer, partnerUserId, stream, type);

      if (!call) {
        throw new Error('Failed to make call');
      }

      console.log('Call object created:', call);
      setCurrentCall(call);

      // Set up event listeners for the call
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream', remoteStream.id);
        setRemoteStream(remoteStream);
        setCallState(CALL_STATE.CONNECTED);
      });

      call.on('close', () => {
        console.log('Call closed');
        handleEndCall();
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        handleEndCall();
      });
    } catch (err) {
      console.error('Error starting call:', err);
      handleEndCall();
      setError(`Failed to start call: ${err.message}`);
    }
  };

  // Handle answering a call
  const handleAnswerCall = async () => {
    try {
      if (!currentCall) {
        throw new Error('No incoming call to answer');
      }

      // Get local media stream
      const stream = await getLocalStream(callType);
      setLocalStream(stream);

      if (!stream) {
        throw new Error('Could not get local stream');
      }

      // Answer the call
      const success = answerCall(currentCall, stream);

      if (success) {
        setCallState(CALL_STATE.CONNECTED);

        // Update call signal status
        if (callSignalId) {
          await updateCallSignalStatus(callSignalId, 'accepted');
        }
      } else {
        throw new Error('Failed to answer call');
      }
    } catch (err) {
      console.error('Error answering call:', err);
      handleEndCall();
      setError('Failed to answer call. Please try again.');
    }
  };

  // Handle rejecting a call
  const handleRejectCall = async () => {
    try {
      // Update call signal status
      if (callSignalId) {
        await updateCallSignalStatus(callSignalId, 'rejected');
      }

      // End the call
      handleEndCall();
    } catch (err) {
      console.error('Error rejecting call:', err);
      setError('Failed to reject call. Please try again.');
    }
  };

  // Handle ending a call
  const handleEndCall = () => {
    try {
      console.log('Ending call and cleaning up resources...');

      // End the call
      if (currentCall) {
        console.log('Closing current call...');
        endCall(currentCall, localStream);
      }

      // Update call signal status - this will notify the other user
      if (callSignalId) {
        console.log('Updating call signal status to ended...');
        updateCallSignalStatus(callSignalId, 'ended');
      }

      // Reset call state
      setCallState(CALL_STATE.IDLE);
      setCallType(null);
      setCurrentCall(null);
      setCallSignalId(null);

      // Stop local stream
      if (localStream) {
        console.log('Stopping local stream tracks...');
        localStream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
          track.enabled = false; // Ensure track is disabled
        });
        setLocalStream(null);
      }

      // Stop remote stream tracks if they exist
      if (remoteStream) {
        console.log('Stopping remote stream tracks...');
        remoteStream.getTracks().forEach(track => {
          console.log(`Stopping remote track: ${track.kind}`);
          track.stop();
          track.enabled = false; // Ensure track is disabled
        });
        setRemoteStream(null);
      }

      // Force camera and microphone to be released
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          console.log('Releasing media devices...');
          stream.getTracks().forEach(track => {
            console.log(`Releasing ${track.kind} device`);
            track.stop();
          });
        })
        .catch(err => {
          // Ignore errors here, just trying to ensure devices are released
          console.log('Could not get media devices to force release');
        });

      // If we have a peer connection, close it
      if (peer) {
        console.log('Cleaning up peer connection...');
        // Don't destroy the peer, just clean up any active connections
        peer.disconnect();
      }
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to end call. Please try again.');

      // Even if there's an error, try to reset the state
      setCallState(CALL_STATE.IDLE);
      setCallType(null);
      setCurrentCall(null);
      setCallSignalId(null);
      setLocalStream(null);
      setRemoteStream(null);
    }
  };

  // Handle toggling audio
  const handleToggleAudio = (mute) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  };

  // Handle toggling video
  const handleToggleVideo = (hide) => {
    if (localStream && callType === CALL_TYPE.VIDEO) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !hide;
      });
    }
  };

  // Handle toggling music player
  const handleToggleMusic = () => {
    setShowMusicPlayer(prev => !prev);
  };

  // Handle typing status
  const handleTyping = (text) => {
    // Update the message text
    setNewMessage(text);

    // If the user is typing
    if (text.trim()) {
      // Only send typing status update if not already typing
      // This reduces the number of updates and makes the system more responsive
      if (!isTyping) {
        console.log('Setting typing status to true');
        setIsTyping(true);
        updateTypingStatus(roomCode, userId, true);
      }
    } else {
      // If the text is empty, set typing to false immediately
      if (isTyping) {
        console.log('Setting typing status to false (empty text)');
        setIsTyping(false);
        updateTypingStatus(roomCode, userId, false);
      }
      return;
    }

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to reset typing status after 1.5 seconds of inactivity
    // This is shorter to make the typing indicator more responsive
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        console.log('Setting typing status to false (timeout)');
        setIsTyping(false);
        updateTypingStatus(roomCode, userId, false);
      }
    }, 1500);
  };

  // Handle going back to home
  const handleGoBack = () => {
    navigate('/');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <FlexContainer direction="column" height="100vh">
        <LoadingSpinner />
        <Text>Loading chat room...</Text>
      </FlexContainer>
    );
  }

  if (error) {
    return (
      <FlexContainer direction="column" height="100vh">
        <Title>Error</Title>
        <Text color="var(--neon-pink)" mb="2rem">{error}</Text>
        <Button onClick={handleGoBack}>Go Back</Button>
      </FlexContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <FlexContainer justify="flex-start" gap="0.5rem" direction="column" alignItems="flex-start">
          <FlexContainer justify="flex-start" gap="0.5rem">
            <Title size="1.5rem" mb="0">Neon Chat</Title>
            <Text>Room: {getBaseCode(roomCode)}</Text>
          </FlexContainer>
          {/* Only show online/offline status here, not typing */}
          {partnerStatus && (
            <FlexContainer gap="0.5rem" alignItems="center">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: partnerStatus.is_online ? '#00ff00' : '#ff0000',
                boxShadow: partnerStatus.is_online ? '0 0 5px #00ff00' : '0 0 5px #ff0000',
                animation: partnerStatus.is_online ? 'pulseGreen 2s infinite' : 'none'
              }} />
              <Text size="0.8rem" color="var(--text-secondary)">
                {partnerStatus.is_online ? 'Online' : 'Offline'}
              </Text>
            </FlexContainer>
          )}
        </FlexContainer>

        <FlexContainer gap="0.5rem">
          {/* Call buttons */}
          {callState === CALL_STATE.IDLE && (
            <>
              <CallButton
                callType={CALL_TYPE.AUDIO}
                onClick={() => handleStartCall(CALL_TYPE.AUDIO)}
              />
              <CallButton
                callType={CALL_TYPE.VIDEO}
                onClick={() => handleStartCall(CALL_TYPE.VIDEO)}
              />
            </>
          )}
          <Button size="small" onClick={handleClearMessages}>
            Clear Chat
          </Button>
          <Button size="small" onClick={handleGoBack}>
            Exit
          </Button>
        </FlexContainer>
      </ChatHeader>

      <ChatMessages>
        {messages.length === 0 ? (
          <SystemMessage>
            No messages yet. Start the conversation!
          </SystemMessage>
        ) : (
          messages.map((message) => {
            if (message.sender === 'system') {
              return (
                <SystemMessage key={message.id}>
                  {message.content}
                </SystemMessage>
              );
            }

            const isSentByMe = message.sender === userId;

            return (
              <MessageBubble key={message.id} sent={isSentByMe}>
                <Text size="0.8rem" faded mb="0.2rem">
                  {isSentByMe ? 'You' : 'Partner'} • {formatTime(message.created_at)}
                </Text>

                {message.media_type ? (
                  <MediaMessage
                    type={message.media_type}
                    url={message.content}
                    timestamp={message.created_at}
                  />
                ) : (
                  <Text mb="0">{message.content}</Text>
                )}

                {/* Message status (read receipts) */}
                {isSentByMe && (
                  <MessageStatus
                    message={message}
                    partnerStatus={partnerStatus}
                    userId={userId}
                  />
                )}
              </MessageBubble>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        {/* Show typing indicator above the input */}
        {partnerStatus && partnerStatus.is_typing && (
          <TypingIndicator isTyping={true} />
        )}
        <EnhancedChatInput
          onSendMessage={(text) => {
            // Set the message and then send it
            setNewMessage(text);
            sendMessage(roomCode, text, userId);

            // Reset typing status
            setIsTyping(false);
            updateTypingStatus(roomCode, userId, false);
          }}
          onTyping={handleTyping}
          onSendGif={(gifUrl) => {
            console.log('Sending GIF:', gifUrl);
            return sendGifMessage(roomCode, gifUrl, userId);
          }}
          onSendImage={(file) => {
            console.log('Sending image:', file.name);
            return uploadFile(roomCode, file, 'image', userId);
          }}
          onSendVideo={(file) => {
            console.log('Sending video:', file.name);
            return uploadFile(roomCode, file, 'video', userId);
          }}
          onSendVoice={(audioBlob) => {
            console.log('Sending voice message');
            return sendVoiceMessage(roomCode, audioBlob, userId);
          }}
          partnerStatus={partnerStatus}
          onToggleMusic={handleToggleMusic}
        />
      </ChatInputContainer>

      {/* Call Interface */}
      {callState !== CALL_STATE.IDLE && (
        <CallInterface
          callState={callState}
          callType={callType}
          caller={userId}
          localStream={localStream}
          remoteStream={remoteStream}
          onAnswer={handleAnswerCall}
          onReject={handleRejectCall}
          onEnd={handleEndCall}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
        />
      )}

      {/* SoundCloud Music Player */}
      <SoundCloudPlayer
        visible={showMusicPlayer}
        onClose={handleToggleMusic}
      />
    </ChatContainer>
  );
};

export default Chat;
