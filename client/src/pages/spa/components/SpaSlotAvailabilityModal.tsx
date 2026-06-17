import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { ISpaSlotWAvailability, ISlotsAvailable, SlotStatus } from '../interfaces';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    slot: ISpaSlotWAvailability | null;
    onUpdateStatus: (availabilityId: string, status: SlotStatus) => Promise<void>;
    onDeleteAvailability: (availabilityId: string) => Promise<void>;
}

const statusColors: Record<SlotStatus, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    booked: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function SpaSlotAvailabilityModal({
    isOpen, onClose, slot, onUpdateStatus, onDeleteAvailability,
}: Props) {
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    if (!slot) return null;

    const handleStatusToggle = async (avail: ISlotsAvailable) => {
        if (avail.status === 'booked' || avail.status === 'completed' || avail.status === 'cancelled') return;
        setLoadingId(avail.id);
        const newStatus: SlotStatus = avail.status === 'active' ? 'inactive' : 'active';
        await onUpdateStatus(avail.id, newStatus);
        setLoadingId(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setLoadingId(deleteTarget);
        await onDeleteAvailability(deleteTarget);
        setLoadingId(null);
        setDeleteTarget(null);
    };

    const activeCount = slot.slotsAvailable.filter(s => s.status === 'active').length;
    const total = slot.slotsAvailable.length;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            Slot Availability —{' '}
                            {format(new Date(String(slot.startTime).replace('Z', '')), 'h:mm a')}
                            {' → '}
                            {format(new Date(String(slot.endTime ?? new Date().toISOString()).replace('Z', '')), 'h:mm a')}
                        </DialogTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {activeCount} of {total} available
                        </p>
                    </DialogHeader>

                    <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
                        {slot.slotsAvailable.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No availability records</p>
                        ) : (
                            slot.slotsAvailable.map((avail, idx) => {
                                const isLocked = avail.status === 'booked' || avail.status === 'completed' || avail.status === 'cancelled';
                                const isLoading = loadingId === avail.id;

                                return (
                                    <div
                                        key={avail.id}
                                        className="flex items-center justify-between p-2.5 rounded-lg border bg-white"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xs text-gray-400 w-4">#{idx + 1}</span>
                                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColors[avail.status]}`}>
                                                {avail.status}
                                            </span>
                                            {avail.reservationId && (
                                                <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                                                    Res: {avail.reservationId.slice(0, 8)}...
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Active/Inactive toggle — only for active or inactive */}
                                            {!isLocked && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isLoading}
                                                    onClick={() => handleStatusToggle(avail)}
                                                    className="h-7 px-2 text-xs"
                                                    title={avail.status === 'active' ? 'Mark inactive' : 'Mark active'}
                                                >
                                                    {avail.status === 'active' ? (
                                                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                                                    ) : (
                                                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    )}
                                                    <span className="ml-1">
                                                        {avail.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </span>
                                                </Button>
                                            )}

                                            {/* Delete — disabled if booked */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isLoading || avail.status === 'booked'}
                                                onClick={() => setDeleteTarget(avail.id)}
                                                className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title={avail.status === 'booked' ? 'Cannot delete a booked slot' : 'Delete'}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete availability slot?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this availability record. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}