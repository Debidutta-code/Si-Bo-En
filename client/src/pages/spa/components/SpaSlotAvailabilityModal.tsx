import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, Loader2, Eye, User, Hash } from 'lucide-react';
import type { ISpaSlotWAvailability, ISlotsAvailable, SlotStatus } from '../interfaces';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    slot: ISpaSlotWAvailability | null;
    onUpdateStatus: (availabilityId: string, status: SlotStatus) => Promise<void>;
    onDeleteAvailability: (availabilityId: string) => Promise<void>;
}

// box fill + border per status
const statusBox: Record<SlotStatus, string> = {
    active: 'bg-green-50 border-green-300',
    inactive: 'bg-gray-50 border-gray-300',
    booked: 'bg-red-50 border-red-300',
    completed: 'bg-blue-50 border-blue-300',
    cancelled: 'bg-orange-50 border-orange-300',
};

const statusText: Record<SlotStatus, string> = {
    active: 'text-green-700',
    inactive: 'text-gray-600',
    booked: 'text-red-700',
    completed: 'text-blue-700',
    cancelled: 'text-orange-700',
};

// 'active' -> 'Active', 'cancelled' -> 'Cancelled'
const toCamelCase = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

// small icon button used inline inside each slot box
function IconAction({
    icon, label, onClick, disabled, tone = 'gray',
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    tone?: 'gray' | 'green' | 'red' | 'blue';
}) {
    const toneClasses: Record<string, string> = {
        gray: 'hover:bg-black/[0.06] text-gray-500',
        green: 'hover:bg-green-100 text-green-600',
        red: 'hover:bg-red-100 text-red-600',
        blue: 'hover:bg-blue-100 text-blue-600',
    };

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            title={label}
            className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${toneClasses[tone]}`}
        >
            {icon}
        </button>
    );
}

export default function SpaSlotAvailabilityModal({
    isOpen, onClose, slot, onUpdateStatus, onDeleteAvailability,
}: Props) {
    const { t } = useTranslation();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [viewReservation, setViewReservation] = useState<ISlotsAvailable | null>(null);

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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">
                            {t("SpaSlotAvailabilityModal.title")}{' '}
                            {format(new Date(String(slot.startTime).replace('Z', '')), 'h:mm a')}
                            {' → '}
                            {format(new Date(String(slot.endTime ?? new Date().toISOString()).replace('Z', '')), 'h:mm a')}
                        </DialogTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {activeCount} {t("SpaSlotAvailabilityModal.availabilityStatus")} {total}
                        </p>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 py-2 max-h-96 overflow-y-auto">
                        {slot.slotsAvailable.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">{t("SpaSlotAvailabilityModal.noRecords")}</p>
                        ) : (
                            slot.slotsAvailable.map((avail) => {
                                const isLocked = avail.status === 'booked' || avail.status === 'completed' || avail.status === 'cancelled';
                                const isLoading = loadingId === avail.id;
                                const isBooked = avail.status === 'booked';

                                return (
                                    <div
                                        key={avail.id}
                                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${statusBox[avail.status]}`}
                                    >
                                        <span className={`text-xs font-medium ${statusText[avail.status]}`}>
                                            {toCamelCase(avail.status)}
                                        </span>

                                        {/* icons live inline, right-aligned, no menu */}
                                        <div className="flex items-center gap-1">
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                            ) : (
                                                <>
                                                    {isBooked && (
                                                        <IconAction
                                                            icon={<Eye className="w-3.5 h-3.5" />}
                                                            label={t("SpaSlotAvailabilityModal.viewReservation")}
                                                            tone="blue"
                                                            onClick={() => setViewReservation(avail)}
                                                        />
                                                    )}
                                                    {!isLocked && (
                                                        <IconAction
                                                            icon={avail.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                            label={avail.status === 'active' ? t("Common.deactivate") : t("Common.activate")}
                                                            tone={avail.status === 'active' ? 'gray' : 'green'}
                                                            onClick={() => handleStatusToggle(avail)}
                                                        />
                                                    )}
                                                    <IconAction
                                                        icon={<Trash2 className="w-3.5 h-3.5" />}
                                                        label={t("Common.delete")}
                                                        tone="red"
                                                        disabled={avail.status === 'booked'}
                                                        onClick={() => setDeleteTarget(avail.id)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* View reservation dialog */}
            <Dialog open={!!viewReservation} onOpenChange={(open) => !open && setViewReservation(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold">{t("SpaSlotAvailabilityModal.resDetails")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-gray-50">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t("Common.name")}</p>
                                {/* NOTE: adjust this field to match your actual reservation/user name field on ISlotsAvailable */}
                                <p className="text-sm text-gray-800">{viewReservation?.userName ?? 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-gray-50">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t("SpaSlotAvailabilityModal.resId")}</p>
                                <p className="text-sm text-gray-800 break-all">{viewReservation?.reservationId ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("SpaSlotAvailabilityModal.deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("SpaSlotAvailabilityModal.deleteDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteConfirm}>
                            {t("Common.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
