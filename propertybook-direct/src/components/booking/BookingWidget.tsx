import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar, Users, Minus, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import type { Guest } from '@/types/booking';

const PROPERTY_CODE = '4BTXDZ';

interface GuestSelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function GuestSelector({ label, value, onChange, min = 0, max = 10 }: GuestSelectorProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold">{value}</span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function BookingWidget() {
  const navigate = useNavigate();
  const { setSearchCriteria } = useBooking();
  
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const [checkIn, setCheckIn] = useState<Date>(today);
  const [checkOut, setCheckOut] = useState<Date>(tomorrow);
  const [guests, setGuests] = useState<Guest>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);

  const handleSearch = () => {
    const criteria = {
      startDate: format(checkIn, 'yyyy-MM-dd'),
      endDate: format(checkOut, 'yyyy-MM-dd'),
      guests,
      propertyCode: PROPERTY_CODE,
    };
    
    setSearchCriteria(criteria);
    navigate(`/rooms?code=${PROPERTY_CODE}`);
  };

  const guestSummary = `${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}${
    guests.children > 0 ? `, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}` : ''
  }${guests.rooms > 1 ? ` · ${guests.rooms} Rooms` : ''}`;

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border">
      <h3 className="text-lg font-semibold mb-6">Book Your Stay</h3>
      
      <div className="space-y-4">
        {/* Date pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Check-in */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-14 px-4',
                  !checkIn && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">Check-in</span>
                  <span className="font-medium">
                    {checkIn ? format(checkIn, 'EEE, MMM d') : 'Select date'}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  if (date) {
                    setCheckIn(date);
                    if (date >= checkOut) {
                      setCheckOut(addDays(date, 1));
                    }
                  }
                }}
                disabled={(date) => date < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Check-out */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-14 px-4',
                  !checkOut && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">Check-out</span>
                  <span className="font-medium">
                    {checkOut ? format(checkOut, 'EEE, MMM d') : 'Select date'}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={(date) => date && setCheckOut(date)}
                disabled={(date) => date <= checkIn}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests selector */}
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-14 px-4"
            >
              <Users className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Guests & Rooms</span>
                <span className="font-medium">{guestSummary}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-1">
              <GuestSelector
                label="Adults"
                value={guests.adults}
                onChange={(value) => setGuests({ ...guests, adults: value })}
                min={1}
                max={10}
              />
              <GuestSelector
                label="Children"
                value={guests.children}
                onChange={(value) => setGuests({ ...guests, children: value })}
                min={0}
                max={6}
              />
              <GuestSelector
                label="Rooms"
                value={guests.rooms}
                onChange={(value) => setGuests({ ...guests, rooms: value })}
                min={1}
                max={5}
              />
            </div>
            <Button 
              className="w-full mt-4" 
              size="sm"
              onClick={() => setGuestsOpen(false)}
            >
              Done
            </Button>
          </PopoverContent>
        </Popover>

        {/* Book button */}
        <Button 
          variant="booking" 
          size="xl" 
          className="w-full"
          onClick={handleSearch}
        >
          Check Availability
        </Button>
      </div>
    </div>
  );
}
