"use client";

import { Box, Container, Flex, Text, IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const { toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box bg={bgColor} color={textColor} minH="100vh">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="primary.600"
        color="white"
      >
        <Flex align="center" mr={5}>
          <Link href="/dashboard">
            <Text fontSize="xl" fontWeight="bold">
              Gratitude Network
            </Text>
          </Link>
        </Flex>

        <Box>
          <IconButton
            aria-label="Toggle color mode"
            icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
        </Box>
      </Flex>
      <Container as="main" maxW="7xl" mx="auto" px={{ base: "4", sm: "6", lg: "8" }} py="8">
        {children}
      </Container>
    </Box>
  );
}