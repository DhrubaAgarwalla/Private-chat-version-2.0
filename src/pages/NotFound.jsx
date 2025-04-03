import { useNavigate } from 'react-router-dom';
import {
  Container,
  FlexContainer,
  Title,
  Text,
  Button
} from '../styles/StyledComponents';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Container>
      <FlexContainer direction="column" height="100vh">
        <Title glow size="3rem" mb="1rem">404</Title>
        <Title size="2rem" mb="2rem">Page Not Found</Title>
        
        <Text mb="2rem">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button primary onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </FlexContainer>
    </Container>
  );
};

export default NotFound;
