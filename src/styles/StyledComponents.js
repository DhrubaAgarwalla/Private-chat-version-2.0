import styled, { keyframes } from 'styled-components';

// Animations
const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple);
  }
  50% {
    box-shadow: 0 0 10px var(--neon-purple), 0 0 20px var(--neon-purple), 0 0 30px var(--neon-purple);
  }
  100% {
    box-shadow: 0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Layout Components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: 100%;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'center'};
  align-items: ${props => props.align || 'center'};
  gap: ${props => props.gap || '1rem'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  width: ${props => props.width || 'auto'};
  height: ${props => props.height || 'auto'};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(250px, 1fr))'};
  gap: ${props => props.gap || '1rem'};
  width: 100%;
`;

// UI Components
export const Card = styled.div`
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  animation: ${slideIn} 0.3s ease;

  &:hover {
    box-shadow: var(--glow-purple);
  }
`;

export const Button = styled.button`
  background-color: ${props => props.primary ? 'var(--neon-purple)' : 'transparent'};
  color: ${props => props.primary ? 'var(--bg-primary)' : 'var(--neon-purple)'};
  border: 1px solid var(--neon-purple);
  padding: ${props => props.size === 'large' ? '0.75rem 1.5rem' : props.size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem'};
  border-radius: 4px;
  font-size: ${props => props.size === 'large' ? '1.2rem' : props.size === 'small' ? '0.8rem' : '1rem'};
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  &:hover {
    background-color: ${props => props.primary ? 'var(--neon-purple)' : 'rgba(177, 74, 237, 0.2)'};
    box-shadow: ${props => props.glow ? glowAnimation : 'var(--glow-purple)'};
    animation: ${props => props.glow ? glowAnimation : 'none'} 1.5s infinite;
  }

  &:active {
    transform: translateY(2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
  }
`;

export const Input = styled.input`
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--neon-purple);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    box-shadow: var(--glow-purple);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

export const TextArea = styled.textarea`
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--neon-purple);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  min-height: ${props => props.minHeight || '100px'};
  outline: none;
  resize: ${props => props.resize || 'vertical'};
  transition: all 0.3s ease;

  &:focus {
    box-shadow: var(--glow-purple);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

// Typography
export const Title = styled.h1`
  color: var(--text-primary);
  font-size: ${props => props.size || '2.5rem'};
  margin-bottom: ${props => props.mb || '1rem'};
  text-align: ${props => props.align || 'left'};
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.spacing || 'normal'};
  font-weight: ${props => props.weight || 'bold'};

  ${props => props.glow && `
    text-shadow: var(--glow-purple);
    animation: glow 1.5s infinite;
  `}
`;

export const Subtitle = styled.h2`
  color: var(--text-primary);
  font-size: ${props => props.size || '1.8rem'};
  margin-bottom: ${props => props.mb || '0.8rem'};
  text-align: ${props => props.align || 'left'};
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.spacing || 'normal'};
  font-weight: ${props => props.weight || 'bold'};

  ${props => props.glow && `
    text-shadow: var(--glow-purple);
    animation: glow 1.5s infinite;
  `}
`;

export const Text = styled.p`
  color: ${props => props.color || 'var(--text-primary)'};
  font-size: ${props => props.size || '1rem'};
  margin-bottom: ${props => props.mb || '0.5rem'};
  text-align: ${props => props.align || 'left'};
  line-height: ${props => props.lineHeight || '1.5'};
  opacity: ${props => props.faded ? '0.7' : '1'};

  ${props => props.glow && `
    text-shadow: var(--glow-purple);
  `}
`;

// Chat specific components
export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2rem);
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--bg-secondary);
  border: 1px solid var(--neon-purple);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--glow-purple);
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(177, 74, 237, 0.1);
  border-bottom: 1px solid var(--neon-purple);
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  /* Add a subtle gradient overlay at the top when scrolling */
  background:
    linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 10%),
    var(--bg-secondary);
`;

export const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  animation: ${slideIn} 0.3s ease;
  word-break: break-word;
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};

  ${props => props.sent ? `
    background-color: rgba(177, 74, 237, 0.3);
    border: 1px solid var(--neon-purple);
  ` : `
    background-color: rgba(74, 124, 237, 0.2);
    border: 1px solid var(--neon-blue);
  `}

  &:hover {
    box-shadow: ${props => props.sent ? 'var(--glow-purple)' : 'var(--glow-blue)'};
  }
`;

export const ChatInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: rgba(177, 74, 237, 0.1);
  border-top: 1px solid var(--neon-purple);
  position: relative; /* For positioning the typing indicator */
`;

export const SystemMessage = styled.div`
  text-align: center;
  padding: 0.5rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
  animation: ${slideIn} 0.3s ease;
`;

export const CodeDisplay = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--neon-purple);
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  position: relative;

  &::before {
    content: 'Room Code';
    position: absolute;
    top: -10px;
    left: 10px;
    background-color: var(--bg-primary);
    padding: 0 0.5rem;
    font-size: 0.8rem;
    color: var(--neon-purple);
  }
`;

export const CodeText = styled.div`
  font-size: 1.5rem;
  letter-spacing: 2px;
  color: var(--neon-purple);
  text-shadow: var(--glow-purple);
  text-align: center;
  user-select: all;
  cursor: pointer;

  &:hover {
    animation: glow 1.5s infinite;
  }
`;

export const CopyButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--neon-purple);
  cursor: pointer;

  &:hover {
    text-shadow: var(--glow-purple);
  }
`;

// Loading and status indicators
export const LoadingSpinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid rgba(177, 74, 237, 0.3);
  border-top: 3px solid var(--neon-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: ${props => props.margin || '1rem auto'};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const StatusIndicator = styled.div`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${props =>
    props.status === 'online' ? '#4CAF50' :
    props.status === 'away' ? '#FFC107' :
    props.status === 'offline' ? '#F44336' :
    'var(--neon-purple)'
  };
  box-shadow: 0 0 5px ${props =>
    props.status === 'online' ? '#4CAF50' :
    props.status === 'away' ? '#FFC107' :
    props.status === 'offline' ? '#F44336' :
    'var(--neon-purple)'
  };
`;
