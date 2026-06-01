"use client";

import { type FC } from "react";
import { isBefore, startOfDay } from "date-fns";
import { AlertTriangle, Plus, Trash2, CalendarDays, BedDouble, ArrowRight } from "lucide-react";
import type { IAmendRoom } from "../types/amend.types";
import { useTranslation } from "react-i18next";


interface IGuestSelectorProps {
  checkInDate: string;
  checkOutDate: string;
  roomConfigs: IAmendRoom[];
  originalCheckIn: string;
  originalCheckOut: string;
  originalRooms: number;
  dateErrors: { checkIn?: string; checkOut?: string };
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onAddRoom: () => void;
  onRemoveRoom: (i: number) => void;
  onAdultChange: (roomIdx: number, delta: number) => void;
  onChildChange: (roomIdx: number, delta: number) => void;
  onChildAgeChange: (roomIdx: number, childIdx: number, age: number) => void;
  onApply: () => void;
}

const formatDateForInput = (date: Date) => date.toISOString().split("T")[0];

const todayStr = formatDateForInput(new Date());
const tomorrowStr = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateForInput(d);
})();

const Counter: FC<{
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
}> = ({ value, onDecrement, onIncrement, min = 0 }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onDecrement}
      disabled={value <= min}
      className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center
        text-card-foreground font-bold hover:bg-accent transition-colors
        disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
    >
      −
    </button>
    <span className="w-6 text-center text-sm font-bold text-card-foreground tabular-nums">{value}</span>
    <button
      onClick={onIncrement}
      className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center
        text-card-foreground font-bold hover:bg-accent transition-colors text-lg leading-none"
    >
      +
    </button>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const GuestSelector: FC<IGuestSelectorProps> = ({
  checkInDate,
  checkOutDate,
  roomConfigs,
  originalCheckIn,
  originalCheckOut,
  originalRooms,
  dateErrors,
  onCheckInChange,
  onCheckOutChange,
  onAddRoom,
  onRemoveRoom,
  onAdultChange,
  onChildChange,
  onChildAgeChange,
  onApply,
}) => {
  const { t } = useTranslation();
  const gs = "AmendReservation.guestSelector";

  const checkInIsPast = isBefore(startOfDay(new Date(originalCheckIn)), startOfDay(new Date()));
  const totalAdults = roomConfigs.reduce((s, r) => s + r.adults, 0);
  const totalChildren = roomConfigs.reduce((s, r) => s + r.children, 0);
  const totalChildAges = roomConfigs.flatMap((r) => r.childAges);

  const canApply =
    !!checkInDate &&
    !!checkOutDate &&
    !dateErrors.checkIn &&
    !dateErrors.checkOut &&
    roomConfigs.every((r) => r.childAges.every((age) => age !== null && age !== undefined));

  return (
    <div className="space-y-6">

      {/* ── Dates ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-card-foreground">{t(`${gs}.stayDates`)}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Check-in */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t(`${gs}.checkIn`)}
            </label>
            <input
              type="date"
              value={checkInDate}
              min={todayStr}
              disabled={checkInIsPast}
              onChange={(e) => onCheckInChange(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm bg-background text-card-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                ${dateErrors.checkIn ? "border-destructive bg-destructive/5" : "border-border"}
                ${checkInIsPast ? "opacity-60 cursor-not-allowed bg-muted" : "hover:border-primary/50"}`}
            />
            {checkInIsPast && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                {t(`${gs}.checkInPassed`)}
              </p>
            )}
            {dateErrors.checkIn && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                {dateErrors.checkIn}
              </p>
            )}
          </div>

          {/* Check-out */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t(`${gs}.checkOut`)}
            </label>
            <input
              type="date"
              value={checkOutDate}
              min={tomorrowStr}
              onChange={(e) => onCheckOutChange(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm bg-background text-card-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                ${dateErrors.checkOut ? "border-destructive bg-destructive/5" : "border-border"}
                hover:border-primary/50`}
            />
            {dateErrors.checkOut && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                {dateErrors.checkOut}
              </p>
            )}
          </div>
        </div>

        {/* Original dates reference */}
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="font-medium">{t(`${gs}.original`)}</span>
          {new Date(originalCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {" → "}
          {new Date(originalCheckOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* ── Rooms ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-card-foreground">
              {t(`${gs}.rooms`)}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                {t(`${gs}.roomsOriginally`, { count: originalRooms })}
              </span>
            </p>
          </div>
          <button
            onClick={onAddRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/40
              text-xs font-medium text-primary hover:bg-primary/5 hover:border-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {t(`${gs}.addRoom`)}
          </button>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
          {roomConfigs.map((room, roomIdx) => (
            <div
              key={roomIdx}
              className="rounded-xl border border-border bg-card p-4 space-y-4 transition-all hover:border-primary/30"
            >
              {/* Room header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {roomIdx + 1}
                  </span>
                  <span className="text-sm font-semibold text-card-foreground">
                    {t(`${gs}.room`, { number: roomIdx + 1 })}
                  </span>
                </div>
                {roomConfigs.length > 1 && (
                  <button
                    onClick={() => onRemoveRoom(roomIdx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t(`${gs}.adults`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`${gs}.adultsMin`)}</p>
                </div>
                <Counter
                  value={room.adults}
                  min={1}
                  onDecrement={() => onAdultChange(roomIdx, -1)}
                  onIncrement={() => onAdultChange(roomIdx, 1)}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t(`${gs}.children`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`${gs}.childrenAgeNote`)}</p>
                </div>
                <Counter
                  value={room.children}
                  min={0}
                  onDecrement={() => onChildChange(roomIdx, -1)}
                  onIncrement={() => onChildChange(roomIdx, 1)}
                />
              </div>

              {/* Child age inputs */}
              {room.children > 0 && (
                <div className="grid grid-cols-3 gap-2.5 pt-1">

                  {room.childAges.map((age, childIdx) => (
                    <div key={childIdx} className="mt-3">
                      {childIdx === 0 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          {t(`${gs}.childAgesRequired`)}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-muted-foreground w-16 flex-shrink-0">
                          {t(`${gs}.child`, { number: childIdx + 1 })}
                        </label>
                        <select
                          value={age}
                          onChange={(e) => onChildAgeChange(roomIdx, childIdx, Number(e.target.value))}
                          className="flex-1 border border-border rounded-lg px-2 py-1.5 text-sm bg-background
                    text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20
                    focus:border-primary transition-all"
                        >
                          {Array.from({ length: 16 }, (_, a) => (
                            <option key={a} value={a}>
                              {a === 0
                                ? t(`${gs}.lessThanOneYear`)
                                : `${a} ${a === 1 ? t(`${gs}.yearSingular`) : t(`${gs}.yearPlural`)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary pill */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
          <span className="font-semibold text-card-foreground">
            {roomConfigs.length} {roomConfigs.length === 1 ? t(`${gs}.summaryRoom`) : t(`${gs}.summaryRooms`)}
          </span>
          <span className="text-border">·</span>
          <span>{totalAdults} {totalAdults === 1 ? t(`${gs}.summaryAdult`) : t(`${gs}.summaryAdults`)}</span>
          {totalChildren > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{totalChildren} {totalChildren === 1 ? t(`${gs}.summaryChild`) : t(`${gs}.summaryChildren`)}</span>
              <span className="text-muted-foreground/60">
                {t(`${gs}.summaryAges`, { ages: totalChildAges.join(", ") })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Apply Button ── */}
      <div className="pt-2">
        <button
          onClick={onApply}
          disabled={!canApply}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-semibold text-sm
            bg-primary text-primary-foreground hover:bg-primary/90 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          {t(`${gs}.continueToGuests`)}
          <ArrowRight className="w-4 h-4" />
        </button>
        {!canApply && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t(`${gs}.fillRequired`)}
          </p>
        )}
      </div>
    </div>
  );
};

export default GuestSelector;