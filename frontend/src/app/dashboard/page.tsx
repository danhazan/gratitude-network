"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Box, Text, SimpleGrid, Spinner, Alert, AlertIcon, AlertDescription, Flex, GridItem } from "@chakra-ui/react";
import { PostCard } from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm"; // Import CreatePostForm
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  username: string; // Assuming username is part of the post data or can be fetched
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
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

  const handleLikeToggle = useCallback(async (postId: string, isLiked: boolean) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }

    const method = isLiked ? "POST" : "DELETE";
    const url = `http://localhost:8000/posts/${postId}/heart`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${isLiked ? "like" : "unlike"} post`);
      }

      // Optimistically update UI or refetch posts
      fetchPosts();
      toast.success(`Post ${isLiked ? "liked" : "unliked"}!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred during like/unlike.");
      }
    }
  }, [fetchPosts]);

  const handleCommentClick = useCallback((postId: string) => {
    // Implement navigation to a comment page or open a comment modal
    toast("Comment functionality coming soon!", { icon: "💬" });
    console.log(`Comment button clicked for post: ${postId}`);
  }, []);

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
            />
          ))
        )}
      </SimpleGrid>
    </Box>
  );
}