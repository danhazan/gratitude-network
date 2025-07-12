
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [text, setText] = useState('');
  const [query] = useDebounce(text, 500);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <InputGroup>
      <InputLeftElement pointerEvents='none'>
        <SearchIcon color='gray.300' />
      </InputLeftElement>
      <Input 
        placeholder='Search for posts or users...' 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </InputGroup>
  );
};
