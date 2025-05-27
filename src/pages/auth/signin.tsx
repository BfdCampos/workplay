import { Button, Center, Container, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken, getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaGoogle } from 'react-icons/fa';
import Logo from '@/components/shared/Logo';
import SEO from '@/components/shared/SEO';

export default function SignIn({
  providers,
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { callbackUrl } = router.query;

  // Filter out credentials provider for production
  const filteredProviders = providers
    ? Object.values(providers).filter(
        (provider) => provider.id !== 'credentials'
      )
    : [];

  // Sort providers to put Google first
  const sortedProviders = filteredProviders.sort((a, b) => {
    if (a.id === 'google') return -1;
    if (b.id === 'google') return 1;
    return 0;
  });

  return (
    <>
      <SEO title="Sign In" />
      <Center minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Logo />
            <VStack spacing={3}>
              <Heading size="xl">Welcome to wrkplay</Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                Sign in to track your office game performance
              </Text>
            </VStack>

            <Stack spacing={4} w="full">
              {sortedProviders.map((provider) => (
                <Button
                  key={provider.name}
                  onClick={() =>
                    signIn(provider.id, {
                      callbackUrl: (callbackUrl as string) || '/',
                    })
                  }
                  size="lg"
                  colorScheme={provider.id === 'google' ? 'blue' : 'gray'}
                  leftIcon={provider.id === 'google' ? <FaGoogle /> : undefined}
                  w="full"
                >
                  Sign in with {provider.name}
                </Button>
              ))}
            </Stack>

            {process.env.NODE_ENV !== 'production' && (
              <Button
                onClick={() =>
                  signIn('credentials', {
                    callbackUrl: (callbackUrl as string) || '/',
                  })
                }
                variant="ghost"
                size="sm"
              >
                Dev Login
              </Button>
            )}
          </VStack>
        </Container>
      </Center>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

  return {
    props: { providers, csrfToken },
  };
}