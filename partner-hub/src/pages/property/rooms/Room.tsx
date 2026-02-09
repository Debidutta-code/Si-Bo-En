import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { fetchRoomsByPropertyIdService } from "./services";
import type {
  IRoomWithRatePlans,
  IDateRange,
  IRatePlanWithPrice,
  IAgentPricingResponse,
} from "./interface";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Users,
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
  Eye,
  Maximize,
  Cigarette,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAgentPricingService } from "./services/agentic-room.services";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  TV: Tv,
  "Flat-Screen TV": Tv,
  "Room Service": UtensilsCrossed,
  "Mini Bar": Coffee,
  Jacuzzi: Bath,
  "Living Area": Square,
  Balcony: Mountain,
  "Ocean View": Waves,
  "Mountain View": Mountain,
  "Private Pool": Waves,
  "Beach Access": Waves,
  "Butler Service": Sparkles,
  Fireplace: Sparkles,
  "Breakfast Included": Coffee,
  Heater: Wind,
  "Private Bathroom": Bath,
  "Iron and Ironing Board": Sparkles,
  "Soundproof Walls": Waves,
};

export default function PropertyRoomsPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { filters } = useSearch();
  const [roomsData, setRoomsData] = useState<IRoomWithRatePlans[]>([]);
  const [dateRange, setDateRange] = useState<IDateRange | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!propertyId) return;

      // Get dates from context or use defaults (today and tomorrow)
      const startDate = filters.checkIn || new Date();
      const endDate = filters.checkOut || new Date(Date.now() + 86400000); // +1 day
      // Format dates to YYYY-MM-DD
      const formattedStartDate = formatLocalDate(startDate);
      const formattedEndDate = formatLocalDate(endDate);

      setLoading(true);
      const result = await fetchRoomsByPropertyIdService(
        propertyId,
        formattedStartDate,
        formattedEndDate,
      );

      if (result.success && result.data) {
        if (result.data.rooms) {
          setRoomsData(result.data.rooms);
        }
        if (result.data.dateRange) {
          console.log(result.data.dateRange);
          setDateRange(result.data.dateRange);
        }
      } else {
        toast.error(result.message || "Failed to fetch rooms");
      }
      setLoading(false);
    };

    fetchRooms();
  }, [propertyId, filters.checkIn, filters.checkOut]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  console.log("filters", filters);
  console.log(dateRange);
  if (loading) {
    return <Loader fullScreen text="Loading rooms..." />;
  }
  const handleBookNow = async (
    ratePlanData: IRatePlanWithPrice,
    roomId: string,
  ) => {
    setBookingLoading(ratePlanData.ratePlan.id);

    const result = await getAgentPricingService({
      propertyCode: ratePlanData.chargesPerDay[0]?.charge.propertyCode || "",
      invTypeCode: ratePlanData.chargesPerDay[0]?.charge.roomTypeCode || "",
      startDate: dateRange?.startDate || "",
      endDate: dateRange?.endDate || "",
      ratePlanCode: ratePlanData.ratePlan.ratePlanCode,
      noOfAdults: filters.adults || 1,
      noOfChildren: filters.children || 0,
      noOfRooms: filters.rooms || 1,
    });

    setBookingLoading(null);

    if (result.success) {
      navigate(`/property/${propertyId}/rooms/${roomId}/booking`, {
        state: {
          roomsData,
          ratePlan: ratePlanData,
          dateRange,
          pricingDetails: result.data as IAgentPricingResponse,
        },
      });
    } else {
      toast.error(result.message || "Failed to calculate pricing");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/property")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Available Rooms
          </h1>
          <p className="text-muted-foreground">
            {roomsData.length} room{roomsData.length !== 1 ? "s" : ""} available
            {dateRange && (
              <span className="ml-2">
                • {formatDate(dateRange.startDate)} to{" "}
                {formatDate(dateRange.endDate)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* No results message */}
      {roomsData.length === 0 && (
        <Alert>
          <AlertDescription>
            No rooms available for the selected dates. Try adjusting your date
            range.
          </AlertDescription>
        </Alert>
      )}

      {/* Rooms List */}
      <div className="space-y-6">
        {roomsData.map((roomData, index) => {
          const room = roomData.room.room;
          const agenticRoom = roomData.room;
          const availableRatePlans = roomData.ratePlans.filter(
            (rp) => rp.isAvailable,
          );

          return (
            <motion.div
              key={agenticRoom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Room Image */}
                    <div className="relative lg:w-80 h-64 lg:h-auto shrink-0">
                      <img
                        src={room.image[0] || "/placeholder.svg"}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-3 left-3 ${
                          room.available
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {room.available ? "Available" : "Not Available"}
                      </Badge>
                      <Badge className="absolute top-3 right-3 bg-card/90 text-foreground backdrop-blur-sm">
                        {room.roomType}
                      </Badge>
                      {room.totalRoom && (
                        <Badge className="absolute bottom-3 left-3 bg-card/90 text-foreground backdrop-blur-sm">
                          {room.totalRoom} rooms total
                        </Badge>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        {/* Header Row */}
                        <div className="mb-4">
                          <h3 className="text-2xl font-semibold text-foreground mb-2">
                            {room.roomName}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description}
                          </p>
                        </div>

                        {/* Room Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                              <Users className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Max Guests
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {room.maxOccupancy}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                              <Bed className="h-4 w-4 text-success" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Bedrooms
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {room.numberOfBedrooms}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                              <Maximize className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Size
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {room.roomSize} {room.roomUnit}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                View
                              </p>
                              <p className="text-sm font-medium text-foreground capitalize">
                                {room.roomView}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Cigarette className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground capitalize">
                              {room.smokingPolicy}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {room.maxNumberOfAdults} Adults,{" "}
                              {room.maxNumberOfChildren} Child
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mountain className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              Floor {room.floor}
                            </span>
                          </div>
                        </div>

                        {/* Amenities */}
                        {room.roomAmenities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                              Room Amenities
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {room.roomAmenities
                                .slice(0, 6)
                                .map((amenityItem) => {
                                  const Icon =
                                    amenityIcons[
                                      amenityItem.amenity.amenityName
                                    ] || Sparkles;
                                  return (
                                    <div
                                      key={amenityItem.id}
                                      className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1.5 rounded-full"
                                    >
                                      <Icon className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-foreground">
                                        {amenityItem.amenity.amenityName}
                                      </span>
                                    </div>
                                  );
                                })}
                              {room.roomAmenities.length > 6 && (
                                <div className="flex items-center text-xs text-accent font-medium px-2.5 py-1.5">
                                  +{room.roomAmenities.length - 6} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        {/* Rate Plans */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            Available Rate Plans
                          </p>
                          {availableRatePlans.length > 0 ? (
                            availableRatePlans.map((ratePlanData) => (
                              <div
                                key={ratePlanData.ratePlan.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                    <p className="font-medium text-foreground">
                                      {ratePlanData.ratePlan.ratePlanName}
                                    </p>
                                  </div>
                                  {ratePlanData.chargesPerDay.length > 0 && (
                                    <div className="flex items-center gap-2 ml-6 mt-1">
                                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(
                                          ratePlanData.chargesPerDay[0].date,
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1 text-xl font-bold text-foreground">
                                    <DollarSign className="h-5 w-5" />
                                    {ratePlanData.totalPrice}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {ratePlanData.chargesPerDay.length > 0
                                      ? `${ratePlanData.chargesPerDay[0].charge.currencyCode}`
                                      : "USD"}
                                  </span>
                                  <Button
                                    size="sm"
                                    className="mt-2"
                                    disabled={
                                      bookingLoading ===
                                      ratePlanData.ratePlan.id
                                    }
                                    onClick={() =>
                                      handleBookNow(ratePlanData, room.id)
                                    }
                                  >
                                    {bookingLoading === ratePlanData.ratePlan.id
                                      ? "Loading..."
                                      : "Book Now"}
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <p className="text-sm text-muted-foreground">
                                No rate plans available for selected dates
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
