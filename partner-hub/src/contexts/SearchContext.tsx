import { createContext, useContext, useState, ReactNode } from "react";

export interface SearchFilters {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  adults: number;
  children: number;
  rooms: number;
  priceRange: [number, number];
  amenities: string[];
  roomsArray: IRoomConfig[];
  searchQuery: string;
}

export interface IRoomConfig {
  adults: number;
  children: number;
  childAges: number[];
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (updates: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const defaultFilters: SearchFilters = {
  checkIn: today,
  checkOut: tomorrow,
  adults: 1,
  children: 0,
  rooms: 1,
  priceRange: [0, 50000],
  amenities: [],
  roomsArray: [{ adults: 1, children: 0, childAges: [] }],
  searchQuery: "",
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
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
}