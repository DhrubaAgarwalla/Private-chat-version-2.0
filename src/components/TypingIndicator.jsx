import React from 'react';
import { styled } from 'styled-components';

const TypingContainer = styled.div`
  position: absolute;
  top: -20px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  border: 1px solid var(--neon-pink);
  box-shadow: 0 0 5px var(--neon-pink);
  z-index: 5;
`;

const TypingDots = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Dot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--neon-pink);
  animation: typingAnimation 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
  
  @keyframes typingAnimation {
    0%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    50% {
      transform: translateY(-3px);
      opacity: 1;
      box-shadow: 0 0 5px var(--neon-pink);
    }
  }
`;

const TypingText = styled.span`
  font-size: 0.75rem;
  color: var(--neon-pink);
  font-weight: bold;
`;

const TypingIndicator = ({ isTyping }) => {
  if (!isTyping) return null;
  
  return (
    <TypingContainer>
      <TypingDots>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </TypingDots>
      <TypingText>Partner is typing...</TypingText>
    </TypingContainer>
  );
};

export default TypingIndicator;
