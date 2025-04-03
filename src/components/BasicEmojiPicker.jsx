import React, { useState } from 'react';
import { styled } from 'styled-components';

const EmojiContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
  z-index: 1000;
  width: 320px;
  display: flex;
  flex-direction: column;
  max-height: 350px;
`;

const EmojiHeader = styled.div`
  display: flex;
  padding: 8px;
  border-bottom: 1px solid var(--neon-purple);
  justify-content: space-between;
  align-items: center;
`;

const EmojiTitle = styled.div`
  font-weight: bold;
  color: var(--neon-purple);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: var(--neon-pink);
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 5px;
  border-bottom: 1px solid rgba(177, 74, 237, 0.2);

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--neon-purple);
    border-radius: 3px;
  }
`;

const CategoryTab = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;

  ${props => props.active && `
    background-color: rgba(177, 74, 237, 0.2);
    box-shadow: 0 0 5px rgba(177, 74, 237, 0.5);
  `}

  &:hover {
    background-color: rgba(177, 74, 237, 0.1);
  }
`;

const EmojiGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  overflow-y: auto;
  max-height: 250px;
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(177, 74, 237, 0.2);
    transform: scale(1.1);
  }
`;

// Emoji categories
const emojiCategories = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯'
  ],
  gestures: [
    '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖',
    '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾', '🦿', '🦵', '🦶'
  ],
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
    '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋'
  ],
  food: [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
    '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
    '🌭', '🍔', '🍟', '🍕', '🌮', '🌯', '🥪', '🥙', '🧆', '🥚'
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍',
    '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶'
  ],
  activities: [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
    '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
    '🎮', '🎲', '🧩', '♟️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼'
  ],
  objects: [
    '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️',
    '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️',
    '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'
  ],
  flags: [
    '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩',
    '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸',
    '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫'
  ]
};

// Flatten all emojis for initial display
const allEmojis = Object.values(emojiCategories).flat();

const BasicEmojiPicker = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayedEmojis, setDisplayedEmojis] = useState(allEmojis);

  // Category icons for tabs
  const categoryIcons = {
    all: '🔍',
    smileys: '😀',
    gestures: '👍',
    animals: '🐱',
    food: '🍔',
    travel: '✈️',
    activities: '⚽',
    objects: '💡',
    symbols: '❤️',
    flags: '🏁'
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setDisplayedEmojis(allEmojis);
    } else {
      setDisplayedEmojis(emojiCategories[category]);
    }
  };

  return (
    <EmojiContainer>
      <EmojiHeader>
        <EmojiTitle>Emojis</EmojiTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </EmojiHeader>

      <CategoryTabs>
        {Object.keys({all: null, ...emojiCategories}).map(category => (
          <CategoryTab
            key={category}
            active={activeCategory === category}
            onClick={() => handleCategoryChange(category)}
          >
            {categoryIcons[category]} {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </CategoryTab>
        ))}
      </CategoryTabs>

      <EmojiGrid>
        {displayedEmojis.map((emoji, index) => (
          <EmojiButton
            key={index}
            onClick={() => {
              onSelectEmoji(emoji);
              // Don't close the picker when selecting an emoji
              // so users can add multiple emojis
            }}
          >
            {emoji}
          </EmojiButton>
        ))}
      </EmojiGrid>
    </EmojiContainer>
  );
};

export default BasicEmojiPicker;
