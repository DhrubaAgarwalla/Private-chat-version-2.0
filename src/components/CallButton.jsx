import React from 'react';
import { styled } from 'styled-components';
import { CALL_TYPE } from '../services/callService';

const Button = styled.button`
  background-color: ${props => props.callType === CALL_TYPE.AUDIO ? 'var(--neon-blue)' : 'var(--neon-purple)'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.callType === CALL_TYPE.AUDIO 
      ? '0 0 15px rgba(74, 124, 237, 0.7)' 
      : '0 0 15px rgba(177, 74, 237, 0.7)'};
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CallButton = ({ callType, onClick, disabled }) => {
  return (
    <Button 
      callType={callType} 
      onClick={onClick} 
      disabled={disabled}
      title={callType === CALL_TYPE.AUDIO ? 'Audio Call' : 'Video Call'}
    >
      {callType === CALL_TYPE.AUDIO ? '📞' : '📹'}
    </Button>
  );
};

export default CallButton;
