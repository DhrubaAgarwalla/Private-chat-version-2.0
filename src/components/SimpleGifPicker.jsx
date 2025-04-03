import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';

const GifContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 300px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  border-bottom: 1px solid var(--neon-purple);
  outline: none;
  
  &:focus {
    box-shadow: 0 0 5px var(--neon-purple);
  }
`;

const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  max-height: 250px;
`;

const GifItem = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 5px var(--neon-purple);
  }
`;

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const SimpleGifPicker = ({ apiKey, onGifSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch trending GIFs on component mount
  useEffect(() => {
    fetchGifs();
  }, []);
  
  // Fetch GIFs when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchGifs(searchTerm);
      } else {
        fetchGifs();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const fetchGifs = async (term = '') => {
    setLoading(true);
    try {
      let url;
      if (term) {
        url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(term)}&limit=20&rating=g`;
      } else {
        url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        setGifs(data.data);
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <GifContainer>
      <SearchInput
        type="text"
        placeholder="Search GIFs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {loading ? (
        <LoadingText>Loading GIFs...</LoadingText>
      ) : (
        <GifGrid>
          {gifs.map((gif) => (
            <GifItem
              key={gif.id}
              src={gif.images.fixed_height.url}
              alt={gif.title}
              onClick={() => onGifSelect(gif.images.original.url)}
            />
          ))}
        </GifGrid>
      )}
    </GifContainer>
  );
};

export default SimpleGifPicker;
