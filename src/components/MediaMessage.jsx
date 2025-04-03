import { useState } from 'react';
import { styled } from 'styled-components';
import { Text } from '../styles/StyledComponents';

// Styled components for media messages
const MediaContainer = styled.div`
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  background-color: #000;
`;

const AudioPlayer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(177, 74, 237, 0.1);
  border-radius: 8px;
  width: 100%;
`;

const PlayButton = styled.button`
  background-color: var(--neon-purple);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: var(--neon-pink);
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: var(--neon-purple);
    border-radius: 2px;
  }
`;

const GifPreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const FullscreenImage = styled.img`
  max-width: 90%;
  max-height: 90%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
`;

const MediaMessage = ({ type, url, timestamp }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [audio] = useState(type === 'audio' ? new Audio(url) : null);
  
  // Handle audio playback
  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      
      // Update progress
      audio.ontimeupdate = () => {
        const percentage = (audio.currentTime / audio.duration) * 100;
        setProgress(percentage);
      };
      
      // Reset when finished
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
    }
  };
  
  // Render different media types
  const renderMedia = () => {
    switch (type) {
      case 'image':
        return (
          <>
            <ImagePreview 
              src={url} 
              alt="Shared image" 
              onClick={() => setFullscreen(true)}
            />
            {fullscreen && (
              <FullscreenOverlay onClick={() => setFullscreen(false)}>
                <FullscreenImage src={url} alt="Fullscreen image" />
                <CloseButton onClick={() => setFullscreen(false)}>×</CloseButton>
              </FullscreenOverlay>
            )}
          </>
        );
        
      case 'video':
        return (
          <VideoPreview controls>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </VideoPreview>
        );
        
      case 'audio':
        return (
          <AudioPlayer>
            <PlayButton onClick={toggleAudio}>
              {isPlaying ? '⏸' : '▶'}
            </PlayButton>
            <ProgressBar progress={progress} />
            <Text size="0.8rem">
              {isPlaying ? 'Playing...' : 'Voice message'}
            </Text>
          </AudioPlayer>
        );
        
      case 'gif':
        return <GifPreview src={url} alt="GIF" />;
        
      default:
        return <Text>Unsupported media type</Text>;
    }
  };
  
  return (
    <MediaContainer>
      {renderMedia()}
    </MediaContainer>
  );
};

export default MediaMessage;
