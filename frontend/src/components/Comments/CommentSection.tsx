
import { Box, Text, VStack, Spinner, useToast } from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Interaction } from '../../lib/types';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingComment, setAddingComment] = useState(false);
  const toast = useToast();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedComments = await api.getComments(postId);
      setComments(fetchedComments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: 'Error fetching comments', description: error.message, status: 'error', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error fetching comments', description: 'An unknown error occurred', status: 'error', duration: 3000, isClosable: true });
      }
    } finally {
      setLoading(false);
    }
  }, [postId, toast]);

  const handleAddComment = useCallback(async (content: string) => {
    setAddingComment(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({ title: 'Authentication required', description: 'Please log in to comment', status: 'warning', duration: 3000, isClosable: true });
        return;
      }
      await api.addComment(postId, content, token);
      toast({ title: 'Comment added', status: 'success', duration: 2000, isClosable: true });
      fetchComments(); // Refetch comments after adding new one
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: 'Error adding comment', description: error.message, status: 'error', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error adding comment', description: 'An unknown error occurred', status: 'error', duration: 3000, isClosable: true });
      }
    } finally {
      setAddingComment(false);
    }
  }, [postId, fetchComments, toast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box mt={4}>
      <Text fontSize="lg" fontWeight="bold" mb={2}>Comments ({comments.length})</Text>
      <VStack spacing={3} align="stretch">
        {comments.length === 0 ? (
          <Text fontSize="sm" color="gray.500">No comments yet. Be the first to comment!</Text>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </VStack>
      <CommentInput onCommentAdded={handleAddComment} isLoading={addingComment} />
    </Box>
  );
};
