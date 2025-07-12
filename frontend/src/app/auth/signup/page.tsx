"use client";

import Link from "next/link";
import { Button, Input, Box, Flex, Stack, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Import toast

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Signup failed. Please try again.";
        toast.error(errorMessage); // Display error to user
        console.error("Signup failed:", errorMessage);
        return; // Stop execution here
      }

      toast.success("Signup successful! Please check your email for verification."); // Display success to user
      console.log("Signup successful! Please check your email for verification.");
      setUsername(""); // Clear form fields on success
      setEmail("");
      setPassword("");
      router.push("/auth/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Signup error: ${error.message}`); // Display error to user
        console.error("Signup error:", error.message);
      } else {
        toast.error("An unknown error occurred during signup."); // Display error to user
        console.error("An unknown error occurred during signup.", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, primary.50, accent.100)"
    >
      <Box bg="white" p={8} rounded="lg" shadow="xl" w="full" maxW="md">
        <Heading as="h2" size="xl" textAlign="center" color="primary.700" mb={6}>
          Join Gratitude Network
        </Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" width="full" isLoading={loading} colorScheme="primary">
            Sign Up
          </Button>
        </Stack>
        <Box mt={6} textAlign="center" color="gray.600">
          <Text>Or sign up with:</Text>
          <Flex justify="center" mt={3} gap={3}>
            <Button variant="outline" flex={1} isDisabled={true}>
              Google
            </Button>
            <Button variant="outline" flex={1} isDisabled={true}>
              Facebook
            </Button>
          </Flex>
        </Box>
        <Text mt={6} textAlign="center" color="gray.600" fontSize="sm">
          Already have an account?{" "}
          <Link href="/auth/login" passHref>
            <Text as="span" color="primary.600" _hover={{ textDecoration: "underline" }} fontWeight="medium">
              Login
            </Text>
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}