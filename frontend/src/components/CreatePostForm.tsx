"use client";

import { useState } from "react";
import { Box, Button, Textarea, FormControl, FormLabel, Input, Stack, Heading, useToast } from "@chakra-ui/react";

interface CreatePostFormProps {
  onPostCreated: () => void; // Define the prop interface
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Placeholder for image URL
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({
          title: "Authentication required.",
          description: "Please log in to create a post.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image_url: imageUrl || null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create post");
      }

      toast({
        title: "Post created!",
        description: "Your gratitude has been shared.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setContent("");
      setImageUrl("");
      onPostCreated(); // Call the callback to refresh posts
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error creating post.",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" mb={6}>
      <Heading as="h3" size="md" mb={4}>Share Your Gratitude</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <FormControl id="content" isRequired>
            <FormLabel>What are you grateful for?</FormLabel>
            <Textarea
              placeholder="Today, I'm grateful for..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </FormControl>
          <FormControl id="imageUrl">
            <FormLabel>Image URL (Optional)</FormLabel>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="primary" isLoading={loading} loadingText="Sharing...">
            Share Gratitude
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreatePostForm;