// Removed 'use client'; as it's Next.js specific

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react'; 

// Define IProperty interface for Vite + TS context
interface IProperty {
  id: string; // Assuming property IDs are strings
  propertyName: string;
  image: string[]; // Assuming it's an array of image URLs
  // Add other properties as needed based on your backend response
  [key: string]: any; // Allows dynamic access like item[searchKey]
}

interface DataTableProps {
  data: IProperty[]; // This will now receive ALL properties
  searchKey?: keyof IProperty; // Ensured searchKey is a valid key of IProperty
  searchPlaceholder?: string;
  // itemsPerPage prop removed as it's no longer used for pagination
}

export default function PropertyGrid({
  data,
  searchKey = 'propertyName',
  searchPlaceholder = 'Search properties...',
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Changed from useRouter

  // Filter logic remains the same
  const filteredData = (data || []).filter((item) => {
    const value = item[searchKey]; // Access directly via searchKey
    return value
      ? String(value).toLowerCase().includes(searchTerm.toLowerCase())
      : false;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar with a clean look */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-xl w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10 h-10 rounded-full bg-white shadow-sm transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((property, index) => ( // Directly map filteredData
            <Card
              key={property.id || index}
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={() => navigate(`/app/property/${property.id}`)} // Changed router.push to navigate
            >
              {/* Image Section - Replaced next/image with standard <img> */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={property.image[0] || 'https://placehold.co/600x400/E0E0E0/808080?text=No+Image'} // Fallback placeholder
                  alt={property.propertyName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  // Basic error handling for image loading
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/E0E0E0/808080?text=Image+Error';
                    e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                  {property.propertyName}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 border border-dashed">
          No properties found.
        </div>
      )}
    </div>
  );
}
