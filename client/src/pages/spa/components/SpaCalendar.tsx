import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, addMonths, subMonths,
  isSameDay, isWithinInterval, isBefore, isAfter, startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SpaDateCell from './SpaDateCell';
import {
  getSpaForDateRangeService,
  deleteSpaDateService,
  deleteSpaSlotService,
  createSpaSlotsService,
  createSpaDateService,
} from '../services';
import type { ISpaDates, ISpa, ICSpaSlotS } from '../interfaces';
import BackButton from '@/components/shared/BackButton';
import SpaConfigDialog, { type SpaConfigPayload } from './SpaConfigDialog';

export default function SpaCalendar({
  spaId,
  spaDetails,
}: {
  spaId: string;
  propertyId: string;
  spaDetails: ISpa;
}) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [spaDates, setSpaDates] = useState<ISpaDates[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Delete contexts
  const [dateDeleteContext, setDateDeleteContext] = useState<string | null>(null);
  const [slotDeleteContext, setSlotDeleteContext] = useState<string | null>(null);

  // ── Drag-range selection state ──────────────────────────────────────────────
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configDates, setConfigDates] = useState<Date[]>([]);
  const [forceWithSlots, setForceWithSlots] = useState(false);
  useEffect(() => {
    fetchSpaDates();
  }, [currentMonth, spaId]);

  // Global mouseup — finalize drag even if user releases outside a cell
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) finalizeRange();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const fetchSpaDates = async () => {
    setIsLoading(true);
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    const res = await getSpaForDateRangeService(spaId, { startDate, endDate });
    if (res?.success) {
      setSpaDates(res.data || []);
    } else {
      setSpaDates([]);
      toast.error(res?.message || t('SpaCalendar.toast.fetchFailed'));
    }
    setIsLoading(false);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Grid dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const dayIntervals = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekDays = [
    t('SpaCalendar.weekDays.sun'), t('SpaCalendar.weekDays.mon'),
    t('SpaCalendar.weekDays.tue'), t('SpaCalendar.weekDays.wed'),
    t('SpaCalendar.weekDays.thu'), t('SpaCalendar.weekDays.fri'),
    t('SpaCalendar.weekDays.sat'),
  ];

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragStart = useCallback((date: Date) => {
    setDragStart(date);
    setDragEnd(date);
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((date: Date) => {
    if (isDragging) setDragEnd(date);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) finalizeRange();
  }, [isDragging, dragStart, dragEnd]);

  const finalizeRange = () => {
    if (!dragStart) { resetDrag(); return; }

    const start = dragEnd && isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
    const end = dragEnd && isAfter(dragEnd, dragStart) ? dragEnd : (dragStart === dragEnd ? dragStart : dragEnd || dragStart);

    const range = eachDayOfInterval({
      start: startOfDay(start),
      end: startOfDay(end ?? start),
    }).filter((d) => !isBefore(d, startOfDay(new Date())));

    if (range.length > 0) {
      setConfigDates(range);
      setForceWithSlots(true); // drag = always day+slots, no toggle
      setConfigDialogOpen(true);
    }
    resetDrag();
  };

  const resetDrag = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  /** Is a cell within the current drag selection? */
  const isCellSelected = (day: Date): boolean => {
    if (!dragStart) return false;
    const start = isBefore(dragEnd ?? dragStart, dragStart) ? (dragEnd ?? dragStart) : dragStart;
    const end = isAfter(dragEnd ?? dragStart, dragStart) ? (dragEnd ?? dragStart) : dragStart;
    return isWithinInterval(startOfDay(day), { start: startOfDay(start), end: startOfDay(end) });
  };
  const handleRemoveSpaDate = (id: string) => setDateDeleteContext(id);

  const confirmRemoveSpaDate = async () => {
    if (!dateDeleteContext) return;
    setIsLoading(true);
    const res = await deleteSpaDateService(dateDeleteContext);
    if (res?.success) {
      toast.success(t('SpaCalendar.toast.dateRemoved'));
      await fetchSpaDates();
    } else {
      toast.error(res?.message || t('SpaCalendar.toast.dateRemoveFailed'));
    }
    setIsLoading(false);
    setDateDeleteContext(null);
  };



  const handleRemoveSlot = (id: string) => setSlotDeleteContext(id);

  const confirmRemoveSlot = async () => {
    if (!slotDeleteContext) return;
    setIsLoading(true);
    const res = await deleteSpaSlotService(slotDeleteContext);
    if (res?.success) {
      toast.success(t('SpaCalendar.toast.slotDeleted'));
      await fetchSpaDates();
    } else {
      toast.error(res?.message || t('SpaCalendar.toast.slotDeleteFailed'));
    }
    setIsLoading(false);
    setSlotDeleteContext(null);
  };


  const handleCellClick = (date: Date) => {
    setConfigDates([date]);
    setForceWithSlots(false); // show mode toggle for single click
    setConfigDialogOpen(true);
  };

const handleSaveConfig = async (payload: SpaConfigPayload) => {
    setIsLoading(true);

    const isoDateStrings = payload.dates.map((d) =>
        new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
    );

    // Check which dates are missing from current spaDates state
    const missingDates = isoDateStrings.filter((isoDate) =>
        !spaDates.some((sd) => {
            const existing = new Date(sd.date);
            const incoming = new Date(isoDate);
            return (
                existing.getUTCFullYear() === incoming.getUTCFullYear() &&
                existing.getUTCMonth() === incoming.getUTCMonth() &&
                existing.getUTCDate() === incoming.getUTCDate()
            );
        })
    );

    // Step 1: only create dates that don't exist yet
    if (missingDates.length > 0) {
        const createRes = await createSpaDateService(spaId, missingDates);
        if (!createRes?.success) {
            toast.error(createRes?.message || 'Failed to create spa dates');
            setIsLoading(false);
            return;
        }
    }

    // Day-only config — done
    if (!payload.slots || payload.slots.length === 0) {
        toast.success('Dates configured successfully');
        await fetchSpaDates();
        setIsLoading(false);
        return;
    }

    // Step 2: get fresh records only if we created new dates, otherwise use state
    let freshDates: ISpaDates[] = spaDates;
    if (missingDates.length > 0) {
        const freshRes = await getSpaForDateRangeService(spaId, {
            startDate: startOfMonth(currentMonth),
            endDate: endOfMonth(currentMonth),
        });
        freshDates = freshRes?.data || [];
    }

    // Step 3: build all slots across all dates into one array
    const allSlots: (ICSpaSlotS & { spaDateId: string })[] = [];

    for (const targetDate of payload.dates) {
        const spaDateRecord = freshDates.find((sd) => {
            const d = new Date(sd.date);
            return (
                d.getUTCFullYear() === targetDate.getFullYear() &&
                d.getUTCMonth() === targetDate.getMonth() &&
                d.getUTCDate() === targetDate.getDate()
            );
        });

        if (!spaDateRecord) continue;

        const slotsForDate = payload.slots.map((slot) => {
            const startTemplate = new Date(slot.startTime);
            const endTemplate = new Date(slot.endTime);
            return {
                spaDateId: spaDateRecord.id,
                startTime: new Date(Date.UTC(
                    targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(),
                    startTemplate.getUTCHours(), startTemplate.getUTCMinutes(), 0, 0
                )),
                endTime: new Date(Date.UTC(
                    targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(),
                    endTemplate.getUTCHours(), endTemplate.getUTCMinutes(), 0, 0
                )),
                availability: payload.availability,
            } as any;
        });

        allSlots.push(...slotsForDate);
    }

    // Step 4: single API call for all slots
    if (allSlots.length > 0) {
        const slotRes = await createSpaSlotsService(allSlots);
        if (slotRes?.success) {
            toast.success(`Configured ${payload.dates.length} dates with ${allSlots.length} slots total`);
        } else {
            toast.error(slotRes?.message || 'Failed to create slots');
        }
    }

    await fetchSpaDates();
    setIsLoading(false);
};
  return (
    <div
      className="flex flex-col h-full bg-white rounded-xl shadow-sm border p-4"
      // Prevent text selection while dragging
      style={{ userSelect: isDragging ? 'none' : undefined }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {format(currentMonth, 'MMMM yyyy')}
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-[11px] text-gray-400 mb-2 ml-1">
        Drag across dates to configure a range at once
      </p>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b pb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-bold text-xs text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-100 border-x border-b gap-px overflow-y-auto"
        style={{ gridAutoRows: 'minmax(120px, auto)' }}
      >
        {dayIntervals.map((day, i) => {
          const spaDate = spaDates.find((sd) => {
            const d = new Date(sd.date);
            const localD = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
            return isSameDay(localD, day);
          });
          return (
            <SpaDateCell
              key={day.toString() + i}
              day={day}
              currentMonth={currentMonth}
              spaDate={spaDate}
              isSelected={isCellSelected(day)}
              isDragActive={isDragging}
              onRemoveSpaDate={handleRemoveSpaDate}
              onCellClick={handleCellClick}
              onRemoveSlot={handleRemoveSlot}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
      <SpaConfigDialog
        isOpen={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveConfig}
        selectedDates={configDates}
        serviceTime={spaDetails.serviceTime}
        forceWithSlots={forceWithSlots}
      />

      {/* Delete SpaDate Alert */}
      <AlertDialog open={!!dateDeleteContext} onOpenChange={(open) => !open && setDateDeleteContext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('SpaCalendar.deleteDateAlert.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('SpaCalendar.deleteDateAlert.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('SpaCalendar.deleteDateAlert.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmRemoveSpaDate}>
              {t('SpaCalendar.deleteDateAlert.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Slot Alert */}
      <AlertDialog open={!!slotDeleteContext} onOpenChange={(open) => !open && setSlotDeleteContext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('SpaCalendar.deleteSlotAlert.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('SpaCalendar.deleteSlotAlert.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('SpaCalendar.deleteSlotAlert.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmRemoveSlot}>
              {t('SpaCalendar.deleteSlotAlert.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}