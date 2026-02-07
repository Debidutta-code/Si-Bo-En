import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { useSearchSummary } from '@/hooks/useSearchFilters';
import { fetchPropertiesService } from './services';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/Loader';
import type { IProperty } from './interface/agentic-property.types';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  Coffee,
  Flame,
  Mountain,
  CalendarDays,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Swimming Pool': Waves,
  'Gym': Dumbbell,
  'Restaurant': UtensilsCrossed,
  'Spa': Sparkles,
  'Room Service': Coffee,
  'Fireplace': Flame,
  'Mountain View': Mountain,
  'Private Beach': Waves,
  'Water Sports': Waves,
  'Bar': Coffee,
  'Kids Club': Sparkles,
  'Conference Room': Building2,
  'Hiking Trails': Mountain,
  'Bonfire Area': Flame,
  'Library': Building2,
};

export default function PropertyPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { filters } = useSearch();
  const { hasActiveFilters, activeFilterCount } = useSearchSummary();

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = property.propertyName?.toLowerCase().includes(query);
        const matchesCity = property.propertyAddress?.city?.toLowerCase().includes(query);
        const matchesState = property.propertyAddress?.state?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesCity && !matchesState) {
          return false;
        }
      }
      return true;
    });
  }, [properties, filters]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const result = await fetchPropertiesService();
      
      if (result.success && result.data) {
        setProperties(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch properties');
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader fullScreen text="Loading properties..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} of {properties.length} properties
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                <Filter className="h-3 w-3 mr-1" />
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* No results message */}
      {filteredProperties.length === 0 && properties.length > 0 && (
        <Alert>
          <AlertDescription>
            No properties match your search criteria. Try adjusting your filters.
          </AlertDescription>
        </Alert>
      )}

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Property Image */}
                  <div className="relative lg:w-72 h-56 lg:h-auto shrink-0">
                    <img
                      src={property.image[0] || '/placeholder.svg'}
                      alt={property.propertyName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                        {property.propertyType?.masterPropertyType?.propertyTypeName || 'N/A'}
                      </Badge>
                    </div>
                    
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col h-full">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {property.propertyName}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {property.propertyAddress?.addressLine1}, {property.propertyAddress?.city}, {property.propertyAddress?.state}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                            <Building2 className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm font-medium text-foreground">
                              {property.propertyCategory?.masterCategory?.categoryName || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                            <MapPin className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium text-foreground">{property.propertyAddress?.location || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                            <Mail className="h-4 w-4 text-warning" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium text-foreground truncate max-w-[120px]" title={property.propertyEmail}>
                              {property.propertyEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium text-foreground truncate max-w-[100px]" title={property.propertyContact}>
                              {property.propertyContact}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          Amenities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {property.propertyAmenities?.slice(0, 6).map((amenityItem, idx) => {
                            const amenityName = amenityItem.amenity.amenityName;
                            const Icon = amenityIcons[amenityName] || Sparkles;
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1.5 rounded-full"
                              >
                                <Icon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{amenityName}</span>
                              </div>
                            );
                          })}
                          {property.propertyAmenities && property.propertyAmenities.length > 6 && (
                            <div className="flex items-center text-xs text-accent font-medium px-2.5 py-1.5">
                              +{property.propertyAmenities.length - 6} more
                            </div>
                          )}
                          {(!property.propertyAmenities || property.propertyAmenities.length === 0) && (
                            <span className="text-sm text-muted-foreground">No amenities listed</span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t mt-auto">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {property.propertyCategory?.masterCategory?.categoryName || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={() => navigate(`/property/${property.id}/rooms`)}
                        >
                          View Rooms
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground">No properties found</h3>
          <p className="text-muted-foreground">You don't have any properties assigned yet.</p>
        </div>
      )}
    </div>
  );
}
