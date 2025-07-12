"use client";

import { Box, Heading, Text, Button, Stack, Container } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/feed');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <Layout>
      <Container maxW="container.lg" py={10} textAlign="center">
        <Stack spacing={4} as={Box} textAlign="center">
          <Heading
            as="h1"
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            fontWeight="extrabold"
            lineHeight="shorter"
            letterSpacing="tight"
          >
            Share Gratitude, Amplify Kindness
          </Heading>
          <Text color="gray.500" fontSize={{ base: "lg", md: "xl" }}>
            Join a thriving community dedicated to fostering positivity, mindfulness, and meaningful connections through the simple act of sharing daily gratitudes.
          </Text>
          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={3}
            align="center"
            alignSelf="center"
            position="relative"
          >
            <Link href="/auth/signup" passHref>
              <Button
                colorScheme="primary"
                bg="primary.500"
                color="white"
                _hover={{ bg: "primary.600" }}
                size="lg"
              >
                Start a New Gratitude Chain
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Layout>
  );
}
