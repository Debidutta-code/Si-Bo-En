"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";

interface RoomDistribution {
  adults: number;
  children: number;
  childAges: number[];
}

interface ModifyGuestSelectorProps {
  isOpen: boolean;
  initialRooms: number;
  initialAdults: number;
  initialChildren: number;
  initialChildAges?: number[];
  /** ✅ NEW: per-room distribution from priceBreakdowns */
  initialRoomDistribution?: RoomDistribution[];
  onClose: () => void;
  onApply: (
    summary: string,
    data: {
      rooms: number;
      previousRooms: number;
      adults: number;
      children: number;
      childAges: number[];
      /** ✅ NEW: per-room distribution to use in guestDistribution API param */
      roomDistribution: RoomDistribution[];
    }
  ) => void;
}

const MAX_GUESTS_PER_ROOM = 4;

const ModifyGuestSelector: React.FC<ModifyGuestSelectorProps> = ({
  isOpen,
  initialRooms,
  initialAdults,
  initialChildren,
  initialChildAges,
  initialRoomDistribution,
  onClose,
  onApply,
}) => {
  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState<number[]>(initialChildAges || []);

  /**
   * roomDistribution: one entry per room, mirroring what the API expects in guestDistribution.
   * We initialize from initialRoomDistribution if provided, otherwise spread guests evenly.
   */
  const buildInitialRoomDist = (
    roomCount: number,
    totalAdults: number,
    totalChildren: number,
    ages: number[],
    perRoom?: RoomDistribution[]
  ): RoomDistribution[] => {
    if (perRoom && perRoom.length === roomCount) return perRoom;
    // Spread evenly
    const dist: RoomDistribution[] = [];
    let remainingAdults = totalAdults;
    let remainingChildren = totalChildren;
    let ageIndex = 0;
    for (let i = 0; i < roomCount; i++) {
const roomAdults = Math.max(1, Math.ceil(remainingAdults / (roomCount - i)));
      const roomChildren = Math.ceil(remainingChildren / (roomCount - i));
      const roomAges = ages.slice(ageIndex, ageIndex + roomChildren);
      dist.push({ adults: roomAdults, children: roomChildren, childAges: roomAges });
      remainingAdults -= roomAdults;
      remainingChildren -= roomChildren;
      ageIndex += roomChildren;
    }
    return dist;
  };

  const [roomDistribution, setRoomDistribution] = useState<RoomDistribution[]>(() =>
    buildInitialRoomDist(initialRooms, initialAdults, initialChildren, initialChildAges || [], initialRoomDistribution)
  );

  useEffect(() => {
    if (isOpen) {
      setRooms(initialRooms);
      setAdults(initialAdults);
      setChildren(initialChildren);
      setChildAges(initialChildAges || []);
      setRoomDistribution(
        buildInitialRoomDist(initialRooms, initialAdults, initialChildren, initialChildAges || [], initialRoomDistribution)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const totalGuests = adults + children;

  // ── Auto-increase rooms if guests exceed capacity ──────────────────────────
  useEffect(() => {
    if (totalGuests > rooms * MAX_GUESTS_PER_ROOM) {
      const needed = Math.ceil(totalGuests / MAX_GUESTS_PER_ROOM);
      setRooms(needed);
      // Re-spread into new room count
      setRoomDistribution(buildInitialRoomDist(needed, adults, children, childAges));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalGuests, adults, children]);

  // ── Recalculate roomDistribution whenever rooms / adults / children change ─
  const recalcDistribution = (
    newRooms: number,
    newAdults: number,
    newChildren: number,
    newAges: number[]
  ) => {
    setRoomDistribution(buildInitialRoomDist(newRooms, newAdults, newChildren, newAges));
  };

  // ── Room controls ──────────────────────────────────────────────────────────
  const incrementRooms = () => {
    const n = rooms + 1;
    setRooms(n);
    setRoomDistribution((prev) => [...prev, { adults: 1, children: 0, childAges: [] }]);
    setAdults((a) => a + 1); // new room contributes 1 adult to total
  };

  const decrementRooms = () => {
    if (rooms <= 1) return;
    const newRooms = rooms - 1;
    const newCapacity = newRooms * MAX_GUESTS_PER_ROOM;
    let newAdults = Math.min(adults, newCapacity);
    let newChildren = Math.min(children, newCapacity - newAdults);
    if (newAdults < 1) newAdults = 1;
    const newAges = childAges.slice(0, newChildren);
    setRooms(newRooms);
    setAdults(newAdults);
    setChildren(newChildren);
    setChildAges(newAges);
    recalcDistribution(newRooms, newAdults, newChildren, newAges);
  };

  // ── Adult controls ─────────────────────────────────────────────────────────
  const incrementAdults = () => {
    const newAdults = adults + 1;
    let newRooms = rooms;
    if (newAdults + children > rooms * MAX_GUESTS_PER_ROOM) {
      newRooms = rooms + 1;
      setRooms(newRooms);
    }
    setAdults(newAdults);
    recalcDistribution(newRooms, newAdults, children, childAges);
  };

  const decrementAdults = () => {
    if (adults <= 1) return;
    const newAdults = adults - 1;
    setAdults(newAdults);
    recalcDistribution(rooms, newAdults, children, childAges);
  };

  // ── Children controls ──────────────────────────────────────────────────────
  const incrementChildren = () => {
    const newChildren = children + 1;
    const newAges = [...childAges, 0];
    let newRooms = rooms;
    if (adults + newChildren > rooms * MAX_GUESTS_PER_ROOM) {
      newRooms = rooms + 1;
      setRooms(newRooms);
    }
    setChildren(newChildren);
    setChildAges(newAges);
    recalcDistribution(newRooms, adults, newChildren, newAges);
  };

  const decrementChildren = () => {
    if (children <= 0) return;
    const newChildren = children - 1;
    const newAges = childAges.slice(0, newChildren);
    setChildren(newChildren);
    setChildAges(newAges);
    recalcDistribution(rooms, adults, newChildren, newAges);
  };

  // ── Per-room distribution edit ─────────────────────────────────────────────
  const updateRoomAdults = (roomIndex: number, delta: number) => {
    const updated = roomDistribution.map((r, i) => {
      if (i !== roomIndex) return r;
        const newAdults = Math.max(1, Math.min(r.adults + delta, MAX_GUESTS_PER_ROOM - r.children));
      return { ...r, adults: newAdults };
    });
    const newTotal = updated.reduce((s, r) => s + r.adults, 0);
    setAdults(newTotal);
    setRoomDistribution(updated);
  };

  const updateRoomChildren = (roomIndex: number, delta: number) => {
    const updated = roomDistribution.map((r, i) => {
      if (i !== roomIndex) return r;
      const newChildren = Math.max(0, Math.min(r.children + delta, MAX_GUESTS_PER_ROOM - r.adults));
      const newAges =
        delta > 0
          ? [...r.childAges, 0]
          : r.childAges.slice(0, newChildren);
      return { ...r, children: newChildren, childAges: newAges };
    });
    const newTotalChildren = updated.reduce((s, r) => s + r.children, 0);
    const allAges = updated.flatMap((r) => r.childAges);
    setChildren(newTotalChildren);
    setChildAges(allAges);
    setRoomDistribution(updated);
  };

  const updateChildAge = (roomIndex: number, childIdx: number, age: number) => {
    const updated = roomDistribution.map((r, i) => {
      if (i !== roomIndex) return r;
      const newAges = [...r.childAges];
      newAges[childIdx] = age;
      return { ...r, childAges: newAges };
    });
    setRoomDistribution(updated);
    setChildAges(updated.flatMap((r) => r.childAges));
  };

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = () => {
    // Re-derive totals from roomDistribution (single source of truth)
    const totalAdults = roomDistribution.reduce((s, r) => s + r.adults, 0);
    const totalChildren = roomDistribution.reduce((s, r) => s + r.children, 0);
    const allAges = roomDistribution.flatMap((r) => r.childAges);

    let summary = `${totalAdults} adult${totalAdults !== 1 ? "s" : ""}`;
    if (totalChildren > 0) summary += ` - ${totalChildren} child${totalChildren !== 1 ? "ren" : ""}`;
    summary += ` - ${rooms} room${rooms !== 1 ? "s" : ""}`;

    onApply(summary, {
      rooms,
      previousRooms: initialRooms,
      adults: totalAdults,
      children: totalChildren,
      childAges: allAges,
      roomDistribution,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white mt-4 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Occupancy</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Rooms */}
          <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-semibold text-gray-900">Number of Rooms</span>
              <Counter value={rooms} onDecrement={decrementRooms} onIncrement={incrementRooms} min={1} />
            </div>
          </div>

          {/* ── Per-room breakdown ───────────────────────────────────────────── */}
          <div className="space-y-3 mb-4">
            {roomDistribution.map((room, roomIdx) => (
              <div key={roomIdx} className="border rounded-xl p-4 bg-white shadow-sm">
                <p className="font-semibold text-gray-800 mb-3 text-sm">Room {roomIdx + 1}</p>

                {/* Adults per room */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Adults</span>
                  <Counter
                    value={room.adults}
                    onDecrement={() => updateRoomAdults(roomIdx, -1)}
                    onIncrement={() => updateRoomAdults(roomIdx, 1)}
                    min={1}
                    max={MAX_GUESTS_PER_ROOM - room.children}
                    size="sm"
                  />
                </div>

                {/* Children per room */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm text-gray-700">Children</span>
                    <p className="text-[0.65rem] text-gray-400">Ages 0–17</p>
                  </div>
                  <Counter
                    value={room.children}
                    onDecrement={() => updateRoomChildren(roomIdx, -1)}
                    onIncrement={() => updateRoomChildren(roomIdx, 1)}
                    min={0}
                    max={MAX_GUESTS_PER_ROOM - room.adults}
                    size="sm"
                  />
                </div>

                {/* Child ages per room */}
                {room.children > 0 && (
                  <div className="mt-2 space-y-1 pl-2 border-l-2 border-indigo-100">
                    {Array.from({ length: room.children }).map((_, childIdx) => (
                      <div key={childIdx} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Child {childIdx + 1} age</span>
                        <select
                          value={room.childAges[childIdx] ?? 0}
                          onChange={(e) => updateChildAge(roomIdx, childIdx, Number(e.target.value))}
                          className="border rounded px-2 py-1 text-xs w-24"
                        >
                          {Array.from({ length: 18 }, (_, age) => (
                            <option key={age} value={age}>
                              {age === 0 ? "< 1 year" : age === 1 ? "1 year" : `${age} years`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div className="bg-indigo-50 rounded-lg px-4 py-2 text-sm text-indigo-800 mb-4">
            <span className="font-medium">Total: </span>
            {roomDistribution.reduce((s, r) => s + r.adults, 0)} adults
            {roomDistribution.reduce((s, r) => s + r.children, 0) > 0
              ? `, ${roomDistribution.reduce((s, r) => s + r.children, 0)} children`
              : ""}{" "}
            across {rooms} room{rooms !== 1 ? "s" : ""}
          </div>

          <button
            onClick={handleApply}
            className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Reusable counter component ─────────────────────────────────────────────
const Counter: React.FC<{
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}> = ({ value, onDecrement, onIncrement, min = 0, max, size = "md" }) => {
  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrement}
        disabled={value <= min}
        className={`${btnSize} rounded-full border flex items-center justify-center transition-colors ${
          value <= min ? "bg-gray-200 cursor-not-allowed border-gray-300 text-gray-400" : "bg-white hover:bg-gray-100 border-gray-300"
        }`}
      >
        <Minus className={iconSize} />
      </button>
      <span className={`font-bold text-gray-900 w-6 text-center ${size === "sm" ? "text-base" : "text-xl"}`}>
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={max !== undefined && value >= max}
        className={`${btnSize} rounded-full border flex items-center justify-center transition-colors ${
          max !== undefined && value >= max
            ? "bg-gray-200 cursor-not-allowed border-gray-300 text-gray-400"
            : "bg-white hover:bg-gray-100 border-gray-300"
        }`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};

export default ModifyGuestSelector;