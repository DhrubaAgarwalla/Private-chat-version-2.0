import React from 'react';
import { styled } from 'styled-components';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? '#00ff00' : '#ff0000'};
  box-shadow: ${props => props.isOnline ? '0 0 5px #00ff00' : '0 0 5px #ff0000'};
  animation: ${props => props.isOnline ? 'pulseGreen 2s infinite' : 'none'};

  @keyframes pulseGreen {
    0% {
      box-shadow: 0 0 5px #00ff00;
    }
    50% {
      box-shadow: 0 0 10px #00ff00, 0 0 15px #00ff00;
    }
    100% {
      box-shadow: 0 0 5px #00ff00;
    }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--neon-pink);
  animation: typingAnimation 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 5px var(--neon-pink);

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

const StatusText = styled.span`
  font-style: italic;
`;

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Never';

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffInSeconds = Math.floor((now - lastSeenDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

const StatusIndicator = ({ status, showTypingOnly = false }) => {
  if (!status) {
    return showTypingOnly ? null : (
      <StatusContainer>
        <OnlineIndicator isOnline={false} />
        <StatusText>Offline</StatusText>
      </StatusContainer>
    );
  }

  const { is_online, is_typing, last_seen } = status;

  // If we only want to show typing status
  if (showTypingOnly) {
    if (is_typing) {
      return (
        <StatusContainer>
          <TypingIndicator>
            <TypingDot delay={0} />
            <TypingDot delay={0.2} />
            <TypingDot delay={0.4} />
          </TypingIndicator>
          <StatusText style={{ color: 'var(--neon-pink)', fontWeight: 'bold' }}>Typing...</StatusText>
        </StatusContainer>
      );
    }
    return null;
  }

  // Otherwise show online/offline status
  if (is_online) {
    return (
      <StatusContainer>
        <OnlineIndicator isOnline={true} />
        <StatusText>Online</StatusText>
      </StatusContainer>
    );
  }

  return (
    <StatusContainer>
      <OnlineIndicator isOnline={false} />
      <StatusText>Last seen {formatLastSeen(last_seen)}</StatusText>
    </StatusContainer>
  );
};

export default StatusIndicator;
