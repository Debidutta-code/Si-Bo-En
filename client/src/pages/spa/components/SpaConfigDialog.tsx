import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarRange, Clock, Hash, Users, Calendar } from 'lucide-react';

export interface SlotConfig {
    startTime: string;
    endTime: string;
}

export interface SpaConfigPayload {
    dates: Date[];
    slots?: SlotConfig[];
    availability: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: SpaConfigPayload) => void;
    selectedDates: Date[];
    serviceTime: number;
    forceWithSlots?: boolean; // true = drag (hide mode toggle, always day+slots)
}

export default function SpaConfigDialog({
    isOpen, onClose, onSave, selectedDates, serviceTime, forceWithSlots = false,
}: Props) {
    const [mode, setMode] = useState<'day-only' | 'day-slots'>('day-slots');
    const [startTime, setStartTime] = useState('');
    const [numberOfSlots, setNumberOfSlots] = useState(1);
    const [availability, setAvailability] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setMode('day-slots');
            setStartTime('');
            setNumberOfSlots(1);
            setAvailability(1);
        }
    }, [isOpen]);

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    if (sortedDates.length === 0) return null;

    const rangeStart = sortedDates[0];
    const rangeEnd = sortedDates[sortedDates.length - 1];
    const isSingleDay = sortedDates.length === 1;

    // Build time-only slot templates (no date baked in — backend maps to each date)
    const buildSlots = (): SlotConfig[] => {
        const [sh, sm] = startTime.split(':').map(Number);
        const pad = (n: number) => String(n).padStart(2, '0');
        const toStr = (d: Date) =>
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000Z`;

        const slots: SlotConfig[] = [];
        let cur = new Date(2000, 0, 1, sh, sm, 0, 0); // dummy date, just for time math
        for (let i = 0; i < numberOfSlots; i++) {
            const end = new Date(cur.getTime() + serviceTime * 60000);
            slots.push({ startTime: toStr(cur), endTime: toStr(end) });
            cur = end;
        }
        return slots;
    };

    const handleSave = () => {
        onSave({
            dates: sortedDates,
            availability,
            ...(mode === 'day-slots' ? { slots: buildSlots() } : {}),
        });
        onClose();
    };

    const canSave = mode === 'day-only'
        ? true
        : !!startTime && numberOfSlots >= 1;

    const previewStart = (() => {
        if (!startTime) return null;
        const [h, m] = startTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        const d = new Date(); d.setHours(h, m, 0, 0);
        return format(d, 'p');
    })();

    const previewEnd = (() => {
        if (!startTime) return null;
        const [h, m] = startTime.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        const base = new Date(); base.setHours(h, m, 0, 0);
        return format(new Date(base.getTime() + numberOfSlots * serviceTime * 60000), 'p');
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

                    {/* Mode toggle — only for single cell click, not drag */}
                    {!forceWithSlots && (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMode('day-only')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                                    mode === 'day-only'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                Day Config Only
                            </button>
                            <button
                                onClick={() => setMode('day-slots')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                                    mode === 'day-slots'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <Clock className="w-4 h-4" />
                                Day + Slots
                            </button>
                        </div>
                    )}

                    {/* Slot fields — only in day-slots mode */}
                    {mode === 'day-slots' && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm font-medium">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    First slot start time
                                </Label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full"
                                />
                            </div>

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

                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5 text-sm font-medium">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    Availability per slot
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={availability}
                                    onChange={(e) => setAvailability(Number(e.target.value))}
                                />
                            </div>

                            {previewStart && previewEnd && (
                                <div className="text-xs text-gray-500 bg-gray-50 border rounded p-3 leading-relaxed">
                                    <span className="font-semibold text-gray-700">{numberOfSlots} slot{numberOfSlots > 1 ? 's' : ''}</span>
                                    {' × '}
                                    <span className="font-semibold text-gray-700">{sortedDates.length} day{sortedDates.length > 1 ? 's' : ''}</span>
                                    {' — each day from '}
                                    <span className="font-semibold text-gray-700">{previewStart}</span>
                                    {' to '}
                                    <span className="font-semibold text-gray-700">{previewEnd}</span>
                                    {', '}
                                    <span className="font-semibold text-gray-700">{availability} seat{availability > 1 ? 's' : ''}</span>
                                    {' per slot'}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!canSave}>
                        Configure {sortedDates.length} {sortedDates.length === 1 ? 'Date' : 'Dates'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}