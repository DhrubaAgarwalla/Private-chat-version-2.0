import React from 'react';
import { styled } from 'styled-components';

// Common emojis that work across platforms
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
  '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
  '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
  '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦',
  '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
  '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎',
  '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘',
  '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚',
  '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙇', '💁',
  '🙅', '🙆', '🙋', '🤦', '🤷', '❤️', '🧡', '💛', '💚', '💙',
  '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗',
  '💖', '💘', '💝', '💟', '🌹', '🌸', '💐', '🍀', '🍁', '🍂',
  '🍃', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵',
  '🌾', '🌿', '☘️', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🦪',
  '🐚', '🌊', '✨', '🌟', '💫', '⭐', '🔥', '💥', '☄️', '⚡',
  '❄️', '☃️', '⛄', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️',
  '🌧️', '⛈️', '🌩️', '🌨️', '💧', '💦', '☔', '☂️', '🌬️', '🌀'
];

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const EmojiButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(177, 74, 237, 0.2);
    transform: scale(1.2);
  }
`;

const SimpleEmojiPicker = ({ onEmojiSelect }) => {
  return (
    <EmojiGrid>
      {commonEmojis.map((emoji, index) => (
        <EmojiButton 
          key={index} 
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </EmojiButton>
      ))}
    </EmojiGrid>
  );
};

export default SimpleEmojiPicker;
