import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SpaDateCell from './SpaDateCell';
import SpaSlotDialog from './SpaSlotDialog';
import {
    getSpaForDateRangeService,
    createSpaDateService,
    createSpaSlotsService,
    deleteSpaDateService,
    deleteSpaSlotService,
} from '../services';
import type { ISpaDates, ICSpaSlotS, ISpa } from '../interfaces';
import BackButton from '@/components/shared/BackButton';

export default function SpaCalendar({ spaId,  spaDetails }: { spaId: string, propertyId: string, spaDetails: ISpa }) {
   const { t } = useTranslation();
   const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
   const [spaDates, setSpaDates] = useState<ISpaDates[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   const [slotDialogOpen, setSlotDialogOpen] = useState(false);
   const [selectedDateContext, setSelectedDateContext] = useState<{ date: Date, spaDateId: string } | null>(null);

   const [dateDeleteContext, setDateDeleteContext] = useState<string | null>(null);
   const [slotDeleteContext, setSlotDeleteContext] = useState<string | null>(null);

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
           toast.error(res?.message || t('SpaCalendar.toast.fetchFailed'));
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
   const weekDays = [
     t('SpaCalendar.weekDays.sun'),
     t('SpaCalendar.weekDays.mon'),
     t('SpaCalendar.weekDays.tue'),
     t('SpaCalendar.weekDays.wed'),
     t('SpaCalendar.weekDays.thu'),
     t('SpaCalendar.weekDays.fri'),
     t('SpaCalendar.weekDays.sat'),
   ];

   // Actions
   const handleAddSpaDate = async (date: Date) => {
      setIsLoading(true);
      const floatDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      const res = await createSpaDateService(spaId, { date: floatDate });
      if (res?.success) {
          toast.success(t('SpaCalendar.toast.dateMarked'));
          await fetchSpaDates();
      } else {
          toast.error(res?.message || t('SpaCalendar.toast.dateMarkFailed'));
      }
      setIsLoading(false);
   };

   const handleRemoveSpaDate = async (id: string) => {
      setDateDeleteContext(id);
   };

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

   const handleOpenSlotDialog = (date: Date, spaDateId: string) => {
      setSelectedDateContext({ date, spaDateId });
      setSlotDialogOpen(true);
   };

   const handleSaveSlot = async (data: ICSpaSlotS[]) => {
      if (!selectedDateContext) return;
      setIsLoading(true);
      const res = await createSpaSlotsService(selectedDateContext.spaDateId, data);
      if (res?.success) {
         toast.success(t('SpaCalendar.toast.slotsAdded'));
         await fetchSpaDates();
      } else {
         toast.error(res?.message || t('SpaCalendar.toast.slotsAddFailed'));
      }
      setIsLoading(false);
   };

   const handleRemoveSlot = async (id: string) => {
      setSlotDeleteContext(id);
   };

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

   return (
     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border p-4">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
             <div className="flex items-center space-x-4">
                 <BackButton/>
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
         <div className="grid grid-cols-7 border-b pb-3">
             {weekDays.map(day => (
                 <div key={day} className="text-center font-bold text-xs text-gray-500 uppercase tracking-widest">{day}</div>
             ))}
         </div>

         {/* Grid */}
         <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-100 border-x border-b gap-px overflow-y-auto"style={{ gridAutoRows: 'minmax(120px, auto)' }}>
             {dayIntervals.map((day, i) => {
                 const spaDate = spaDates.find(sd => {
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
                       onAddSpaDate={handleAddSpaDate}
                       onRemoveSpaDate={handleRemoveSpaDate}
                       onAddSlot={handleOpenSlotDialog}
                       onRemoveSlot={handleRemoveSlot}
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
             serviceTime={spaDetails.serviceTime}
         />

         {/* Delete SpaCalendar Date Alert */}
         <AlertDialog open={!!dateDeleteContext} onOpenChange={(open) => !open && setDateDeleteContext(null)}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>{t('SpaCalendar.deleteDateAlert.title')}</AlertDialogTitle>
               <AlertDialogDescription>
                 {t('SpaCalendar.deleteDateAlert.description')}
               </AlertDialogDescription>
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
               <AlertDialogDescription>
                 {t('SpaCalendar.deleteSlotAlert.description')}
               </AlertDialogDescription>
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