import { lastHistoryStateAtom } from '@/lib/navigationHistory/state';
import { Button, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { VscChevronLeft } from 'react-icons/vsc';

const NavigationBackButton = () => {
  const [lastHistory] = useAtom(lastHistoryStateAtom);

  if (!lastHistory?.href || !lastHistory.title) return null;

  return (
    <Link href={lastHistory.href} passHref>
      <Button
        size="sm"
        as="a"
        variant="subtle"
        colorScheme="grey"
        h="100%"
        leftIcon={<VscChevronLeft />}
        color="grey.12"
        bg="transparent"
        _hover={{ bg: 'grey.2' }}
        _focus={{ boxShadow: 'none' }}
        maxW="33ch"
      >
        <Text as="span" noOfLines={1}>
          {lastHistory?.title}
        </Text>
      </Button>
    </Link>
  );
};

export default NavigationBackButton;
