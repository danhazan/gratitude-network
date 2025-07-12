
import { Box, Text, Flex, Avatar, useColorModeValue } from '@chakra-ui/react';
import { Interaction } from '../../lib/types';
import NextLink from 'next/link';

interface CommentItemProps {
  comment: Interaction;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={3} bg={bgColor} borderRadius="md" mb={2}>
      <Flex align="center" mb={2}>
        {comment.user ? (
          <Avatar as={NextLink} href={`/profiles/${comment.user.id}`} size="sm" name={comment.user.username} src={comment.user.profile_image_url} />
        ) : (
          <Avatar size="sm" name="Unknown User" />
        )}
        <Text ml={2} fontWeight="bold">
          {comment.user ? (
            <NextLink href={`/profiles/${comment.user.id}`} passHref>
              {comment.user.username}
            </NextLink>
          ) : (
            "Unknown User"
          )}
        </Text>
        <Text ml={2} fontSize="sm" color="gray.500">
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </Flex>
      <Text fontSize="sm">{comment.content}</Text>
    </Box>
  );
};
