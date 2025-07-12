import React from 'react';
import { Box, Flex, Link as ChakraLink, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const logoHref = isAuthenticated ? '/feed' : '/';

  return (
    <Box bg="blue.500" px={4} shadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box>
          <ChakraLink as={NextLink} href={logoHref}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Gratitude Network
            </Text>
          </ChakraLink>
        </Box>
        <Box>
          {isAuthenticated ? (
            <Text color="white">Welcome, {user?.username}</Text>
          ) : (
            <ChakraLink as={NextLink} href="/auth/login" color="white">
              Login
            </ChakraLink>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;