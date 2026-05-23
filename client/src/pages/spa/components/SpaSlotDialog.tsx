import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ICSpaSlotS } from '../interfaces/spa-slot.type';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICSpaSlotS[]) => void;
  selectedDate: Date | null;
  serviceTime: number;
}

export default function SpaSlotDialog({ isOpen, onClose, onSave, selectedDate, serviceTime }: Props) {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStartTime('');
      setNumberOfSlots(1);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!startTime || !selectedDate) return;
    
    const [sh, sm] = startTime.split(':').map(Number);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = selectedDate.getDate();

    const newSlots: ICSpaSlotS[] = [];

    let currentStart = new Date(year, month, date, sh, sm, 0, 0);

    for (let i = 0; i < numberOfSlots; i++) {
        const end = new Date(currentStart);
        end.setMinutes(end.getMinutes() + serviceTime);
        
        const startString = `${currentStart.getFullYear()}-${String(currentStart.getMonth() + 1).padStart(2,'0')}-${String(currentStart.getDate()).padStart(2,'0')}T${String(currentStart.getHours()).padStart(2,'0')}:${String(currentStart.getMinutes()).padStart(2,'0')}:00.000Z`;
        
        const endString = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}T${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}:00.000Z`;

        newSlots.push({
           // @ts-ignore
           startTime: startString,
           // @ts-ignore
           endTime: endString,
           isBooked: false
        });

        currentStart = new Date(end);
    }

    onSave(newSlots);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('SpaSlotDialog.title', { date: selectedDate ? format(selectedDate, 'MMM dd, yyyy') : '' })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label>{t('SpaSlotDialog.firstSlotStartTime')}</Label>
             <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
           </div>
           <div className="space-y-2">
             <Label>{t('SpaSlotDialog.numberOfSlots', { serviceTime })}</Label>
             <Input type="number" min={1} max={24} value={numberOfSlots} onChange={e => setNumberOfSlots(Number(e.target.value))} />
           </div>
           {startTime && (
               <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                   {t('SpaSlotDialog.preview', {
                     count: numberOfSlots,
                     serviceTime,
                     endTime: format(
                       new Date(
                         new Date(
                           new Date(selectedDate || new Date()).setHours(
                             Number(startTime.split(':')[0]),
                             Number(startTime.split(':')[1]),
                             0,
                             0
                           )
                         ).getTime() + numberOfSlots * serviceTime * 60000
                       ),
                       'p'
                     )
                   })}
               </div>
           )}
        </div>
        <DialogFooter>
           <Button variant="outline" onClick={onClose}>{t('SpaSlotDialog.cancel')}</Button>
           <Button onClick={handleSave} disabled={!startTime || numberOfSlots < 1}>{t('SpaSlotDialog.addSlots')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}