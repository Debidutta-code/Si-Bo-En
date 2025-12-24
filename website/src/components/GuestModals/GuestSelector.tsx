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

const GuestSelector: React.FC<GuestSelectorProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const bookingContext = useSelector((state: RootState) => state.booking);
  const [rooms, setRooms] = useState<Room[]>([{ adults: 1, children: 0 }]);
  const [totalRooms, setTotalRooms] = useState(1);

  useEffect(() => {
    if (bookingContext.guests && Array.isArray(bookingContext.guests.rooms)) {
      setRooms(
        bookingContext.guests.rooms.map((room: any, idx: number) => ({
          adults: idx === 0 ? room.adults || 1 : room.adults || 0,
          children: room.children || 0,
        }))
      );
      setTotalRooms(bookingContext.guests.rooms.length);
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
      setRooms(rooms.slice(0, totalRooms));
    }
  }, [totalRooms, rooms]);

  const redistributeGuests = (updatedRooms: Room[]) => {
    let flattenedGuests: { type: "adult" | "child" }[] = [];

    updatedRooms.forEach((room) => {
      for (let i = 0; i < room.adults; i++)
        flattenedGuests.push({ type: "adult" });
      for (let i = 0; i < room.children; i++)
        flattenedGuests.push({ type: "child" });
    });

    const newRooms: Room[] = [];
    let room: Room = { adults: 0, children: 0 };

    flattenedGuests.forEach((guest) => {
      const roomCount = room.adults + room.children;
      if (roomCount >= MAX_GUESTS_PER_ROOM) {
        newRooms.push(room);
        room = { adults: 0, children: 0 };
      }
      if (guest.type === "adult") room.adults += 1;
      else room.children += 1;
    });

    if (room.adults + room.children > 0) {
      newRooms.push(room);
    }

    if (newRooms.length > 0 && newRooms[0].adults === 0) {
      newRooms[0].adults = 1;
      if (newRooms[0].children > 0) {
        newRooms[0].children -= 1;
      }
    }

    setRooms(newRooms);
    setTotalRooms(newRooms.length);
  };

  const updateRoom = (
    roomIndex: number,
    field: "adults" | "children",
    increment: boolean
  ) => {
    const updatedRooms = [...rooms];
    const room = { ...updatedRooms[roomIndex] };

    if (increment) {
      if (field === "adults" && room.adults < 8) {
        room.adults += 1;
      } else if (field === "children" && room.children < 6) {
        room.children += 1;
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
    redistributeGuests(updatedRooms);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto p-0 rounded-2xl shadow-2xl">
        {/* Dialog Header */}
        <DialogHeader className="p-4 sm:p-6 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-left">
            Select Occupancy
          </DialogTitle>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Number of Rooms */}
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

          {/* Room Configuration */}
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
                  {/* Adults */}
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
                          disabled={room.adults >= 8}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                            ${room.adults >= 8
                              ? "bg-gray-300 cursor-not-allowed opacity-50"
                              : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Children */}
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
                          disabled={room.children >= 6}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors duration-200
                            ${room.children >= 6
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
              </div>
            ))}
          </div>
        </div>

        {/* Dialog Footer - Apply Button */}
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