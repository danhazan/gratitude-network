
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { User, Post, Follow } from '../../../lib/types';
import { PostCard } from '../../../components/PostCard';
import toast from 'react-hot-toast';
import { EditProfileForm } from '../../../components/Profile/EditProfileForm';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]); // Keeping posts state for future re-implementation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();
  

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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        margin: '0 1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Blue Navigation Bar */}
        <div style={{
          backgroundColor: '#3182ce',
          padding: '1rem',
          borderRadius: '8px 8px 0 0',
          marginBottom: '0'
        }}>
          <a href="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            Gratitude Network
          </a>
        </div>
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#cbd5e0', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48px" height="48px">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{user.username}</h1>
            <p style={{ textAlign: 'center' }}>{user.bio}</p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{user.posts_count}</span>
                <span>Posts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{user.hearts_received}</span>
                <span>Hearts</span>
              </div>
            </div>
            {currentUser && currentUser.id === userId ? (
              <button style={{ backgroundColor: '#38a169', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }} onClick={() => alert('Edit Profile clicked')}> {/* Simplified for now */}
                Edit Profile
              </button>
            ) : (
              currentUser && (
                <button style={{ backgroundColor: isFollowing ? '#e53e3e' : '#3182ce', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', marginTop: '1rem', border: 'none', cursor: 'pointer' }} onClick={handleFollowToggle}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )
            )}
          </div>

          <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Posts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} user={user} />
            ))}
          </div>

          {/* Simplified Modal for now */}
          {/* <Modal isOpen={isOpen} onClose={onClose}> */}
            {/* Modal content here */}
          {/* </Modal> */}
        </div>
      </div>
    </div>
  );
}
