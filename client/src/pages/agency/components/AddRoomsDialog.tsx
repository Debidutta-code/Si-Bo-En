import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { addRoomsForAgenticProperty, getRoomsForAgenticProperty } from '../api/agentic-room.api';
import type { ICAgenticRoom, IRooms } from '../interfaces';
import { Loader2 } from 'lucide-react';
import Loader from '@/components/Loader/Loader';

interface AddRoomsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenticPropertyId: string;
  propertyId: string;
  onSuccess: () => void;
}

const AddRoomsDialog: React.FC<AddRoomsDialogProps> = ({
  open,
  onOpenChange,
  agenticPropertyId,
  propertyId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<IRooms[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());

  const fetchAvailableRooms = async () => {
    setFetchingRooms(true);
    try {
      // Fetch available rooms (rooms not yet allocated to this agency property)
      const response = await getRoomsForAgenticProperty(agenticPropertyId, propertyId);
      
      if (response.success) {
        setAvailableRooms(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
    } finally {
      setFetchingRooms(false);
    }
  };

  useEffect(() => {
    if (open && agenticPropertyId && propertyId) {
      fetchAvailableRooms();
      setSelectedRooms(new Set()); // Reset selections when dialog opens
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agenticPropertyId, propertyId]);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRooms.size === 0) return;

    setLoading(true);
    try {
      const roomsToAdd: ICAgenticRoom[] = Array.from(selectedRooms).map(roomId => {
        const room = availableRooms.find(r => r.id === roomId);
        return {
          agenticPropertyId,
          roomId,
          roomType: room?.roomType || '',
          roomName: room?.roomName || '',
          isActive: true,
        };
      });

      const response = await addRoomsForAgenticProperty(agenticPropertyId, roomsToAdd);
      if (response.success) {
        onSuccess();
        onOpenChange(false);
        setSelectedRooms(new Set());
      }
    } catch (error) {
      console.error('Failed to add rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Rooms to Agency Property</DialogTitle>
          <DialogDescription>
            Select rooms to allocate to this agency for this property.
          </DialogDescription>
        </DialogHeader>

        {fetchingRooms ? (
          <div className="py-8">
            <Loader text="Loading available rooms..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {availableRooms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No rooms available for this property
                </p>
              ) : (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Rooms:</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={selectedRooms.has(room.id)}
                          onCheckedChange={() => handleRoomToggle(room.id)}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`room-${room.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {room.roomName}
                          </Label>
                          <p className="text-sm text-gray-500">{room.roomType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRooms.size > 0 && (
                    <p className="text-sm text-gray-600">
                      {selectedRooms.size} room(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false);
                  setSelectedRooms(new Set());
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || selectedRooms.size === 0 || availableRooms.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add {selectedRooms.size > 0 ? `${selectedRooms.size} ` : ''}Room(s)
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomsDialog;
