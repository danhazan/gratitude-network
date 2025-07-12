
import { useState } from 'react';
import { Input, Button, Flex, useToast } from '@chakra-ui/react';

interface CommentInputProps {
  postId: string;
  onCommentAdded: (content: string) => void;
  isLoading: boolean;
}

export const CommentInput = ({ onCommentAdded, isLoading }: CommentInputProps) => {
  const [commentContent, setCommentContent] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!commentContent.trim()) {
      toast({ title: 'Comment cannot be empty', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    // Call API to add comment
    // This will be handled by the parent CommentSection component
    onCommentAdded(commentContent); // Trigger parent to refetch comments
    setCommentContent('');
  };

  return (
    <Flex mt={4}>
      <Input
        placeholder="Add a comment..."
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        isDisabled={isLoading}
      />
      <Button ml={2} onClick={handleSubmit} isLoading={isLoading} colorScheme="blue">
        Post
      </Button>
    </Flex>
  );
};
