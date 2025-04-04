import { useState, useRef } from 'react';
import BasicEmojiPicker from './BasicEmojiPicker';
import BasicGifPicker from './BasicGifPicker';
import MusicButton from './MusicButton';
import {
  Button,
  TextArea,
  FlexContainer,
  Text
} from '../styles/StyledComponents';
import { styled, createGlobalStyle } from 'styled-components';

// Add keyframes for typing animation
const GlobalTypingAnimation = createGlobalStyle`
  @keyframes typingAnimation {
    0%, 100% {
      transform: translateY(0);
      background-color: var(--neon-pink);
    }
    50% {
      transform: translateY(-5px);
      background-color: var(--neon-purple);
      box-shadow: 0 0 8px var(--neon-purple);
    }
  }
`;

// Styled components for the enhanced chat input
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  flex: 1;
`;

const InputToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--neon-purple);
`;

const ToolbarButton = styled.button`
  background-color: transparent;
  color: var(--neon-purple);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(177, 74, 237, 0.2);
  }

  &.active {
    background-color: rgba(177, 74, 237, 0.3);
  }
`;

const FileInputLabel = styled.label`
  background-color: transparent;
  color: var(--neon-purple);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(177, 74, 237, 0.2);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const RecordButton = styled.button`
  background-color: ${props => props.isRecording ? 'var(--neon-pink)' : 'transparent'};
  color: ${props => props.isRecording ? 'white' : 'var(--neon-purple)'};
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.isRecording ? 'var(--neon-pink)' : 'rgba(177, 74, 237, 0.2)'};
  }
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(237, 74, 74, 0.2);
  border-radius: 4px;
`;

const RecordingDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--neon-pink);
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
`;

const UploadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(74, 124, 237, 0.2);
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const UploadProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: var(--neon-blue);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const EnhancedChatInput = ({ onSendMessage, onSendGif, onSendImage, onSendVideo, onSendVoice, onTyping, onToggleMusic, partnerStatus }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState(''); // 'image', 'video', 'audio'

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Handle sending a text message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSendMessage(message);
    setMessage('');
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Show upload indicator
    setIsUploading(true);
    setUploadType('image');
    setUploadProgress(0);

    // Simulate progress (in a real app, you'd get actual progress from the upload)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    // Send the image
    onSendImage(file)
      .then(() => {
        // Complete the progress bar
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      })
      .catch(err => {
        console.error('Error uploading image:', err);
        setIsUploading(false);
        alert('Failed to upload image. Please try again.');
      });

    fileInputRef.current.value = null;
  };

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Show upload indicator
    setIsUploading(true);
    setUploadType('video');
    setUploadProgress(0);

    // Simulate progress (in a real app, you'd get actual progress from the upload)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 2; // Slower for video
      });
    }, 200);

    // Send the video
    onSendVideo(file)
      .then(() => {
        // Complete the progress bar
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      })
      .catch(err => {
        console.error('Error uploading video:', err);
        setIsUploading(false);
        alert('Failed to upload video. Please try again.');
      });

    videoInputRef.current.value = null;
  };

  // Handle voice recording
  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Show upload indicator
          setIsUploading(true);
          setUploadType('audio');
          setUploadProgress(0);

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 95) {
                clearInterval(progressInterval);
                return 95;
              }
              return prev + 10; // Faster for audio
            });
          }, 100);

          // Send the voice message
          onSendVoice(audioBlob)
            .then(() => {
              // Complete the progress bar
              setUploadProgress(100);
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
              }, 500);
            })
            .catch(err => {
              console.error('Error uploading voice message:', err);
              setIsUploading(false);
              alert('Failed to upload voice message. Please try again.');
            });

          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check your browser permissions.');
      }
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <InputContainer>
      <GlobalTypingAnimation />
      {showEmojiPicker && (
        <BasicEmojiPicker
          onSelectEmoji={emoji => {
            setMessage(prev => prev + emoji);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showGifPicker && (
        <BasicGifPicker
          onSelectGif={gifUrl => {
            console.log('GIF selected:', gifUrl);

            // Show upload indicator
            setIsUploading(true);
            setUploadType('GIF');
            setUploadProgress(50);

            // Send the GIF
            onSendGif(gifUrl);

            // Complete the progress bar
            setTimeout(() => {
              setUploadProgress(100);
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
              }, 500);
            }, 500);
          }}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      <InputToolbar>
        <ToolbarButton
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
          }}
          className={showEmojiPicker ? 'active' : ''}
        >
          😊
        </ToolbarButton>

        <ToolbarButton
          type="button"
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
          }}
          className={showGifPicker ? 'active' : ''}
        >
          GIF
        </ToolbarButton>

        <FileInputLabel>
          📷
          <FileInput
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </FileInputLabel>

        <FileInputLabel>
          🎥
          <FileInput
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={handleVideoUpload}
          />
        </FileInputLabel>

        <RecordButton
          type="button"
          onClick={handleVoiceRecording}
          isRecording={isRecording}
        >
          🎤
        </RecordButton>

        <MusicButton onClick={onToggleMusic} />
      </InputToolbar>

      {isRecording && (
        <RecordingIndicator>
          <RecordingDot />
          <Text>Recording... {formatTime(recordingTime)}</Text>
        </RecordingIndicator>
      )}

      {isUploading && (
        <UploadingIndicator>
          <UploadProgressBar progress={uploadProgress} />
          <Text>Uploading {uploadType}... {uploadProgress}%</Text>
        </UploadingIndicator>
      )}

      <FlexContainer gap="0.5rem" padding="0.5rem">
        <div style={{ position: 'relative', width: '100%' }}>
          {partnerStatus && partnerStatus.is_typing && partnerStatus.is_online && (
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(177, 74, 237, 0.2)',
              boxShadow: '0 0 5px rgba(177, 74, 237, 0.5)',
              zIndex: 5
            }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--neon-pink)',
                    animation: `typingAnimation 1.5s infinite ease-in-out ${i * 0.2}s`,
                    boxShadow: '0 0 5px var(--neon-pink)'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--neon-pink)', fontWeight: 'bold' }}>Partner is typing...</span>
            </div>
          )}
          <TextArea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping && onTyping(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            fullWidth
            minHeight="50px"
            resize="none"
            disabled={isRecording}
          />
        </div>
        <Button onClick={handleSendMessage} primary disabled={isRecording}>
          Send
        </Button>
      </FlexContainer>
    </InputContainer>
  );
};

export default EnhancedChatInput;
