import React from 'react';
import { isSameMonth, isSameDay, format, isBefore, startOfDay } from 'date-fns';
import { Plus, Trash, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ISpaDates } from '../interfaces/spa-slot.type';

interface Props {
  day: Date;
  currentMonth: Date;
  spaDate?: ISpaDates;
  onAddSpaDate: (d: Date) => void;
  onRemoveSpaDate: (id: string) => void;
  onAddSlot: (d: Date, spaDateId: string) => void;
  onRemoveSlot: (id: string) => void;
  onMarkBooked: (id: string) => void;
  onMarkAvailable: (id: string) => void;
}

export default function SpaDateCell({
  day, currentMonth, spaDate,
  onAddSpaDate, onRemoveSpaDate, onAddSlot,
  onRemoveSlot, onMarkBooked, onMarkAvailable
}: Props) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const isPast = isBefore(day, startOfDay(new Date()));

  return (
    <div className={`min-h-[160px] p-2 relative flex flex-col ${!isCurrentMonth ? 'bg-gray-50 opacity-60' : 'bg-white'} ${isToday ? 'border-blue-500 border-2 z-10 shadow-sm' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {format(day, 'd')}
        </span>
        {spaDate && (
          <div className="flex space-x-1">
             <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-100/50" onClick={() => onAddSlot(day, spaDate.id)} title="Add Slot">
               <Plus className="w-4 h-4" />
             </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100/50" onClick={() => onRemoveSpaDate(spaDate.id)} title="Remove Date & Slots">
               <Trash className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[120px] pr-1">
        {!spaDate ? (
          <div className="m-auto w-full px-2">
             <Button variant="outline" size="sm" className="w-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm" onClick={() => onAddSpaDate(day)} disabled={isPast}>
               Mark as Spa Date
             </Button>
          </div>
        ) : (
           spaDate.Slots && spaDate.Slots.length > 0 ? (
             [...spaDate.Slots].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(slot => (
               <div key={slot.id} className={`text-xs p-1.5 rounded-md border ${slot.isBooked ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} flex flex-col group transition-all hover:shadow-md`}>
                  <div className="flex justify-between items-center">
                     <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis text-gray-800">
                       {format(new Date(slot.startTime), 'hh:mm a')} {slot.endTime && <span className="opacity-75 font-normal">- {format(new Date(slot.endTime), 'hh:mm a')}</span>}
                     </span>
                     <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${slot.isBooked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {slot.isBooked ? 'Booked' : 'Avail'}
                     </span>
                  </div>
                  <div className="hidden group-hover:flex justify-end gap-2 mt-1.5 border-t border-black/5 pt-1">
                     {slot.isBooked ? (
                        <button title="Mark Available" onClick={() => onMarkAvailable(slot.id)} className="text-green-600 hover:text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Avail</button>
                     ) : (
                        <button title="Mark Booked" onClick={() => onMarkBooked(slot.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3"/> Book</button>
                     )}
                     <button title="Delete Slot" onClick={() => onRemoveSlot(slot.id)} className="text-gray-400 hover:text-gray-700 ml-auto"><Trash2 className="w-3 h-3"/></button>
                  </div>
               </div>
             ))
           ) : (
             <div className="text-xs text-gray-400 italic text-center mt-2 flex flex-col items-center">
                <span>No slots configured.</span>
                <span className="text-[10px] mt-1">Click '+' to add one.</span>
             </div>
           )
        )}
      </div>
    </div>
  );
}
