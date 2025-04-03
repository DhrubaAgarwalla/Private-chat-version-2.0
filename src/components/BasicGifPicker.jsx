import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';

const GifContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
  z-index: 1000;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const GifHeader = styled.div`
  display: flex;
  padding: 8px;
  border-bottom: 1px solid var(--neon-purple);
  justify-content: space-between;
  align-items: center;
`;

const GifTitle = styled.div`
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
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  color: var(--text-primary);

  ${props => props.active && `
    background-color: rgba(177, 74, 237, 0.2);
    box-shadow: 0 0 5px rgba(177, 74, 237, 0.5);
  `}

  &:hover {
    background-color: rgba(177, 74, 237, 0.1);
  }
`;

const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  max-height: 300px;
`;

const GifItem = styled.img`
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 5px var(--neon-purple);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
`;

// Predefined GIF categories with URLs
const gifCategories = {
  reactions: [
    'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif', // thumbs up
    'https://media.giphy.com/media/DYH297XiCS2Ck/giphy.gif', // dancing
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // party
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', // clapping
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // mindblown
    'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif', // thinking
    'https://media.giphy.com/media/l378BzHA5FwWFXVSg/giphy.gif', // laughing
    'https://media.giphy.com/media/l1J9FsoKxLjK3ExRS/giphy.gif', // cool
    'https://media.giphy.com/media/l0HlvtIPzPzsOKRJS/giphy.gif', // shocked
    'https://media.giphy.com/media/l0HlGRDhPTqVEvhCw/giphy.gif', // happy
    'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif', // applause
    'https://media.giphy.com/media/26FPqAHtgCBzKG9mo/giphy.gif' // thumbs down
  ],
  greetings: [
    'https://media.giphy.com/media/3o7TKu8D1d12Eo9wSQ/giphy.gif', // hello
    'https://media.giphy.com/media/3o7TKMeCOV3oXSb5bq/giphy.gif', // hi
    'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', // hey
    'https://media.giphy.com/media/l4JyOCNEfXvVYEqB2/giphy.gif', // bye
    'https://media.giphy.com/media/42YlR8u9gV5Cw/giphy.gif', // wave
    'https://media.giphy.com/media/l0HlvGBz8LSYQlA5y/giphy.gif', // welcome
    'https://media.giphy.com/media/xUPGGDNsLvqsBOhuU0/giphy.gif', // goodbye
    'https://media.giphy.com/media/l4KhQo2MESJkc6QbS/giphy.gif' // see ya
  ],
  emotions: [
    'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', // surprised
    'https://media.giphy.com/media/l4FGJODwB6guNDteg/giphy.gif', // sad
    'https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif', // angry
    'https://media.giphy.com/media/3o7buirYcmV5nSwIRW/giphy.gif', // excited
    'https://media.giphy.com/media/l4FGpPki5v2Bcd6Ss/giphy.gif', // confused
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', // frustrated
    'https://media.giphy.com/media/3o6ZtfraiGjyNEBNiE/giphy.gif', // bored
    'https://media.giphy.com/media/26xBKJclSF8d57UWs/giphy.gif' // tired
  ],
  animals: [
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', // cat
    'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif', // dog
    'https://media.giphy.com/media/3o7TKSha51ATTx9KzC/giphy.gif', // panda
    'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif', // monkey
    'https://media.giphy.com/media/l4KhQo2MESJkc6QbS/giphy.gif', // penguin
    'https://media.giphy.com/media/3o7TKWrn9zfNhRbYPK/giphy.gif', // fox
    'https://media.giphy.com/media/3o7TKVhFwW3ZWiti8g/giphy.gif', // bunny
    'https://media.giphy.com/media/l0HlGRDhPTqVEvhCw/giphy.gif' // sloth
  ],
  memes: [
    'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', // what
    'https://media.giphy.com/media/l4FGJODwB6guNDteg/giphy.gif', // facepalm
    'https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif', // deal with it
    'https://media.giphy.com/media/3o7buirYcmV5nSwIRW/giphy.gif', // mind blown
    'https://media.giphy.com/media/l4FGpPki5v2Bcd6Ss/giphy.gif', // not sure if
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', // why
    'https://media.giphy.com/media/3o6ZtfraiGjyNEBNiE/giphy.gif', // whatever
    'https://media.giphy.com/media/26xBKJclSF8d57UWs/giphy.gif' // this is fine
  ]
};

// Flatten all GIFs for initial display
const allGifs = Object.values(gifCategories).flat();

const BasicGifPicker = ({ onSelectGif, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayedGifs, setDisplayedGifs] = useState(allGifs);
  const [loading, setLoading] = useState(true);

  // Category labels for tabs
  const categoryLabels = {
    all: 'All GIFs',
    reactions: 'Reactions',
    greetings: 'Greetings',
    emotions: 'Emotions',
    animals: 'Animals',
    memes: 'Memes'
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setDisplayedGifs(allGifs);
    } else {
      setDisplayedGifs(gifCategories[category]);
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <GifContainer>
      <GifHeader>
        <GifTitle>GIFs</GifTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </GifHeader>

      <CategoryTabs>
        {Object.keys({all: null, ...gifCategories}).map(category => (
          <CategoryTab
            key={category}
            active={activeCategory === category}
            onClick={() => handleCategoryChange(category)}
          >
            {categoryLabels[category]}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {loading ? (
        <LoadingText>Loading GIFs...</LoadingText>
      ) : (
        <GifGrid>
          {displayedGifs.map((gifUrl, index) => (
            <GifItem
              key={index}
              src={gifUrl}
              alt={`GIF ${index + 1}`}
              onClick={() => {
                onSelectGif(gifUrl);
                // Don't close the picker when selecting a GIF
                // so users can add multiple GIFs
              }}
            />
          ))}
        </GifGrid>
      )}
    </GifContainer>
  );
};

export default BasicGifPicker;
