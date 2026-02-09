import { useSearch } from '@/contexts/SearchContext';
import { useMemo } from 'react';

interface Property {
  id: string;
  name: string;
  price?: number;
  [key: string]: any;
}

interface Room {
  id: string;
  name: string;
  pricePerNight?: number;
  price?: number;
  capacity?: number;
  maxGuests?: number;
  type?: string;
  [key: string]: any;
}

export function useFilteredProperties<T extends Property>(properties: T[]): T[] {
  const { filters } = useSearch();

  return useMemo(() => {
    return properties.filter((property) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = property.name?.toLowerCase().includes(query);
        const matchesCity = property.city?.toLowerCase().includes(query);
        const matchesState = property.state?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesCity && !matchesState) {
          return false;
        }
      }

      // Price range filter (if property has price)
      if (property.price && filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (property.price < min || property.price > max) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filters]);
}

export function useFilteredRooms<T extends Room>(rooms: T[]): T[] {
  const { filters } = useSearch();

  return useMemo(() => {
    return rooms.filter((room) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = room.name?.toLowerCase().includes(query);
        const matchesType = room.type?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesType) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        const roomPrice = room.pricePerNight || room.price || 0;
        if (roomPrice < min || roomPrice > max) {
          return false;
        }
      }

      // Guests filter (capacity)
      const roomCapacity = room.capacity || room.maxGuests || 0;
      if (filters.guests && roomCapacity) {
        if (roomCapacity < filters.guests) {
          return false;
        }
      }

      return true;
    });
  }, [rooms, filters]);
}

export function useSearchSummary() {
  const { filters } = useSearch();

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.checkIn !== undefined ||
      filters.checkOut !== undefined ||
      filters.guests !== 2 ||
      filters.rooms !== 1 ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 50000 ||
      filters.amenities.length > 0
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.checkIn) count++;
    if (filters.checkOut) count++;
    if (filters.guests !== 2) count++;
    if (filters.rooms !== 1) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  }, [filters]);

  return {
    hasActiveFilters,
    activeFilterCount,
    filters,
  };
}
