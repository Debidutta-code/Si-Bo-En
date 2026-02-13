"use client";
import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface Room {
  adults: number;
  children: number;
}

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (summary: string, data: any) => void;
}

const MAX_GUESTS_PER_ROOM = 4;
const MAX_ADULTS_PER_ROOM = 8;
const MAX_CHILDREN_PER_ROOM = 6;

const GuestSelector: React.FC<GuestSelectorProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const bookingContext = useSelector((state: RootState) => state.booking);
  const [rooms, setRooms] = useState<Room[]>([{ adults: 1, children: 0 }]);
  const [totalRooms, setTotalRooms] = useState(1);


useEffect(() => {
  if (bookingContext.guests) {
    // ✅ PRIORITY 1: Check for roomsArray first (detailed per-room data)
    if (bookingContext.guests.roomsArray && Array.isArray(bookingContext.guests.roomsArray)) {
      const mappedRooms = bookingContext.guests.roomsArray.map((room: any, idx: number) => {
        const roomData = {
          adults: room.adults || 0,
          children: room.children || 0,
        };
        return roomData;
      });
      
      setRooms(mappedRooms);
      setTotalRooms(bookingContext.guests.roomsArray.length);
    }
    // ✅ PRIORITY 2: Check if rooms is an array
    else if (Array.isArray(bookingContext.guests.rooms)) {
      const mappedRooms = bookingContext.guests.rooms.map((room: any, idx: number) => {
        const roomData = {
          adults: room.adults || 0,
          children: room.children || 0,
        };
        return roomData;
      });
      
      setRooms(mappedRooms);
      setTotalRooms(bookingContext.guests.rooms.length);
    }
    // ✅ PRIORITY 3: rooms is a number (only use this for initial load)
    else if (typeof bookingContext.guests.rooms === 'number') {
      const numRooms = bookingContext.guests.rooms;
      const totalAdults = bookingContext.guests.adults || 1;
      const totalChildren = bookingContext.guests.children || 0;
      
      const newRooms: Room[] = [];
      for (let i = 0; i < numRooms; i++) {
        newRooms.push({
          adults: i === 0 ? totalAdults : 0,
          children: i === 0 ? totalChildren : 0,
        });
      }
      
      setRooms(newRooms);
      setTotalRooms(numRooms);
    }
  }
}, [bookingContext.guests]);
  useEffect(() => {
    if (totalRooms > rooms.length) {
      const newRooms = [...rooms];
      while (newRooms.length < totalRooms) {
        newRooms.push({ adults: 0, children: 0 });
      }
      setRooms(newRooms);
    } else if (totalRooms < rooms.length) {
      const slicedRooms = rooms.slice(0, totalRooms);
      setRooms(slicedRooms);
    }
  }, [totalRooms]);

  const updateRoom = (
    roomIndex: number,
    field: "adults" | "children",
    increment: boolean
  ) => {
    const updatedRooms = [...rooms];
    const room = { ...updatedRooms[roomIndex] };

    if (increment) {
      if (field === "adults") {
        const currentTotal = room.adults + room.children;
        if (currentTotal < MAX_GUESTS_PER_ROOM && room.adults < MAX_ADULTS_PER_ROOM) {
          room.adults += 1;
        }
      } else if (field === "children") {
        const currentTotal = room.adults + room.children;
        if (currentTotal < MAX_GUESTS_PER_ROOM && room.children < MAX_CHILDREN_PER_ROOM) {
          room.children += 1;
        }
      }
    } else {
      if (field === "adults") {
        if (roomIndex === 0) {
          room.adults = Math.max(1, room.adults - 1);
        } else {
          room.adults = Math.max(0, room.adults - 1);
        }
      } else if (field === "children") {
        room.children = Math.max(0, room.children - 1);
      }
    }

    updatedRooms[roomIndex] = room;
    setRooms(updatedRooms);
  };

  const handleApply = () => {
    const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);

    let summary = `${totalAdults} adult${totalAdults !== 1 ? "s" : ""}`;
    if (totalChildren > 0) {
      summary += ` - ${totalChildren} child${totalChildren !== 1 ? "ren" : ""}`;
    }
    summary += ` - ${totalRooms} room${totalRooms !== 1 ? "s" : ""}`;
    
    onApply(summary, { rooms });
    onClose();
  };

  const isRoomFull = (room: Room) => {
    return room.adults + room.children >= MAX_GUESTS_PER_ROOM;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto p-0 rounded-2xl shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-left">
            Select Occupancy
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <Label className="text-base sm:text-lg font-semibold text-gray-900">
                Number of Rooms:
              </Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setTotalRooms(Math.max(1, totalRooms - 1))}
                  disabled={totalRooms <= 1}
                  className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                    ${totalRooms <= 1
                      ? "bg-gray-300 cursor-not-allowed opacity-50"
                      : "bg-white hover:bg-gray-100"
                    }`}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-xl font-bold text-gray-900 w-8 text-center">
                  {totalRooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setTotalRooms(totalRooms + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200 bg-white hover:bg-gray-100"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl px-4 py-2"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Room #{index + 1}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg px-3 py-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Adults
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateRoom(index, "adults", false)}
                          disabled={index === 0 && room.adults <= 1}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                            ${index === 0 && room.adults <= 1
                              ? "bg-gray-300 cursor-not-allowed opacity-50"
                              : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-bold text-gray-900 w-6 text-center">
                          {room.adults}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateRoom(index, "adults", true)}
                          disabled={room.adults >= MAX_ADULTS_PER_ROOM || isRoomFull(room)}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                            ${room.adults >= MAX_ADULTS_PER_ROOM || isRoomFull(room)
                              ? "bg-gray-300 cursor-not-allowed opacity-50"
                              : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg px-3 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Children
                        </Label>
                        <p className="text-[0.65rem] text-gray-500">
                          Ages 0 - 17
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateRoom(index, "children", false)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200 bg-white hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-bold text-gray-900 w-6 text-center">
                          {room.children}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateRoom(index, "children", true)}
                          disabled={room.children >= MAX_CHILDREN_PER_ROOM || isRoomFull(room)}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                            ${room.children >= MAX_CHILDREN_PER_ROOM || isRoomFull(room)
                              ? "bg-gray-300 cursor-not-allowed opacity-50"
                              : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 text-center">
                  {room.adults + room.children} of {MAX_GUESTS_PER_ROOM} guests
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleApply}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors duration-200"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestSelector;