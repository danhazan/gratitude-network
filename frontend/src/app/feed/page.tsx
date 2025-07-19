"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Text, SimpleGrid, Spinner, Alert, AlertIcon, AlertDescription, Flex, GridItem } from "@chakra-ui/react";
import { PostCard } from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm"; // Import CreatePostForm
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Interaction } from '../../lib/types';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  post_type: string;
  created_at: string;
  user?: User; // Embedded user object - made optional
  interactions: Interaction[];
}

import Layout from '../../components/Layout';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login'); // Use replace to avoid adding to history
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch posts");
      }

      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching posts.");
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [fetchPosts, isAuthenticated]); // Depend on fetchPosts to re-run when it changes (which it won't, due to useCallback)

  

  if (authLoading || !isAuthenticated) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Layout>
      <Box>
        <CreatePostForm onPostCreated={fetchPosts} /> {/* Integrate CreatePostForm and pass callback */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6}> {/* Added mt for spacing */}
          {posts.length === 0 ? (
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" textAlign="center">
                <Text fontSize="xl" fontWeight="bold">No posts yet!</Text>
                <Text mt={4}>Start by creating your first gratitude post.</Text>
              </Box>
            </GridItem>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              user={post.user!}
              />
            ))
          )}
        </SimpleGrid>
      </Box>
    </Layout>
  );
}