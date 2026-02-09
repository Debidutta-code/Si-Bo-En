// Example: How to use Search Context in any component within SearchLayout

import { useSearch } from '@/contexts/SearchContext';
import { useFilteredProperties, useFilteredRooms, useSearchSummary } from '@/hooks/useSearchFilters';
import { useAppSelector } from '@/redux/hooks';
import { useMemo } from 'react';

// 1. Access search filters directly
function MyComponent() {
  const { filters, updateFilters, resetFilters } = useSearch();
  
  // Read filters
  console.log(filters.searchQuery);
  console.log(filters.checkIn);
  console.log(filters.guests);
  
  // Update filters
  updateFilters({ searchQuery: 'luxury' });
  updateFilters({ guests: 4 });
  
  // Reset all filters
  resetFilters();
}

// 2. Filter properties automatically
function PropertyList() {
  const properties = useAppSelector((state) => state.property.properties);
  const filteredProperties = useFilteredProperties(properties);
  
  // filteredProperties will automatically update based on search filters
  return (
    <div>
      {filteredProperties.map(property => (
        <div key={property.id}>{property.name}</div>
      ))}
    </div>
  );
}

// 3. Filter rooms automatically
function RoomList() {
  const rooms = useAppSelector((state) => state.property.rooms);
  const filteredRooms = useFilteredRooms(rooms);
  
  return (
    <div>
      {filteredRooms.map(room => (
        <div key={room.id}>{room.name}</div>
      ))}
    </div>
  );
}

// 4. Get search summary info
function SearchInfo() {
  const { hasActiveFilters, activeFilterCount, filters } = useSearchSummary();
  
  if (!hasActiveFilters) {
    return <p>No filters applied</p>;
  }
  
  return <p>{activeFilterCount} filters active</p>;
}

// 5. Custom filtering logic
function CustomFilter() {
  const { filters } = useSearch();
  const data = [/* your data */];
  
  const customFiltered = useMemo(() => {
    return data.filter(item => {
      // Your custom logic using filters.searchQuery, filters.priceRange, etc.
      if (filters.searchQuery && !item.name.includes(filters.searchQuery)) {
        return false;
      }
      return true;
    });
  }, [data, filters]);
  
  return <div>{/* render customFiltered */}</div>;
}
