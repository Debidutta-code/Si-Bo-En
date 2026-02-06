import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setSelectedProperty, setRooms } from '@/redux/slices/propertySlice';
import { mockProperties, mockRooms } from '@/lib/mockData';
import { useFilteredRooms, useSearchSummary } from '@/hooks/useSearchFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  IndianRupee, 
  Wifi, 
  Wind, 
  Tv, 
  UtensilsCrossed,
  Sparkles,
  Bath,
  Mountain,
  Waves,
  Coffee,
  Bed,
  Square,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'AC': Wind,
  'TV': Tv,
  'Room Service': UtensilsCrossed,
  'Mini Bar': Coffee,
  'Jacuzzi': Bath,
  'Living Area': Square,
  'Balcony': Mountain,
  'Ocean View': Waves,
  'Mountain View': Mountain,
  'Private Pool': Waves,
  'Beach Access': Waves,
  'Butler Service': Sparkles,
  'Fireplace': Sparkles,
  'Breakfast Included': Coffee,
  'Heater': Wind,
};

export default function PropertyRoomsPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const selectedProperty = useAppSelector((state) => state.property.selectedProperty);
  const rooms = useAppSelector((state) => state.property.rooms);
  
  // Use search filters
  const filteredRooms = useFilteredRooms(rooms);
  const { hasActiveFilters, activeFilterCount } = useSearchSummary();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (propertyId) {
      const property = mockProperties.find((p) => p.id === propertyId);
      if (property) {
        dispatch(setSelectedProperty(property));
        dispatch(setRooms(mockRooms[propertyId] || []));
      }
    }
  }, [isAuthenticated, propertyId, navigate, dispatch]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated || !selectedProperty) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/property')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{selectedProperty.name}</h1>
          <p className="text-muted-foreground">
            {selectedProperty.city}, {selectedProperty.state} • {filteredRooms.length} of {rooms.length} rooms
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
      {filteredRooms.length === 0 && rooms.length > 0 && (
        <Alert>
          <AlertDescription>
            No rooms match your search criteria. Try adjusting your filters.
          </AlertDescription>
        </Alert>
      )}

      {/* Rooms List */}
      <div className="space-y-4">
        {filteredRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Room Image */}
                  <div className="relative lg:w-72 h-56 lg:h-auto shrink-0">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-3 left-3 ${
                        room.isAvailable 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-destructive text-destructive-foreground'
                      }`}
                    >
                      {room.isAvailable ? 'Available' : 'Booked'}
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-card/90 text-foreground backdrop-blur-sm">
                      {room.type}
                    </Badge>
                  </div>

                  {/* Room Details */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col h-full">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">
                            {room.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Max {room.maxGuests} guests</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              <span>{room.type} Room</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                            <IndianRupee className="h-5 w-5" />
                            {room.pricePerNight.toLocaleString()}
                          </div>
                          <span className="text-sm text-muted-foreground">per night</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                          Room Amenities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity] || Sparkles;
                            return (
                              <div
                                key={amenity}
                                className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1.5 rounded-full"
                              >
                                <Icon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t mt-auto">
                        <div className="text-sm text-muted-foreground">
                          <span className="text-foreground font-medium">{room.amenities.length}</span> amenities included
                        </div>
                        <Button
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          disabled={!room.isAvailable}
                          onClick={() => navigate(`/property/${propertyId}/rooms/${room.id}/booking`)}
                        >
                          {room.isAvailable ? (
                            <>
                              Book Now
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          ) : (
                            'Not Available'
                          )}
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

      {rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bed className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground">No rooms available</h3>
          <p className="text-muted-foreground">No rooms are currently listed for this property.</p>
        </div>
      )}
    </div>
  );
}
