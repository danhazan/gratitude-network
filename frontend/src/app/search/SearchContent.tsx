'use client';

import { Box, Container, Heading } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '../../components/Search/SearchBar';
import { SearchResults } from '../../components/Search/SearchResults';
import { SearchFilter, SearchFilterType } from '../../components/Search/SearchFilter';
import { api } from '../../lib/api';
import { Post, User } from '../../lib/types';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilterType>('all');
  const [results, setResults] = useState<{ posts: Post[]; users: User[] }>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults({ posts: [], users: [] });
      return;
    }

    setLoading(true);
    try {
      let posts: Post[] = [];
      let users: User[] = [];

      if (filter === 'all' || filter === 'posts') {
        posts = await api.searchPosts(searchQuery);
      }
      if (filter === 'all' || filter === 'users') {
        users = await api.searchUsers(searchQuery);
      }

      setResults({ posts, users });
    } catch (error: unknown) {
      console.error('Search failed:', error);
      // Handle error state in UI
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={4}>Search</Heading>
      <SearchBar onSearch={setQuery} />
      <Box my={4}>
        <SearchFilter activeFilter={filter} onFilterChange={setFilter} />
      </Box>
      <SearchResults results={results} loading={loading} query={query} />
    </Container>
  );
}