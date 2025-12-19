import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import type { IAddonAvailability, IAddon } from "../interface";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface AddOnAvailabilityTableProps {
    availabilities: IAddonAvailability[];
    addOn: IAddon;
    onUpdate: (availabilityId: string, data: { price: number; currencyCode: string; isAvailable: boolean }) => Promise<void>;
    onDelete: (availabilityId: string) => Promise<void>;
    onCreateNew: () => void;
    isLoading?: boolean;
}

export default function AddOnAvailabilityTable({
    availabilities,
    addOn,
    onUpdate,
    onDelete,
    onCreateNew,
    isLoading = false,
}: AddOnAvailabilityTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{
        price: number;
        currencyCode: string;
        isAvailable: boolean;
    }>({ price: 0, currencyCode: "INR", isAvailable: true });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        availability: IAddonAvailability | null;
    }>({ open: false, availability: null });

    const handleEdit = (availability: IAddonAvailability) => {
        setEditingId(availability.id);
        setEditData({
            price: availability.price,
            currencyCode: availability.currencyCode,
            isAvailable: availability.isAvailable,
        });
    };

    const handleSaveEdit = async (availabilityId: string) => {
        await onUpdate(availabilityId, editData);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ price: 0, currencyCode: "INR", isAvailable: true });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.availability) {
            await onDelete(deleteDialog.availability.id);
            setDeleteDialog({ open: false, availability: null });
        }
    };

    // Sort availabilities by date
    const sortedAvailabilities = [...availabilities].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Availability & Pricing for {addOn.name}
                            </CardTitle>
                            <CardDescription>
                                Manage daily pricing and availability for this add-on
                            </CardDescription>
                        </div>
                        <Button onClick={onCreateNew} disabled={isLoading}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Dates
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {sortedAvailabilities.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Availability Set
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Set pricing and availability to start selling this add-on
                            </p>
                            <Button onClick={onCreateNew}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Availability
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAvailabilities.map((availability) => (
                                        <TableRow key={availability.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(availability.date), "PPP")}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === availability.id ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={editData.price}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                price: parseFloat(e.target.value) || 0,
                                                            })
                                                        }
                                                        className="w-32"
                                                    />
                                                ) : (
                                                    availability.price.toFixed(2)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === availability.id ? (
                                                    <Input
                                                        value={editData.currencyCode}
                                                        onChange={(e) =>
                                                            setEditData({
                                                                ...editData,
                                                                currencyCode: e.target.value,
                                                            })
                                                        }
                                                        className="w-24"
                                                    />
                                                ) : (
                                                    availability.currencyCode
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === availability.id ? (
                                                    <Switch
                                                        checked={editData.isAvailable}
                                                        onCheckedChange={(checked) =>
                                                            setEditData({
                                                                ...editData,
                                                                isAvailable: checked,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    <Badge
                                                        variant={
                                                            availability.isAvailable
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {availability.isAvailable
                                                            ? "Available"
                                                            : "Unavailable"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingId === availability.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(availability.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(availability)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setDeleteDialog({
                                                                    open: true,
                                                                    availability,
                                                                })
                                                            }
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, availability: null })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the availability for{" "}
                            {deleteDialog.availability &&
                                format(new Date(deleteDialog.availability.date), "PPP")}
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
