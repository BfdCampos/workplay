import LatestMatches from '@/components/shared/LatestMatches';
import type { getPlayerSample } from '@/lib/home';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Section from '../Section';
import type { PlayersDecoProps } from './PlayersDeco';

type PlayersBlockProps = {
  players: Awaited<ReturnType<typeof getPlayerSample>>;
};

const PlayersDeco = dynamic<PlayersDecoProps>(() => import('./PlayersDeco'), {
  ssr: false,
});

const PlayersBlock: React.FC<PlayersBlockProps> = ({ players }) => {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  return (
    <>
      <Section gridColumn="1/-1" pb={0} transform="translateZ(0)">
        <Box
          h="100%"
          w="100%"
          top="0"
          left="0"
          position="absolute"
          bg="grey.4"
          zIndex="2"
          pointerEvents="none"
          sx={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1))' }}
          borderBottomRadius="xl"
        />
        <PlayersDeco players={players} />
        <Box zIndex={1} position="relative" css={{ perspective: '1000px' }}>
          <Heading as="h2" mb={12} mt={4} textAlign="center" color="grey.10" size="lg">
            join{' '}
            <Text as="span" color="primary.9">
              heaps
            </Text>{' '}
            of{' '}
            <Text
              as="span"
              display="inline-block"
              position="relative"
              _before={{
                content: `""`,
                position: 'absolute',
                w: '100%',
                h: '.08em',
                bg: 'primary.9',
                top: '58%',
                left: 0,
              }}
            >
              unproductive
            </Text>{' '}
            great players
          </Heading>
          <Box
            aria-hidden="true"
            pointerEvents="none"
            h="400px"
            overflow="hidden"
            maxW="container.sm"
            mx="auto"
            pt={8}
            transform="rotateX(30deg)"
            transformOrigin="bottom"
          >
            <LatestMatches canLoadMore={false} canDelete={false} />
          </Box>
        </Box>
      </Section>
      {!isLoggedIn && (
        <VStack transform="translateY(-50%)" mt={-4} position="relative" zIndex="2" gridColumn="1/-1">
          <Link href="/auth/signin" passHref>
            <Button as="a" variant="primary" size="lg" m={3}>
              Sign in to play
            </Button>
          </Link>
        </VStack>
      )}
    </>
  );
};

export default PlayersBlock;
