import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0.1; }
`;

const Skeleton = styled(Box)`
  border-radius: var(--chakra-radii-sm);
  background: var(--chakra-colors-grey-7);
  animation: 0.8s linear infinite alternate ${fade};
`;

export default Skeleton;
