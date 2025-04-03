import React, { useState, useEffect, useRef } from 'react';
import { styled } from 'styled-components';
import {
  CALL_STATE,
  CALL_TYPE,
  endCall
} from '../services/callService';

const CallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CallHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const CallTitle = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 10px var(--neon-purple);
`;

const CallStatus = styled.div`
  color: ${props => {
    switch(props.status) {
      case CALL_STATE.OUTGOING: return 'var(--neon-blue)';
      case CALL_STATE.INCOMING: return 'var(--neon-purple)';
      case CALL_STATE.CONNECTED: return 'var(--neon-cyan)';
      default: return 'white';
    }
  }};
  font-size: 1rem;
`;

const CallTimer = styled.div`
  color: white;
  font-size: 1rem;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const RemoteVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #111;
  transform: scaleX(-1); /* Mirror the video for more natural appearance */
`;

const LocalVideo = styled.video`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 180px;
  height: 240px;
  object-fit: cover;
  border: 2px solid var(--neon-purple);
  border-radius: 8px;
  background-color: #222;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transform: scaleX(-1); /* Mirror the video for more natural appearance */
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1) scaleX(-1);
    box-shadow: 0 0 15px var(--neon-purple);
  }
`;

const AudioCallDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(10, 10, 15, 0.8);
  border-radius: 16px;
  border: 1px solid var(--neon-blue);
  box-shadow: 0 0 20px rgba(74, 124, 237, 0.4);
`;

const CallerInfo = styled.div`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px var(--neon-blue);
`;

const AudioWaveform = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 1rem 0;
  height: 60px;
`;

const AudioBar = styled.div`
  width: 5px;
  height: ${props => props.height}px;
  background-color: var(--neon-blue);
  border-radius: 2px;
  animation: pulse 1s infinite;
  animation-delay: ${props => props.delay}s;

  @keyframes pulse {
    0% {
      height: 10px;
    }
    50% {
      height: ${props => props.height}px;
    }
    100% {
      height: 10px;
    }
  }
`;

const CallControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
`;

const ControlButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.danger ? 'var(--neon-pink)' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background-color: ${props => props.danger ? '#ff3366' : 'rgba(255, 255, 255, 0.3)'};
  }

  &.active {
    background-color: var(--neon-purple);
  }
`;

const IncomingCallControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const AcceptButton = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: none;
  background-color: var(--neon-cyan);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px var(--neon-cyan);
  }
`;

const RejectButton = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: none;
  background-color: var(--neon-pink);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px var(--neon-pink);
  }
`;

const CallInterface = ({
  callState,
  callType,
  caller,
  localStream,
  remoteStream,
  onAnswer,
  onReject,
  onEnd,
  onToggleAudio,
  onToggleVideo
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  // Set up video streams with enhanced quality
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;

      // Apply video quality enhancements
      if (callType === CALL_TYPE.VIDEO) {
        // Set video element properties for better performance
        localVideoRef.current.setAttribute('playsinline', 'true');
        localVideoRef.current.setAttribute('autoplay', 'true');
        localVideoRef.current.muted = true;
      }
    }

    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;

      // Apply video quality enhancements
      if (callType === CALL_TYPE.VIDEO) {
        // Set video element properties for better performance
        remoteVideoRef.current.setAttribute('playsinline', 'true');
        remoteVideoRef.current.setAttribute('autoplay', 'true');

        // Add event listener to handle video playing
        const handlePlaying = () => {
          console.log('Remote video is now playing');
          // You could add additional quality enhancements here
        };

        remoteVideoRef.current.addEventListener('playing', handlePlaying);

        // Clean up event listener
        return () => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.removeEventListener('playing', handlePlaying);
          }
        };
      }
    }

    // Cleanup function to ensure streams are properly released
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [localStream, remoteStream, callType]);

  // Set up call timer
  useEffect(() => {
    if (callState === CALL_STATE.CONNECTED) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }

    // Cleanup function to ensure timer is cleared
    return () => {
      console.log('Clearing call timer');
      clearInterval(timerRef.current);
    };
  }, [callState]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle toggle audio
  const handleToggleAudio = () => {
    setIsMuted(!isMuted);
    onToggleAudio && onToggleAudio(!isMuted);
  };

  // Handle toggle video
  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo && onToggleVideo(!isVideoOff);
  };

  // Generate audio waveform bars
  const renderAudioWaveform = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <AudioBar
        key={index}
        height={20 + Math.random() * 30}
        delay={Math.random() * 0.5}
      />
    ));
  };

  // Render call status text
  const renderCallStatus = () => {
    switch (callState) {
      case CALL_STATE.OUTGOING:
        return 'Calling...';
      case CALL_STATE.INCOMING:
        return 'Incoming Call';
      case CALL_STATE.CONNECTED:
        return 'Connected';
      default:
        return '';
    }
  };

  return (
    <CallContainer>
      <CallHeader>
        <CallTitle>
          {callType === CALL_TYPE.AUDIO ? 'Audio Call' : 'Video Call'}
        </CallTitle>
        <CallStatus status={callState}>
          {renderCallStatus()}
        </CallStatus>
        {callState === CALL_STATE.CONNECTED && (
          <CallTimer>{formatDuration(callDuration)}</CallTimer>
        )}
      </CallHeader>

      {callType === CALL_TYPE.VIDEO ? (
        <VideoContainer>
          {remoteStream && (
            <RemoteVideo
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls={false}
              muted={false}
              disablePictureInPicture={false}
            />
          )}
          {localStream && (
            <LocalVideo
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              disablePictureInPicture={true}
            />
          )}
        </VideoContainer>
      ) : (
        <AudioCallDisplay>
          <CallerInfo>
            {callState === CALL_STATE.OUTGOING ? 'Calling Partner' :
             callState === CALL_STATE.INCOMING ? `Incoming call from Partner` :
             'On call with Partner'}
          </CallerInfo>
          {callState === CALL_STATE.CONNECTED && (
            <AudioWaveform>
              {renderAudioWaveform()}
            </AudioWaveform>
          )}
        </AudioCallDisplay>
      )}

      {callState === CALL_STATE.INCOMING ? (
        <IncomingCallControls>
          <AcceptButton onClick={onAnswer}>
            Accept
          </AcceptButton>
          <RejectButton onClick={onReject}>
            Decline
          </RejectButton>
        </IncomingCallControls>
      ) : (
        <CallControls>
          <ControlButton
            onClick={handleToggleAudio}
            className={isMuted ? 'active' : ''}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </ControlButton>

          {callType === CALL_TYPE.VIDEO && (
            <ControlButton
              onClick={handleToggleVideo}
              className={isVideoOff ? 'active' : ''}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? '🚫' : '📹'}
            </ControlButton>
          )}

          <ControlButton
            danger
            onClick={onEnd}
            title="End call"
          >
            📵
          </ControlButton>
        </CallControls>
      )}
    </CallContainer>
  );
};

export default CallInterface;
