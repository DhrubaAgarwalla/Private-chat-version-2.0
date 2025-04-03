import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomCodePair } from '../utils/roomCode';
import { createRoom } from '../services/supabase';
import {
  Container,
  FlexContainer,
  Card,
  Title,
  Subtitle,
  Text,
  Button,
  Input,
  CodeDisplay,
  CodeText,
  CopyButton,
  LoadingSpinner
} from '../styles/StyledComponents';

const Home = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate new room codes
  const handleGenerateCode = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate a pair of room codes
      const codes = generateRoomCodePair();

      // Create the room in Supabase (only need to create once since both codes point to the same room)
      await createRoom(codes.code1);

      setGeneratedCodes(codes);
    } catch (err) {
      console.error('Error generating room:', err);
      setError('Failed to generate room codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing room
  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    // Validate the format (XXXX-XXXX-XXXX-X)
    const codeRegex = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[12]$/;
    if (!codeRegex.test(joinCode)) {
      setError('Invalid room code format. Please use the format XXXX-XXXX-XXXX-X');
      return;
    }

    // Navigate to the chat room
    navigate(`/chat/${joinCode}`);
  };

  // Copy room code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied ${code} to clipboard!`);
  };

  // Enter chat with the generated code
  const enterChat = (code) => {
    navigate(`/chat/${code}`);
  };

  return (
    <Container>
      <FlexContainer direction="column" height="100vh">
        <Title glow size="3rem" align="center" mb="2rem">
          Neon Chat
        </Title>

        <Subtitle align="center" mb="3rem">
          Anonymous Real-Time Messaging
        </Subtitle>

        <FlexContainer direction="column" gap="2rem" width="100%" maxWidth="600px">
          {/* Join Existing Room */}
          <Card>
            <Subtitle mb="1rem">Join a Room</Subtitle>
            <Text mb="1.5rem">
              Enter a room code to join an existing chat room.
            </Text>

            <FlexContainer gap="0.5rem">
              <Input
                type="text"
                placeholder="XXXX-XXXX-XXXX-X"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                fullWidth
              />
              <Button onClick={handleJoinRoom}>
                Join
              </Button>
            </FlexContainer>
          </Card>

          {/* Create New Room */}
          <Card>
            <Subtitle mb="1rem">Create a New Room</Subtitle>
            <Text mb="1.5rem">
              Generate a pair of room codes to start a new chat.
            </Text>

            <Button
              onClick={handleGenerateCode}
              primary
              fullWidth
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="20px" margin="0" /> : 'Generate Room Codes'}
            </Button>

            {generatedCodes && (
              <FlexContainer direction="column" gap="1rem" style={{ marginTop: '1.5rem' }}>
                <Text>Share one of these codes with your chat partner:</Text>

                <CodeDisplay>
                  <CodeText onClick={() => copyToClipboard(generatedCodes.code1)}>
                    {generatedCodes.code1}
                  </CodeText>
                  <CopyButton onClick={() => copyToClipboard(generatedCodes.code1)}>
                    Copy
                  </CopyButton>
                </CodeDisplay>

                <CodeDisplay>
                  <CodeText onClick={() => copyToClipboard(generatedCodes.code2)}>
                    {generatedCodes.code2}
                  </CodeText>
                  <CopyButton onClick={() => copyToClipboard(generatedCodes.code2)}>
                    Copy
                  </CopyButton>
                </CodeDisplay>

                <FlexContainer gap="1rem" style={{ marginTop: '1rem' }}>
                  <Button
                    onClick={() => enterChat(generatedCodes.code1)}
                    fullWidth
                  >
                    Enter Chat 1
                  </Button>
                  <Button
                    onClick={() => enterChat(generatedCodes.code2)}
                    fullWidth
                  >
                    Enter Chat 2
                  </Button>
                </FlexContainer>
              </FlexContainer>
            )}
          </Card>

          {error && (
            <Text color="var(--neon-pink)" align="center">
              {error}
            </Text>
          )}
        </FlexContainer>
      </FlexContainer>
    </Container>
  );
};

export default Home;
