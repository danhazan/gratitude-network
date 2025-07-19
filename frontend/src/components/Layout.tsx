"use client";

import { Box, Flex, Text, useColorMode, useColorModeValue, IconButton, Spacer, Button, HStack, VStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from "@chakra-ui/react";
import { SunIcon, MoonIcon, HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { SearchBar } from './Search/SearchBar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?q=${query}`);
      onClose(); // Close drawer on search
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    router.push('/auth/login');
    onClose(); // Close drawer on logout
  };

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
          <Link href="/">
            <Text fontSize="xl" fontWeight="bold">
              Gratitude Network
            </Text>
          </Link>
        </Flex>

        <Box flexBasis={{ base: '100%', md: 'auto' }} width={{ base: '100%', md: '300px' }} mt={{ base: 4, md: 0 }}>
          <SearchBar onSearch={handleSearch} />
        </Box>

        <Spacer />

        {/* Desktop Navigation */}
        <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
          {isAuthenticated ? (
            <HStack spacing={4}>
              <Link href="/feed">
                <Button variant="ghost" colorScheme="whiteAlpha">Feed</Button>
              </Link>
              {user && (
                <Link href={`/profiles/${user.id}`}>
                  <Button variant="ghost" colorScheme="whiteAlpha">My Profile</Button>
                </Link>
              )}
              <Button variant="ghost" colorScheme="whiteAlpha" onClick={handleLogout}>Logout</Button>
            </HStack>
          ) : (
            <HStack spacing={4}>
              <Link href="/auth/login">
                <Button variant="ghost" colorScheme="whiteAlpha">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="ghost" colorScheme="whiteAlpha">Sign Up</Button>
              </Link>
            </HStack>
          )}
          <IconButton
            aria-label="Toggle color mode"
            icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="whiteAlpha"
            ml={4}
          />
        </Box>

        {/* Mobile Navigation Toggle */}
        <IconButton
          aria-label="Open Menu"
          icon={<HamburgerIcon />}
          size="lg"
          mr={2}
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }}
          colorScheme="whiteAlpha"
        />
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="primary.600" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
          <DrawerBody>
            <VStack as="nav" spacing={4} alignItems="flex-start">
              {isAuthenticated ? (
                <>
                  <Link href="/feed" onClick={onClose}>
                    <Button variant="ghost" colorScheme="whiteAlpha" width="full" justifyContent="flex-start">Feed</Button>
                  </Link>
                  {user && (
                    <Link href={`/profiles/${user.id}`} onClick={onClose}>
                      <Button variant="ghost" colorScheme="whiteAlpha" width="full" justifyContent="flex-start">My Profile</Button>
                    </Link>
                  )}
                  <Button variant="ghost" colorScheme="whiteAlpha" onClick={handleLogout} width="full" justifyContent="flex-start">Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={onClose}>
                    <Button variant="ghost" colorScheme="whiteAlpha" width="full" justifyContent="flex-start">Login</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={onClose}>
                    <Button variant="ghost" colorScheme="whiteAlpha" width="full" justifyContent="flex-start">Sign Up</Button>
                  </Link>
                </>
              )}
              <IconButton
                aria-label="Toggle color mode"
                icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
                onClick={toggleColorMode}
                variant="ghost"
                colorScheme="whiteAlpha"
                width="full" justifyContent="flex-start"
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box as="main" maxW="7xl" mx="auto" px={{ base: "4", sm: "6", lg: "8" }} py="8">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;