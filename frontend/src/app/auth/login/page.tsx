"use client";

import Link from "next/link";
import { Button, Input, Box, Flex, Stack, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Import toast

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Login failed. Please check your credentials.";
        toast.error(errorMessage); // Display error to user
        console.error("Login failed:", errorMessage);
        setPassword(""); // Clear password on failed attempt
        return; // Stop execution here
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      toast.success("Login successful!"); // Display success to user
      console.log("Login successful!");
      router.push("/feed");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Login error: ${error.message}`); // Display error to user
        console.error("Login error:", error.message);
      } else {
        toast.error("An unknown error occurred during login."); // Display error to user
        console.error("An unknown error occurred during login.", error);
      }
      setPassword(""); // Clear password on any error
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
          Welcome Back!
        </Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
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
            Login
          </Button>
        </Stack>
        <Box mt={6} textAlign="center" color="gray.600">
          <Text>Or login with:</Text>
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
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" passHref>
            <Text as="span" color="primary.600" _hover={{ textDecoration: "underline" }} fontWeight="medium">
              Sign Up
            </Text>
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}