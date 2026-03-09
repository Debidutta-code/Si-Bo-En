"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";

interface ModifyGuestSelectorProps {
  isOpen: boolean;
  initialRooms: number;
  initialAdults: number;
  initialChildren: number;
  initialChildAges?: number[];
  onClose: () => void;
  onApply: (summary: string, data: {
    rooms: number;
    previousRooms: number;
    adults: number;
    children: number;
    childAges: number[];
  }) => void;
}

const MAX_GUESTS_PER_ROOM = 4; // still keep per-room capacity

const ModifyGuestSelector: React.FC<ModifyGuestSelectorProps> = ({
  isOpen,
  initialRooms,
  initialAdults,
  initialChildren,
  initialChildAges,
  onClose,
  onApply,
}) => {
  // ✅ WITH THIS
  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState<number[]>(initialChildAges || []);

  useEffect(() => {
    if (isOpen) {
      setRooms(initialRooms);
      setAdults(initialAdults);
      setChildren(initialChildren);
      setChildAges(initialChildAges || []);
    }
  }, [isOpen, initialRooms, initialAdults, initialChildren, initialChildAges]);

  // totals
  const totalGuests = adults + children;
  const currentCapacity = rooms * MAX_GUESTS_PER_ROOM;

  // adjust automatically
  useEffect(() => {
    if (totalGuests > currentCapacity) {
      const neededRooms = Math.ceil(totalGuests / MAX_GUESTS_PER_ROOM);
      setRooms(neededRooms);
    }

  }, [totalGuests, rooms, adults]);

  const incrementRooms = () => {
    setRooms(rooms + 1);
  };

  const decrementRooms = () => {
    if (rooms > 1) {
      const newRooms = rooms - 1;
      const newCapacity = newRooms * MAX_GUESTS_PER_ROOM;

      // total guests must fit into new capacity
      let newAdults = adults;
      let newChildren = children;

      if (newAdults + newChildren > newCapacity) {
        // Prioritize keeping adults first
        if (newAdults > newCapacity) {
          newAdults = newCapacity; // trim down adults if necessary
          newChildren = 0;
        } else {
          newChildren = newCapacity - newAdults;
        }
      }

      // Always ensure at least 1 adult
      if (newAdults < 1) {
        newAdults = 1;
      }

      setRooms(newRooms);
      setAdults(newAdults);
      setChildren(newChildren);
    }
  };


  const incrementAdults = () => {
    if (totalGuests < rooms * MAX_GUESTS_PER_ROOM) {
      setAdults(adults + 1);
    } else {
      // auto increase room when capacity exceeded
      setRooms(rooms + 1);
      setAdults(adults + 1);
    }
  };

  const decrementAdults = () => {
    if (adults > 1) {
      setAdults(adults - 1); // Keep at least 1 adult total
    }
  };


  const incrementChildren = () => {
    if (totalGuests < rooms * MAX_GUESTS_PER_ROOM) {
      setChildren(children + 1);
    } else {
      setRooms(rooms + 1);
      setChildren(children + 1);
    }
    setChildAges(prev => [...prev, 0]); // add placeholder age
  };

  const decrementChildren = () => {
    if (children > 0) {
      setChildren(children - 1);
      setChildAges(prev => prev.slice(0, -1)); // remove last age
    }
  };

  const handleApply = () => {
    let summary = `${adults} adult${adults !== 1 ? "s" : ""}`;
    if (children > 0) {
      summary += ` - ${children} child${children !== 1 ? "ren" : ""}`;
    }
    summary += ` - ${rooms} room${rooms !== 1 ? "s" : ""}`;

    // ✅ WITH THIS
    onApply(summary, {
      rooms,
      previousRooms: initialRooms,
      adults,
      children,
      childAges,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white mt-20 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Occupancy</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Rooms */}
          <div className="mb-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-gray-900">Number of Rooms:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementRooms}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-200
                      ${rooms === 1 ? "bg-gray-300 cursor-not-allowed border-gray-600" : "bg-white hover:bg-gray-100 border-gray-300"}
                    `}
                    disabled={rooms <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-8 text-center">{rooms}</span>
                  <button
                    onClick={incrementRooms}
                    className="w-10 h-10 rounded-full border bg-white hover:bg-gray-100 border-gray-300 flex items-center justify-center transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Adults */}
          <div className="bg-gray-50 rounded-lg px-3 py-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Adults</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decrementAdults}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-200
    ${adults <= 1 ? "bg-gray-300 cursor-not-allowed border-gray-600" : "bg-white hover:bg-gray-100 border-gray-300"}
  `}
                  disabled={adults <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="text-lg font-bold text-gray-900 w-6 text-center">{adults}</span>
                <button
                  onClick={incrementAdults}
                  className="w-8 h-8 rounded-full border bg-white hover:bg-gray-100 border-gray-300 flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Children */}
          <div className="bg-gray-50 rounded-lg px-3 py-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Children</span>
                <p className="text-[0.65rem] text-gray-500">Ages 0 - 17</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decrementChildren}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-200
                    ${children === 0 ? "bg-gray-300 cursor-not-allowed border-gray-600" : "bg-white hover:bg-gray-100 border-gray-300"}
                  `}
                  disabled={children <= 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-gray-900 w-6 text-center">{children}</span>
                <button
                  onClick={incrementChildren}
                  className="w-8 h-8 rounded-full border bg-white hover:bg-gray-100 border-gray-300 flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Child Ages */}
          {children > 0 && (
            <div className="bg-gray-50 rounded-lg px-3 py-3 mb-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Child Ages</p>
              {Array.from({ length: children }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Child {i + 1}</span>
                  <select
                    value={childAges[i] ?? 0}
                    onChange={(e) => {
                      const updated = [...childAges];
                      updated[i] = Number(e.target.value);
                      setChildAges(updated);
                    }}
                    className="border rounded px-2 py-1 text-sm w-24"
                  >
                    {Array.from({ length: 18 }, (_, age) => (
                      <option key={age} value={age}>{age === 0 ? '< 1 year' : `${age===1 ? '1 year' : `${age} years`}`}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleApply}
            className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-indigo-700 transition-colors duration-200 mt-6 sm:mt-8"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyGuestSelector;
