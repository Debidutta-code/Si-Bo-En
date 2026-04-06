import {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { fetchRoomsByPropertyIdService } from "./services";
import type {
  IAgenticRoomFull,
  IAgenticRoomPrice,
  IAgentPricingResponse,
} from "./interface";
import toast from "react-hot-toast";
import { Loader } from "@/components/Loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Users,
  Ruler,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAgentPricingService } from "./services/agentic-room.services";
import { useAppSelector } from "@/redux/hooks";
import { currencies } from "@/components/currencyCode/cuurency";

function RoomImageCarousel({ images, roomName }: { images: string[]; roomName: string }) {
  const [idx, setIdx] = useState(0);
  const imgs = images.length ? images : ["https://via.placeholder.com/600x400?text=No+Image"];

  return (
    <div className="relative h-48 sm:h-full w-full sm:w-44 md:w-52 lg:w-64 shrink-0 overflow-hidden rounded-tl-xl rounded-tr-xl sm:rounded-tr-none sm:rounded-bl-xl sm:rounded-tl-xl">
      <img
        src={imgs[idx]}
        alt={roomName}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {imgs.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + imgs.length) % imgs.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % imgs.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RatePlanRow({
  rp,
  allCombos,
  bookingLoading,
  onBookNow,
}: {
  rp: IAgenticRoomPrice;
  allCombos: IAgenticRoomPrice[];
  bookingLoading: string | null;
  onBookNow: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = bookingLoading === `${rp.ratePlanCode}-${rp.comboLabel}`;

  const isOnlyRoomOnly =
    allCombos.length === 1 && rp.comboLabel?.toLowerCase() === "room only";
  const displayLabel = isOnlyRoomOnly ? rp.ratePlanName : (rp.comboLabel || rp.ratePlanName);

  const hasAddons = rp.addons?.filter((a) => a.price > 0).length > 0;
  const hasTax = (rp.touristTax?.calculatedTaxAmount ?? 0) > 0;
  const hasExpandable = hasAddons || hasTax;
  const getCurrencySymbol = (code: string) =>
    currencies.find((c) => c.code === code)?.symbol ?? code;

  return (
    <div>
      {/* Main row */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-blue-50/40 transition-colors">
        {/* Left: label toggle */}
        <button
          onClick={() => hasExpandable && setExpanded((e) => !e)}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors ${hasExpandable ? "hover:text-blue-600 cursor-pointer" : "cursor-default"}`}
        >
          {hasExpandable ? (
            expanded ? (
              <ChevronUp size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )
          ) : (
            <span className="w-3.5" />
          )}
          <span>{displayLabel}</span>
          {rp.addons?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-bold rounded-full">
              + {rp.addons.length} add-on{rp.addons.length > 1 ? "s" : ""}
            </span>
          )}
        </button>

        {/* Right: price + book */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 text-sm sm:text-base font-bold text-slate-900">
            <span className="text-xs font-semibold text-slate-500">{getCurrencySymbol(rp.currencyCode)}</span>
            <span>{rp.totalAmount}</span>
          </div>

          <button
            onClick={onBookNow}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wide bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading…
              </span>
            ) : (
              "Book Now"
            )}
          </button>
        </div>
      </div>

      {/* Expanded breakdown — base rate + addons + tax only, no per-guest rows */}
      {expanded && hasExpandable && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {/* Base rate */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Rate:</span>
              <span className="text-xs font-bold text-slate-800">
                {rp.currencyCode} {rp.totalAmount}
              </span>
            </div>

            {/* Included addons */}
            {rp.addons?.filter((a) => a.price > 0).map((addon) => (
              <div key={addon.id} className="flex items-center gap-1">
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-[10px] text-blue-700 truncate max-w-[120px]">
                  🍽 {addon.name}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  +{rp.currencyCode} {addon.price}
                </span>
              </div>
            ))}

            {/* Tourist tax */}
            {hasTax && (
              <div className="flex items-center gap-1">
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-[10px] text-amber-600">
                  🏛 {rp.touristTax.name}:
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  +{rp.currencyCode} {rp.touristTax.calculatedTaxAmount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCard({
  room,
  bookingLoading,
  onBookNow,
  index,
}: {
  room: IAgenticRoomFull;
  bookingLoading: string | null;
  onBookNow: (rp: IAgenticRoomPrice, room: IAgenticRoomFull) => void;
  index: number;
}) {
  const groupedRatePlans = room.roomPrice.reduce(
    (acc: Record<string, IAgenticRoomPrice[]>, rp) => {
      if (!acc[rp.ratePlanCode]) acc[rp.ratePlanCode] = [];
      acc[rp.ratePlanCode].push(rp);
      return acc;
    },
    {}
  );

  if (!room.hasValidRate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="space-y-3"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:h-[220px]">
          <RoomImageCarousel images={room.images} roomName={room.roomName} />
          <div className="flex-1 min-w-0 flex flex-col justify-between p-4">
            <div className="flex-1 min-w-0 flex flex-col justify-between p-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                      {room.roomName}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                      {room.roomType}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200">
                    Available
                  </span>
                </div>

                {room.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">
                    {room.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-blue-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">{room.maxOccupancy} Guests max</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ruler size={13} className="text-blue-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">{room.roomSize} {room.roomUnit}</span>
                </div>
                {room.roomView && (
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-blue-500 shrink-0" />
                    <span className="text-[11px] text-slate-600 font-medium capitalize">{room.roomView} view</span>
                  </div>
                )}
                {room.maxNumberOfAdults > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500">{room.maxNumberOfAdults}A / {room.maxNumberOfChildren}C</span>
                  </div>
                )}
                {room.numberOfBedrooms > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">🛏</span>
                    <span className="text-[11px] text-slate-500">{room.numberOfBedrooms} Bedroom{room.numberOfBedrooms > 1 ? "s" : ""}</span>
                  </div>
                )}
                {room.floor > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">🏢</span>
                    <span className="text-[11px] text-slate-500">Floor {room.floor}</span>
                  </div>
                )}
              </div>

              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 4).map((amenity, i) => (
                    <div className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                      {amenity.amenityName}
                    </div>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="text-[10px] text-blue-500 font-semibold px-1 py-0.5">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(groupedRatePlans).map(([ratePlanCode, combos]) => {
          const first = combos[0];
          const hasTaxFooter = (first.touristTax?.calculatedTaxAmount ?? 0) > 0;
          return (
            <div
              key={ratePlanCode}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {first.ratePlanName}
                  </h3>
                  {hasTaxFooter && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      Tax not included
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-blue-500" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {combos.length} option{combos.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Combo rows */}
              <div className="divide-y divide-slate-100">
                {combos.map((rp) => (
                  <RatePlanRow
                    key={`${rp.ratePlanCode}-${rp.comboLabel}`}
                    rp={rp}
                    allCombos={combos}
                    bookingLoading={bookingLoading}
                    onBookNow={() => onBookNow(rp, room)}
                  />
                ))}
              </div>
              {hasTaxFooter && (
                <div className="px-4 py-2 border-t border-amber-100 bg-amber-50 flex items-center justify-center gap-1.5">
                  <span className="text-xs">ℹ️</span>
                  <p className="text-[11px] text-amber-800 text-center">
                    <span className="font-semibold">{first.touristTax!.name}</span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {first.touristTax!.currencyCode}{" "}
                      {first.touristTax!.calculatedTaxAmount.toFixed(2)}
                    </span>{" "}
                    is <span className="font-semibold text-amber-900">not included</span> — paid at hotel.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function PropertyRoomsPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { filters } = useSearch();
  const user = useAppSelector((state) => state.auth.user);

  const [roomsData, setRoomsData] = useState<IAgenticRoomFull[]>([]);
  const [propertyCode, setPropertyCode] = useState<string>("");
  const [searchCriteria, setSearchCriteria] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const fetchRooms = async () => {
      if (!propertyId) return;
      if (!user?.agencyId) return;
      const startDate = filters.checkIn || new Date();
      const endDate = filters.checkOut || new Date(Date.now() + 86400000);

      setLoading(true);
      const result = await fetchRoomsByPropertyIdService(
        propertyId,
        formatLocalDate(startDate),
        formatLocalDate(endDate),
        {
          adults: filters.adults,
          children: filters.children,
          rooms: filters.rooms,
          roomsArray: filters.roomsArray ?? [
            { adults: filters.adults, children: filters.children, childAges: [] },
          ],
        },
        user?.agencyId
      );

      if (result.success && result.data) {
        setRoomsData(result.data.rooms ?? []);
        setPropertyCode(result.data.propertyDetails?.propertyCode ?? "");
        if (result.data.searchCriteria) {
          setSearchCriteria({
            startDate: result.data.searchCriteria.startDate,
            endDate: result.data.searchCriteria.endDate,
          });
        }
      } else {
        toast.error(result.message || "Failed to fetch rooms");
      }
      setLoading(false);
    };

    
  useEffect(() => {
    fetchRooms();
}, [propertyId, user?.agencyId]);

  const handleBookNow = async (rp: IAgenticRoomPrice, room: IAgenticRoomFull) => {
    setBookingLoading(`${rp.ratePlanCode}-${rp.comboLabel}`);

    const roomsArray = filters.roomsArray ?? [
      { adults: filters.adults || 1, children: filters.children || 0, childAges: [] },
    ];

    const includedAddons = rp.addons?.map((a) => a.id).filter(Boolean);

    const result = await getAgentPricingService({
      propertyCode,
      invTypeCode: room.roomType,
      startDate: searchCriteria?.startDate || "",
      endDate: searchCriteria?.endDate || "",
      ratePlanCode: rp.ratePlanCode,
      noOfAdults: filters.adults || 1,
      noOfChildren: filters.children || 0,
      noOfRooms: filters.rooms || 1,
      agencyId: user?.agencyId || "",
      roomsArray,
      ...(includedAddons?.length ? { includedAddons } : {}),
    });

    setBookingLoading(null);

    if (result.success) {
      navigate(`/property/${propertyId}/rooms/${room.id}/booking`, {
        state: {
          room,
          roomPrice: rp,
          searchCriteria,
          pricingDetails: result.data as IAgentPricingResponse,
        },
      });
    } else {
      toast.error(result.message || "Failed to calculate pricing");
    }
  };

  if (loading) return <Loader fullScreen text="Loading rooms..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/property")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition shadow-sm shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Available Rooms</h1>
          <p className="text-sm text-gray-500">
            {roomsData.length} room{roomsData.length !== 1 ? "s" : ""} available
            {searchCriteria && (
              <span className="ml-2">
                · {formatDate(searchCriteria.startDate)} → {formatDate(searchCriteria.endDate)}
              </span>
            )}
          </p>
        </div>
      </div>

      {roomsData.length === 0 && (
        <Alert>
          <AlertDescription>
            No rooms available for the selected dates. Try adjusting your date range.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {roomsData.map((room, index) => (
          <RoomCard
            key={room.id}
            room={room}
            index={index}
            bookingLoading={bookingLoading}
            onBookNow={handleBookNow}
          />
        ))}
      </div>
    </div>
  );
}