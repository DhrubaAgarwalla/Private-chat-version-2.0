import { v4 as uuidv4 } from 'uuid';

// Generate a random room code in the format XXXX-XXXX-XXXX-X
export const generateRoomCode = (suffix) => {
  // Generate a random UUID and take the first 12 characters
  const uuid = uuidv4().replace(/-/g, '').substring(0, 12);
  
  // Format it as XXXX-XXXX-XXXX
  const formattedUuid = `${uuid.substring(0, 4)}-${uuid.substring(4, 8)}-${uuid.substring(8, 12)}`;
  
  // Add the suffix (1 or 2)
  return `${formattedUuid}-${suffix}`;
};

// Generate a pair of room codes (one ending with 1, one with 2)
export const generateRoomCodePair = () => {
  // Generate the base code (without suffix)
  const uuid = uuidv4().replace(/-/g, '').substring(0, 12);
  const baseCode = `${uuid.substring(0, 4)}-${uuid.substring(4, 8)}-${uuid.substring(8, 12)}`;
  
  // Return both codes
  return {
    code1: `${baseCode}-1`,
    code2: `${baseCode}-2`
  };
};

// Extract the base code (without the suffix)
export const getBaseCode = (roomCode) => {
  if (!roomCode) return null;
  
  // Remove the suffix (last 2 characters: "-1" or "-2")
  return roomCode.substring(0, roomCode.length - 2);
};

// Get the partner code (if you have code ending with 1, get code ending with 2 and vice versa)
export const getPartnerCode = (roomCode) => {
  if (!roomCode) return null;
  
  const baseCode = getBaseCode(roomCode);
  const suffix = roomCode.endsWith('1') ? '2' : '1';
  
  return `${baseCode}-${suffix}`;
};
