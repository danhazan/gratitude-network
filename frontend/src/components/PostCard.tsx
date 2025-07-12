import { Box, Text, Avatar, Flex, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { Post } from '../lib/types';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';
import { CommentSection } from './Comments/CommentSection';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
  user: User; // Pass user as a separate prop
}

export const PostCard = ({ post, user }: PostCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const [showComments, setShowComments] = useState(false);
  const [isHearted, setIsHearted] = useState(false);
  const [currentHeartCount, setCurrentHeartCount] = useState(0);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const heartCount = post.interactions?.filter(i => i.interaction_type === 'heart').length || 0;
    setCurrentHeartCount(heartCount);
    // Check if current user has hearted this post
    const userHearted = post.interactions?.some(i => i.interaction_type === 'heart' && i.user_id === currentUser?.id);
    setIsHearted(userHearted);
  }, [post.interactions, currentUser]);

  const commentCount = post.interactions?.filter(i => i.interaction_type === 'comment').length || 0;

  const handleHeartToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please log in to heart posts.');
      return;
    }

    try {
      if (isHearted) {
        await api.unheartPost(post.id, token);
        setCurrentHeartCount(prev => prev - 1);
      } else {
        await api.heartPost(post.id, token);
        setCurrentHeartCount(prev => prev + 1);
      }
      setIsHearted(prev => !prev);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle heart.');
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg={bgColor} p={4}>
      <Flex align="center" mb={4}>
        <Avatar as={NextLink} href={`/profiles/${user?.id}`} size="md" name={user?.username} src={user?.profile_image_url} />
        <Box ml={3}>
          <NextLink href={`/profiles/${user?.id}`} passHref>
            <Text fontWeight="bold">{user?.username}</Text>
          </NextLink>
          <Text fontSize="sm" color="gray.500">{new Date(post.created_at).toLocaleDateString()}</Text>
        </Box>
      </Flex>

      <Text mb={4}>{post.content}</Text>

      {post.image_url && (
        <Box mb={4}>
          <img src={post.image_url} alt="Post image" style={{ borderRadius: '8px' }} />
        </Box>
      )}

      <HStack spacing={4}>
        <IconButton 
          aria-label="Like post" 
          icon={<FiHeart color={isHearted ? 'red.500' : 'gray.500'} />} 
          variant="ghost" 
          onClick={handleHeartToggle}
        />
        <Text fontSize="sm" color="gray.500">{currentHeartCount}</Text>
        <IconButton 
          aria-label="Comment on post" 
          icon={<FiMessageSquare />} 
          variant="ghost" 
          onClick={() => setShowComments(!showComments)}
        />
        <Text fontSize="sm" color="gray.500">{commentCount}</Text>
        <IconButton aria-label="Share post" icon={<FiShare2 />} variant="ghost" />
      </HStack>

      {showComments && <CommentSection postId={post.id} />}
    </Box>
  );
};