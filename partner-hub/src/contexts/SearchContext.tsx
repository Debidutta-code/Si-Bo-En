import { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchFilters {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  rooms: number;
  priceRange: [number, number];
  amenities: string[];
  searchQuery: string;
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (updates: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  checkIn: undefined,
  checkOut: undefined,
  guests: 2,
  rooms: 1,
  priceRange: [0, 50000],
  amenities: [],
  searchQuery: '',
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SearchContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
