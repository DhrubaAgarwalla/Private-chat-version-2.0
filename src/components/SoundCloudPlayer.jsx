import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 300px;
  height: ${props => props.expanded ? '350px' : '60px'};
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--neon-purple);
  box-shadow: 0 0 15px rgba(177, 74, 237, 0.8);
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 100;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const PlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgba(177, 74, 237, 0.4);
  height: 40px;
  border-bottom: 1px solid var(--neon-purple);

  &:hover {
    background-color: rgba(177, 74, 237, 0.6);
  }
`;

const PlayerTitle = styled.div`
  color: var(--neon-purple);
  font-weight: bold;
  text-shadow: 0 0 5px rgba(177, 74, 237, 0.5);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--neon-purple);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    text-shadow: 0 0 8px var(--neon-purple);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--neon-pink);
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    text-shadow: 0 0 8px var(--neon-pink);
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 260px;
`;

const PlaylistSelector = styled.div`
  padding: 5px 10px;
  background-color: rgba(177, 74, 237, 0.1);
  border-top: 1px solid rgba(177, 74, 237, 0.3);
`;

const PlaylistSelect = styled.select`
  width: 100%;
  padding: 5px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--neon-purple);
  border-radius: 4px;
  outline: none;
  font-size: 0.8rem;

  &:focus {
    box-shadow: 0 0 5px var(--neon-purple);
  }

  option {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
`;

const SoundCloudPlayer = ({ visible, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(0);

  // Define multiple playlists
  const playlists = [
    {
      id: 'playlist1',
      name: 'Salman Khan Sikandar Movie Songs',
      url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1980942324&color=%23c03cb0&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true'
    },
    {
      id: 'playlist2',
      name: 'Hindi Lofi Songs | Bollywood Sad Songs',
      url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1943454671&color=%23743c74&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true'
    },
    {
      id: 'playlist3',
      name: 'Bollywood Hits',
      url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1566174236&color=%23c03cb0&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true'
    }
  ];

  // Save the expanded state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('soundCloudPlayerExpanded');
    if (savedState !== null) {
      setExpanded(savedState === 'true');
    }
  }, []);

  // Update localStorage when expanded state changes
  useEffect(() => {
    localStorage.setItem('soundCloudPlayerExpanded', expanded.toString());
  }, [expanded]);

  // Handle playlist change
  const handlePlaylistChange = (e) => {
    setSelectedPlaylist(parseInt(e.target.value));
  };

  // Handle toggle expand/collapse
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <PlayerContainer expanded={expanded} visible={visible}>
      <PlayerHeader>
        <PlayerTitle onClick={handleToggle}>🎵 {playlists[selectedPlaylist].name}</PlayerTitle>
        <div>
          <ToggleButton onClick={handleToggle}>{expanded ? '▼' : '▲'}</ToggleButton>
          <CloseButton onClick={onClose}>×</CloseButton>
        </div>
      </PlayerHeader>

      {expanded && (
        <PlaylistSelector>
          <PlaylistSelect value={selectedPlaylist} onChange={handlePlaylistChange}>
            {playlists.map((playlist, index) => (
              <option key={playlist.id} value={index}>
                {playlist.name}
              </option>
            ))}
          </PlaylistSelect>
        </PlaylistSelector>
      )}

      <IframeContainer>
        <iframe
          width="100%"
          height="260"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={playlists[selectedPlaylist].url}
          title="SoundCloud Player"
        ></iframe>
      </IframeContainer>
    </PlayerContainer>
  );
};

export default SoundCloudPlayer;
