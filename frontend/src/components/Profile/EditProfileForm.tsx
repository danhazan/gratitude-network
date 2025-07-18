
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { User } from '../../lib/types';
import { api } from '../../lib/api';

interface EditProfileFormProps {
  user: User;
  onClose: () => void;
  onProfileUpdated: (updatedUser: User) => void;
}

export const EditProfileForm = ({ user, onClose, onProfileUpdated }: EditProfileFormProps) => {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [profileImageUrl, setProfileImageUrl] = useState(user.profile_image_url || '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setUsername(user.username);
    setBio(user.bio || '');
    setLocation(user.location || '');
    setWebsite(user.website || '');
    setProfileImageUrl(user.profile_image_url || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({ title: 'Authentication required', description: 'Please log in to update your profile', status: 'warning', duration: 3000, isClosable: true });
        return;
      }

      const updatedProfile = await api.updateUserProfile(
        user.id,
        {
          username,
          bio,
          location,
          website,
          profile_image_url: profileImageUrl,
        },
        token
      );
      onProfileUpdated(updatedProfile);
      toast({ title: 'Profile updated successfully', status: 'success', duration: 2000, isClosable: true });
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: 'Error updating profile', description: error.message, status: 'error', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error updating profile', description: 'An unknown error occurred', status: 'error', duration: 3000, isClosable: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl id="username">
          <FormLabel>Username</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl id="bio">
          <FormLabel>Bio</FormLabel>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </FormControl>
        <FormControl id="location">
          <FormLabel>Location</FormLabel>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </FormControl>
        <FormControl id="website">
          <FormLabel>Website</FormLabel>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
        </FormControl>
        <FormControl id="profileImageUrl">
          <FormLabel>Profile Image URL</FormLabel>
          <Input value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={loading} width="full">
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
};
