
'use client';

import { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Text, Link as ChakraLink } from '@chakra-ui/react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      login(response.access_token); // Use auth context login
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" mb={4} isRequired>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <FormControl id="password" mb={6} isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg" fontSize="md" width="full" isLoading={loading}>
          Login
        </Button>
      </form>
      <Text mt={4} textAlign="center">
        Don't have an account? {' '}
        <NextLink href="/signup" passHref color="blue.500">
          Sign Up
        </NextLink>
      </Text>
    </Box>
  );
}
