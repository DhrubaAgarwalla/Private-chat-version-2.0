import React from 'react';
import { styled } from 'styled-components';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const StatusIcon = styled.span`
  margin-left: 4px;
  color: ${props => props.seen ? 'var(--neon-cyan)' : 'var(--text-secondary)'};
  text-shadow: ${props => props.seen ? '0 0 5px var(--neon-cyan)' : 'none'};
  font-weight: ${props => props.seen ? 'bold' : 'normal'};
`;

const MessageStatus = ({ message, partnerStatus, userId }) => {
  // If it's not our message, don't show status
  if (message.sender !== userId) {
    return null;
  }

  // Simpler approach to determine if a message has been seen
  // A message is considered seen if:
  // 1. The partner has a last_read_message_id
  // 2. The message was created before the partner's last_seen timestamp

  let isSeen = false;

  if (partnerStatus && message.created_at) {
    // Get the message timestamp
    const messageTime = new Date(message.created_at).getTime();

    // Get the partner's last seen timestamp
    const partnerLastSeen = partnerStatus.last_seen ?
      new Date(partnerStatus.last_seen).getTime() : 0;

    // If the message was sent before the partner was last seen, mark it as seen
    if (messageTime < partnerLastSeen) {
      isSeen = true;
    }

    // Also check if this specific message ID is marked as read
    if (partnerStatus.last_read_message_id === message.id) {
      isSeen = true;
    }
  }

  // For debugging
  if (isSeen) {
    console.log(`Message ${message.id} is marked as seen.`);
  }

  return (
    <StatusContainer>
      {isSeen ? (
        <>
          Seen <StatusIcon seen>✓✓</StatusIcon>
        </>
      ) : (
        <>
          Sent <StatusIcon>✓</StatusIcon>
        </>
      )}
    </StatusContainer>
  );
};

export default MessageStatus;
