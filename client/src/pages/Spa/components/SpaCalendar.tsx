import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import SpaDateCell from './SpaDateCell';
import SpaSlotDialog from './SpaSlotDialog';
import {
    getSpaForDateRangeService,
    createSpaDateService,
    createSpaSlotsService,
    deleteSpaDateService,
    deleteSpaSlotService,
    markSlotAsBookedService,
    markSlotAsAvailableService
} from '../services/spa-slot.services';
import type { ISpaDates, ICSpaSlotS } from '../interfaces/spa-slot.type';

export default function SpaCalendar({ spaId, propertyId }: { spaId: string, propertyId: string }) {
   const navigate = useNavigate();
   const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
   const [spaDates, setSpaDates] = useState<ISpaDates[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   const [slotDialogOpen, setSlotDialogOpen] = useState(false);
   const [selectedDateContext, setSelectedDateContext] = useState<{ date: Date, spaDateId: string } | null>(null);

   useEffect(() => {
       fetchSpaDates();
   }, [currentMonth, spaId]);

   const fetchSpaDates = async () => {
       setIsLoading(true);
       const startDate = startOfMonth(currentMonth);
       const endDate = endOfMonth(currentMonth);
       const res = await getSpaForDateRangeService(spaId, { startDate, endDate });
       if (res?.success) {
           setSpaDates(res.data || []);
       } else {
           setSpaDates([]);
           toast.error(res?.message || 'Failed to fetch spa dates');
       }
       setIsLoading(false);
   };

   const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
   const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

   // Grid dates
   const monthStart = startOfMonth(currentMonth);
   const monthEnd = endOfMonth(monthStart);
   const startDate = startOfWeek(monthStart);
   const endDate = endOfWeek(monthEnd);
   const dayIntervals = eachDayOfInterval({ start: startDate, end: endDate });
   const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   // Actions
   const handleAddSpaDate = async (date: Date) => {
      setIsLoading(true);
      const res = await createSpaDateService(spaId, { date });
      if (res?.success) {
          toast.success('Date marked for spa');
          await fetchSpaDates();
      } else {
          toast.error(res?.message || 'Failed to mark date');
      }
      setIsLoading(false);
   };

   const handleRemoveSpaDate = async (id: string) => {
      if (!confirm("Are you sure you want to remove this Spa Date and all its slots?")) return;
      setIsLoading(true);
      const res = await deleteSpaDateService(id);
      if (res?.success) {
          toast.success('Spa date removed');
          await fetchSpaDates();
      } else {
          toast.error(res?.message || 'Failed to remove date');
      }
      setIsLoading(false);
   };

   const handleOpenSlotDialog = (date: Date, spaDateId: string) => {
      setSelectedDateContext({ date, spaDateId });
      setSlotDialogOpen(true);
   };

   const handleSaveSlot = async (data: ICSpaSlotS) => {
      if (!selectedDateContext) return;
      setIsLoading(true);
      const res = await createSpaSlotsService(selectedDateContext.spaDateId, data);
      if (res?.success) {
         toast.success('Slot added successfully');
         await fetchSpaDates();
      } else {
         toast.error(res?.message || 'Failed to add slot');
      }
      setIsLoading(false);
   };

   const handleRemoveSlot = async (id: string) => {
      if (!confirm("Delete this slot?")) return;
      setIsLoading(true);
      const res = await deleteSpaSlotService(id);
      if (res?.success) {
          toast.success('Slot deleted');
          await fetchSpaDates();
      } else {
          toast.error(res?.message || 'Failed to delete slot');
      }
      setIsLoading(false);
   };

   const handleMarkBooked = async (id: string) => {
      setIsLoading(true);
      const res = await markSlotAsBookedService(id);
      if (res?.success) {
          toast.success('Slot marked as booked');
          await fetchSpaDates();
      } else {
          toast.error(res?.message || 'Failed to mark as booked');
      }
      setIsLoading(false);
   };

   const handleMarkAvailable = async (id: string) => {
      setIsLoading(true);
      const res = await markSlotAsAvailableService(id);
      if (res?.success) {
          toast.success('Slot marked as available');
          await fetchSpaDates();
      } else {
          toast.error(res?.message || 'Failed to mark as available');
      }
      setIsLoading(false);
   };

   return (
     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border p-4">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
             <div className="flex items-center space-x-4">
                 <Button variant="outline" size="sm" onClick={() => navigate(`/property/spa/${propertyId}`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Spas
                 </Button>
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                    {format(currentMonth, 'MMMM yyyy')}
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                 </h2>
             </div>
             <div className="flex items-center space-x-2">
                 <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                 <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="w-4 h-4" /></Button>
             </div>
         </div>

         {/* Weekdays */}
         <div className="grid grid-cols-7 border-b pb-2">
             {weekDays.map(day => (
                 <div key={day} className="text-center font-semibold text-sm text-gray-600 uppercase tracking-wider">{day}</div>
             ))}
         </div>

         {/* Grid */}
         <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-200 border-x border-b gap-px overflow-y-auto min-h-[500px]">
             {dayIntervals.map((day, i) => {
                 // Component assumes dates in API map directly
                 const spaDate = spaDates.find(sd => isSameDay(new Date(sd.date), day));
                 return (
                     <SpaDateCell 
                       key={day.toString() + i}
                       day={day}
                       currentMonth={currentMonth}
                       spaDate={spaDate}
                       onAddSpaDate={handleAddSpaDate}
                       onRemoveSpaDate={handleRemoveSpaDate}
                       onAddSlot={handleOpenSlotDialog}
                       onRemoveSlot={handleRemoveSlot}
                       onMarkBooked={handleMarkBooked}
                       onMarkAvailable={handleMarkAvailable}
                     />
                 );
             })}
         </div>

         {/* Dialog */}
         <SpaSlotDialog 
             isOpen={slotDialogOpen}
             onClose={() => setSlotDialogOpen(false)}
             onSave={handleSaveSlot}
             selectedDate={selectedDateContext?.date || null}
         />
     </div>
   );
}
