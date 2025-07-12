import React from 'react';
import { Box, Flex, Link as ChakraLink, Text, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    router.push('/auth/login');
  };

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
            <Button onClick={handleLogout} colorScheme="whiteAlpha" variant="ghost">
              Logout
            </Button>
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