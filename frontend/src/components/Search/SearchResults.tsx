
import { Box, Text, List, ListItem, Spinner, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Post, User } from '../../lib/types'; // Assuming types are defined

interface SearchResultsProps {
  results: {
    posts: Post[];
    users: User[];
  };
  loading: boolean;
  query: string;
}

export const SearchResults = ({ results, loading, query }: SearchResultsProps) => {
  if (loading) {
    return <Spinner />;
  }

  if (!query) {
    return null;
  }

  const hasResults = results.posts.length > 0 || results.users.length > 0;

  if (!hasResults) {
    return <Text>No results found for &quot;{query}&quot;</Text>;
  }

  return (
    <Box mt={4}>
      {results.posts.length > 0 && (
        <Box mb={4}>
          <Text fontWeight="bold">Posts</Text>
          <List spacing={2}>
            {results.posts.map((post) => (
              <ListItem key={post.id}>
                <NextLink href={`/posts/${post.id}`} passHref>
                  <Link>{post.content}</Link>
                </NextLink>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {results.users.length > 0 && (
        <Box>
          <Text fontWeight="bold">Users</Text>
          <List spacing={2}>
            {results.users.map((user) => (
              <ListItem key={user.id}>
                <NextLink href={`/profiles/${user.id}`} passHref>
                  <Link>{user.username}</Link>
                </NextLink>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};
