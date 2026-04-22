import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ICSpaSlotS } from '../interfaces/spa-slot.type';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICSpaSlotS) => void;
  selectedDate: Date | null;
}

export default function SpaSlotDialog({ isOpen, onClose, onSave, selectedDate }: Props) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStart('');
      setEnd('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!start || !selectedDate) return;
    
    const [sh, sm] = start.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(sh, sm, 0, 0);

    let endTime: Date | null = null;
    if (end) {
      const [eh, em] = end.split(':').map(Number);
      endTime = new Date(selectedDate);
      endTime.setHours(eh, em, 0, 0);
    }

    onSave({ startTime, endTime, isBooked: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Slot for {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label>Start Time (Required)</Label>
             <Input type="time" value={start} onChange={e => setStart(e.target.value)} required />
           </div>
           <div className="space-y-2">
             <Label>End Time (Optional)</Label>
             <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
           </div>
        </div>
        <DialogFooter>
           <Button variant="outline" onClick={onClose}>Cancel</Button>
           <Button onClick={handleSave} disabled={!start}>Add Slot</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
