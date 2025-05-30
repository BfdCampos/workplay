import type { FCC } from '@/types';
import type { ChakraProps } from '@chakra-ui/react';
import { Box, FormControl, Heading, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { VscChevronRight } from 'react-icons/vsc';

const Item: FCC<{ label?: ReactNode; htmlFor?: string }> = ({ children, label, htmlFor }) => {
  return (
    <FormControl
      fontSize="sm"
      as="li"
      display="flex"
      py={2}
      px={4}
      alignItems="center"
      minH="4rem"
      justifyContent="space-between"
      bg="grey.3"
    >
      {label && (
        <Text as="label" color="grey.12" htmlFor={htmlFor} pr={4} flex={1} noOfLines={1}>
          {label}
        </Text>
      )}
      {children}
    </FormControl>
  );
};

type ActionProps = {
  href: string;
  icon?: ReactNode;
  helper?: string;
  highlight?: boolean;
  showChevron?: boolean;
} & ChakraProps;
const Action: FCC<ActionProps> = ({ children, href, icon, helper, showChevron = true, highlight, ...props }) => {
  const mode = useColorModeValue('', 'Dark');

  return (
    <Box
      as="li"
      bg="grey.3"
      color={highlight ? 'primary.10' : undefined}
      _hover={{ bg: highlight ? `primary${mode}.4` : 'grey.4' }}
      _active={{ bg: highlight ? `primary${mode}.5` : 'grey.5' }}
    >
      <Link href={href} passHref>
        <HStack
          fontSize="md"
          as="a"
          display="flex"
          py={2}
          px={4}
          minH="4rem"
          justifyContent="space-between"
          spacing={4}
          {...props}
        >
          <Box
            w="1.5em"
            h="1.5em"
            bg={icon ? 'grey.1' : undefined}
            borderRadius="lg"
            lineHeight={'1.5em'}
            textAlign="center"
          >
            {icon}
          </Box>
          <Box flexGrow={1}>
            {children}
            {!!helper && (
              <Box fontSize="sm" color="grey.10">
                {helper}
              </Box>
            )}
          </Box>
          {showChevron && (
            <Box px={2}>
              <VscChevronRight />
            </Box>
          )}
        </HStack>
      </Link>
    </Box>
  );
};

const List: FCC<{ label?: ReactNode } & ChakraProps> = ({ children, label, ...props }) => {
  return (
    <Box {...props}>
      {label && (
        <Heading size="sm" mb={4} pl={4}>
          {label}
        </Heading>
      )}
      <Stack
        as="ul"
        listStyleType="none"
        spacing={0.5}
        sx={{ '&>*:first-of-type': { borderTopRadius: 'xl' }, '&>*:last-child': { borderBottomRadius: 'xl' } }}
      >
        {children}
      </Stack>
    </Box>
  );
};

const Settings = { List, Item, Link: Action };
export default Settings;
