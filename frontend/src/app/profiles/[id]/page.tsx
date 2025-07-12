
'use client';

import { Box, Container, Heading, Text, Spinner, Avatar, VStack, HStack, Divider, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { User, Post, Follow } from '../../../lib/types';
import { PostCard } from '../../../components/PostCard'; // Assuming a PostCard component exists
import toast from 'react-hot-toast';
import { EditProfileForm } from '../../../components/Profile/EditProfileForm';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]); // Keeping posts state for future re-implementation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const profileData = await api.getUserProfile(userId);
        setUser(profileData);

        const userPosts = await api.getUserPosts(userId);
        setPosts(userPosts);

        // Check follow status
        if (currentUser && !authLoading) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            const followingList: Follow[] = await api.getFollowing(token);
            const isCurrentlyFollowing = followingList.some(f => f.following_id === userId);
            setIsFollowing(isCurrentlyFollowing);
          }
        }

      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser, authLoading]); // Depend on currentUser and authLoading to re-fetch follow status

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please log in to follow users.');
      return;
    }

    try {
      if (isFollowing) {
        await api.unfollowUser(userId, token);
        toast.success(`Unfollowed ${user?.username}`);
      } else {
        await api.followUser(userId, token);
        toast.success(`Now following ${user?.username}`);
      }
      setIsFollowing(prev => !prev);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle follow status.');
    }
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading || authLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (!user) {
    return <Text>User not found.</Text>;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={4} align="center">
        <Avatar size="2xl" name={user.username} src={user.profile_image_url} />
        <Heading>{user.username}</Heading>
        <Text textAlign="center">{user.bio}</Text>
        <HStack spacing={6}>
          <VStack>
            <Text fontWeight="bold">{user.posts_count}</Text>
            <Text>Posts</Text>
          </VStack>
          <VStack>
            <Text fontWeight="bold">{user.hearts_received}</Text>
            <Text>Hearts</Text>
          </VStack>
        </HStack>
        {currentUser && currentUser.id === userId ? (
          <Button onClick={onOpen} colorScheme="teal" mt={4}>
            Edit Profile
          </Button>
        ) : (
          currentUser && (
            <Button onClick={handleFollowToggle} colorScheme={isFollowing ? 'red' : 'blue'} mt={4}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )
        )}
      </VStack>

      <Divider my={8} />

      <Heading size="lg" mb={4}>Posts</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {posts.map(post => (
          <PostCard key={post.id} post={post} user={user} />
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <EditProfileForm user={user} onClose={onClose} onProfileUpdated={handleProfileUpdated} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
