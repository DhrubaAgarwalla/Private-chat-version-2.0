import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Neon Cyberpunk Color Palette */
    --bg-primary: #0a0a1a;
    --bg-secondary: #12122a;
    --neon-purple: #b14aed;
    --neon-blue: #4a7ced;
    --neon-pink: #ed4aed;
    --text-primary: #ffffff;
    --text-secondary: #b3b3cc;
    --grid-color: rgba(177, 74, 237, 0.1);
    --glow-purple: 0 0 10px rgba(177, 74, 237, 0.7);
    --glow-blue: 0 0 10px rgba(74, 124, 237, 0.7);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Rajdhani', 'Orbitron', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(var(--grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: 30px 30px;
    z-index: -1;
    perspective: 1000px;
    transform-style: preserve-3d;
  }

  a {
    color: var(--neon-purple);
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      text-shadow: var(--glow-purple);
    }
  }

  button {
    font-family: 'Rajdhani', 'Orbitron', sans-serif;
    background-color: transparent;
    color: var(--neon-purple);
    border: 1px solid var(--neon-purple);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    
    &:hover {
      background-color: rgba(177, 74, 237, 0.2);
      box-shadow: var(--glow-purple);
    }
    
    &:active {
      transform: translateY(2px);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  input, textarea {
    font-family: 'Rajdhani', 'Orbitron', sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--neon-purple);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    outline: none;
    transition: all 0.3s ease;
    
    &:focus {
      box-shadow: var(--glow-purple);
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--neon-purple);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--neon-pink);
  }

  /* Animations */
  @keyframes glow {
    0% {
      text-shadow: 0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple);
    }
    50% {
      text-shadow: 0 0 10px var(--neon-purple), 0 0 20px var(--neon-purple), 0 0 30px var(--neon-purple);
    }
    100% {
      text-shadow: 0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
    
    button {
      padding: 0.4rem 0.8rem;
    }
  }
`;

export default GlobalStyles;
