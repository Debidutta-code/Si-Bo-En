"use client";

import { type FC } from "react";
import { ArrowRight, ArrowLeft, User, Baby } from "lucide-react";
import type { IAmendGuest, IGuestFieldErrors } from "../types/amend.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IGuestDetailsProps {
  guests: IAmendGuest[];
  guestErrors: Record<string, IGuestFieldErrors>;
  onGuestChange: (index: number, field: keyof IAmendGuest, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

interface IGuestCardProps {
  guest: IAmendGuest;
  index: number;
  displayIndex: number;
  errors: IGuestFieldErrors;
  onGuestChange: (index: number, field: keyof IAmendGuest, value: string) => void;
}

// ─── GuestCard (defined OUTSIDE parent — prevents remount on every keystroke) ─

const GuestCard: FC<IGuestCardProps> = ({ guest, index, displayIndex, errors, onGuestChange }) => {
  const isAdult = guest.type === "adult";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30">
      {/* Card header */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b border-border
        ${isAdult ? "bg-primary/5" : "bg-muted/50"}`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
          ${isAdult ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {isAdult ? <User className="w-3.5 h-3.5" /> : <Baby className="w-3.5 h-3.5" />}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider
            ${isAdult ? "text-primary" : "text-muted-foreground"}`}>
            {isAdult ? "Adult" : "Child"} {displayIndex}
          </span>
          {guest.type === "child" && guest.age != null && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              Age {guest.age}
            </span>
          )}
        </div>
        {/* Fill indicator */}
        <div className="ml-auto">
          {guest.firstName.trim() && guest.lastName.trim()
            ? <span className="w-2 h-2 rounded-full bg-green-500 block" />
            : <span className="w-2 h-2 rounded-full bg-amber-400 block" />
          }
        </div>
      </div>

      {/* Fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John"
              value={guest.firstName}
              onChange={(e) => onGuestChange(index, "firstName", e.target.value)}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-background text-card-foreground
                placeholder:text-muted-foreground/50
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                ${errors.firstName ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/40"}`}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Smith"
              value={guest.lastName}
              onChange={(e) => onGuestChange(index, "lastName", e.target.value)}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-background text-card-foreground
                placeholder:text-muted-foreground/50
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
                ${errors.lastName ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/40"}`}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
            <input
              type="date"
              value={guest.dob}
              onChange={(e) => onGuestChange(index, "dob", e.target.value)}
              className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm bg-background
                text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20
                focus:border-primary transition-all hover:border-primary/40"
            />
          </div>

          {guest.type === "child" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Age</label>
              <select
                value={guest.age ?? 0}
                onChange={(e) => onGuestChange(index, "age", e.target.value)}
                className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm bg-background
                text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/20
                focus:border-primary transition-all hover:border-primary/40"
              >
                {Array.from({ length: 16 }, (_, age) => (
                  <option key={age} value={age}>
                    {age === 0 ? "< 1 year" : `${age} ${age === 1 ? "year" : "years"}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const GuestDetails: FC<IGuestDetailsProps> = ({
  guests,
  guestErrors,
  onGuestChange,
  onBack,
  onNext,
}) => {
  const adultGuests = guests.filter((g) => g.type === "adult");
  const childGuests = guests.filter((g) => g.type === "child");
  const hasErrors = Object.keys(guestErrors).length > 0;
  const allFilled = guests.every(
    (g) => g.firstName.trim().length > 0 && g.lastName.trim().length > 0
  );

  let adultCounter = 0;
  let childCounter = 0;

  return (
    <div className="space-y-5">

      {/* Progress hint */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
        <span>
          <span className="font-semibold text-card-foreground">{adultGuests.length}</span> adult{adultGuests.length !== 1 ? "s" : ""}
          {childGuests.length > 0 && (
            <>, <span className="font-semibold text-card-foreground">{childGuests.length}</span> child{childGuests.length !== 1 ? "ren" : ""}</>
          )}
        </span>
        <span>
          {guests.filter((g) => g.firstName.trim() && g.lastName.trim()).length}/{guests.length} filled
        </span>
      </div>

      {/* Guest cards */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
        {guests.map((guest, index) => {
          let displayIndex: number;
          if (guest.type === "adult") {
            adultCounter++;
            displayIndex = adultCounter;
          } else {
            childCounter++;
            displayIndex = childCounter;
          }
          return (
            <GuestCard
              key={index}
              guest={guest}
              index={index}
              displayIndex={displayIndex}
              errors={guestErrors[`guest-${index}`] || {}}
              onGuestChange={onGuestChange}
            />
          );
        })}
      </div>

      {/* Hints */}
      {hasErrors && (
        <p className="text-xs text-destructive text-center">
          Please fix the errors above before continuing.
        </p>
      )}
      {!allFilled && !hasErrors && (
        <p className="text-xs text-muted-foreground text-center italic">
          Fill in all guest names to continue.
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-medium
            text-muted-foreground hover:text-card-foreground hover:bg-accent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!allFilled}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm
            bg-primary text-primary-foreground hover:bg-primary/90 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md active:scale-[0.99]"
        >
          Review & Check Price
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GuestDetails;