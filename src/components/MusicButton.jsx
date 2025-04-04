import React from 'react';
import { styled } from 'styled-components';

const Button = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(177, 74, 237, 0.2);
    color: var(--neon-purple);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MusicButton = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick}
      title="Music Player"
      aria-label="Open Music Player"
    >
      🎵
    </Button>
  );
};

export default MusicButton;
