
'use client';

import { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Text } from '@chakra-ui/react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup({ email, username, password });
      toast.success('Account created successfully! Please log in.');
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Signup failed.');
      } else {
        toast.error('Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>Sign Up</Heading>
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
        <FormControl id="username" mb={4} isRequired>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </FormControl>
        <FormControl id="password" mb={6} isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg" fontSize="md" width="full" isLoading={loading}>
          Sign Up
        </Button>
      </form>
      <Text mt={4} textAlign="center">
        Already have an account? {' '}
        <NextLink href="/login" passHref color="blue.500">
          Login
        </NextLink>
      </Text>
    </Box>
  );
}
