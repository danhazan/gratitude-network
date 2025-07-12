
import { Button, ButtonGroup } from '@chakra-ui/react';

export type SearchFilterType = 'all' | 'posts' | 'users';

interface SearchFilterProps {
  activeFilter: SearchFilterType;
  onFilterChange: (filter: SearchFilterType) => void;
}

export const SearchFilter = ({ activeFilter, onFilterChange }: SearchFilterProps) => {
  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      <Button 
        onClick={() => onFilterChange('all')} 
        isActive={activeFilter === 'all'}
      >
        All
      </Button>
      <Button 
        onClick={() => onFilterChange('posts')} 
        isActive={activeFilter === 'posts'}
      >
        Posts
      </Button>
      <Button 
        onClick={() => onFilterChange('users')} 
        isActive={activeFilter === 'users'}
      >
        Users
      </Button>
    </ButtonGroup>
  );
};
