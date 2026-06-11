import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarRange, Clock, Hash } from 'lucide-react';
import type { ICSpaSlotS } from '../interfaces/spa-slot.type';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: Date; slots: ICSpaSlotS[] }[]) => void;
  selectedDates: Date[];
  serviceTime: number;
}

export default function SpaRangeConfigDialog({
  isOpen,
  onClose,
  onSave,
  selectedDates,
  serviceTime,
}: Props) {
  const [startTime, setStartTime] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStartTime('');
      setNumberOfSlots(1);
    }
  }, [isOpen]);

  const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0) return null;

  const rangeStart = sortedDates[0];
  const rangeEnd = sortedDates[sortedDates.length - 1];
  const isSingleDay = sortedDates.length === 1;

  const buildSlotsForDate = (date: Date): ICSpaSlotS[] => {
    const [sh, sm] = startTime.split(':').map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const slots: ICSpaSlotS[] = [];
    let currentStart = new Date(year, month, day, sh, sm, 0, 0);

    for (let i = 0; i < numberOfSlots; i++) {
      const end = new Date(currentStart);
      end.setMinutes(end.getMinutes() + serviceTime);

      const pad = (n: number) => String(n).padStart(2, '0');
      const toStr = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000Z`;

      slots.push({
        // @ts-ignore
        startTime: toStr(currentStart),
        // @ts-ignore
        endTime: toStr(end),
        isBooked: false,
      });

      currentStart = new Date(end);
    }

    return slots;
  };

  const handleSave = () => {
    if (!startTime || sortedDates.length === 0) return;
    const result = sortedDates.map((date) => ({
      date,
      slots: buildSlotsForDate(date),
    }));
    onSave(result);
    onClose();
  };

  const previewStartTime = (() => {
    if (!startTime) return null;
    try {
      const [h, m] = startTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return format(d, 'p');
    } catch {
      return null;
    }
  })();

  const previewEndTime = (() => {
    if (!startTime) return null;
    try {
      const [h, m] = startTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      const base = new Date();
      base.setHours(h, m, 0, 0);
      const end = new Date(base.getTime() + numberOfSlots * serviceTime * 60000);
      return format(end, 'p');
    } catch {
      return null;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-blue-500" />
            Configure Spa Dates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Date range badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <CalendarRange className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-sm text-blue-800 font-medium">
              {isSingleDay
                ? format(rangeStart, 'MMM dd, yyyy')
                : `${format(rangeStart, 'MMM dd')} → ${format(rangeEnd, 'MMM dd, yyyy')}`}
            </div>
            <div className="ml-auto text-xs text-blue-500 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
              {sortedDates.length} {sortedDates.length === 1 ? 'day' : 'days'}
            </div>
          </div>

          {/* Start time */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              First slot start time
            </Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Number of slots */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              Number of slots ({serviceTime} min each)
            </Label>
            <Input
              type="number"
              min={1}
              max={24}
              value={numberOfSlots}
              onChange={(e) => setNumberOfSlots(Number(e.target.value))}
            />
          </div>

          {/* Preview */}
          {previewStartTime && previewEndTime && (
            <div className="text-xs text-gray-500 bg-gray-50 border rounded p-3 leading-relaxed">
              <span className="font-semibold text-gray-700">
                {numberOfSlots} slot{numberOfSlots > 1 ? 's' : ''}
              </span>{' '}
              ×{' '}
              <span className="font-semibold text-gray-700">
                {sortedDates.length} day{sortedDates.length > 1 ? 's' : ''}
              </span>
              {' '}— each day from{' '}
              <span className="font-semibold text-gray-700">{previewStartTime}</span>
              {' '}to{' '}
              <span className="font-semibold text-gray-700">{previewEndTime}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!startTime || numberOfSlots < 1 || sortedDates.length === 0}
          >
            Configure {sortedDates.length} {sortedDates.length === 1 ? 'Date' : 'Dates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}