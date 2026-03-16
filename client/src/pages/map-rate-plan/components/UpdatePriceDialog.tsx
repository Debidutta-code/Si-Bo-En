import { useState, useEffect } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Charges, IBaseGuestAmounts, IAdditionalGuestAmount, IUpdatedCharges } from "../types";

interface UpdatePriceDialogProps {
    mapping: Charges | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedMapping: IUpdatedCharges) => void;
}

export default function UpdatePriceDialog({
    mapping,
    open,
    onOpenChange,
    onSave,
}: UpdatePriceDialogProps) {
    const [baseGuestAmounts, setBaseGuestAmounts] = useState<IBaseGuestAmounts[]>([]);
    const [additionalGuestAmounts, setAdditionalGuestAmounts] = useState<IAdditionalGuestAmount[]>([]);

    useEffect(() => {
        if (mapping) {
            setBaseGuestAmounts(mapping.baseGuestAmounts || []);
            setAdditionalGuestAmounts(mapping.additionalGuestAmounts || []);
        }
    }, [mapping]);

    const handleAddBaseGuest = () => {
        setBaseGuestAmounts([...baseGuestAmounts, { numberOfGuests: 1, amountBeforeTax: "0",ageQualifyingCode:"10" }]);
    };

    const handleRemoveBaseGuest = (index: number) => {
        setBaseGuestAmounts(baseGuestAmounts.filter((_, i) => i !== index));
    };

    const handleUpdateBaseGuest = (index: number, field: keyof IBaseGuestAmounts, value: number) => {
        const updated = [...baseGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setBaseGuestAmounts(updated);
    };

    const handleAddAdditionalGuest = () => {
        setAdditionalGuestAmounts([...additionalGuestAmounts, { ageQualifyingCode: "10", amount: 0 }]);
    };

    const handleRemoveAdditionalGuest = (index: number) => {
        setAdditionalGuestAmounts(additionalGuestAmounts.filter((_, i) => i !== index));
    };

    const handleUpdateAdditionalGuest = (
        index: number,
        field: keyof IAdditionalGuestAmount,
        value: string | number
    ) => {
        const updated = [...additionalGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setAdditionalGuestAmounts(updated);
    };

    const handleSave = () => {
        if (!mapping) return;

        const updated: IUpdatedCharges = {
            id: mapping.id,
            baseGuestAmounts: baseGuestAmounts,
            additionalGuestAmounts: additionalGuestAmounts,
        };

        onSave(updated);
        onOpenChange(false);
    };

    if (!mapping) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Edit className="w-6 h-6" />
                        Update Price
                    </DialogTitle>
                    <DialogDescription>
                        Update pricing details for {mapping.ratePlanName} - {mapping.roomTypeName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                   

                    {/* Base Guest Amounts */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    Base Guest Amounts
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddBaseGuest}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {baseGuestAmounts.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">Number of Guests</TableHead>
                                                <TableHead className="font-semibold">Amount ($)</TableHead>
                                                <TableHead className="font-semibold w-20">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {baseGuestAmounts.map((guest, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={guest.numberOfGuests}
                                                            onChange={(e) =>
                                                                handleUpdateBaseGuest(
                                                                    index,
                                                                    "numberOfGuests",
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={guest.amountBeforeTax}
                                                            onChange={(e) =>
                                                                handleUpdateBaseGuest(
                                                                    index,
                                                                    "amountBeforeTax",
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveBaseGuest(index)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No base guest amounts added yet. Click "Add" to add one.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Guest Amounts */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Additional Guest Amounts
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddAdditionalGuest}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {additionalGuestAmounts.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">Age Code</TableHead>
                                                <TableHead className="font-semibold">Amount ($)</TableHead>
                                                <TableHead className="font-semibold w-20">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {additionalGuestAmounts.map((guest, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Select
                                                            value={guest.ageQualifyingCode}
                                                            onValueChange={(value) =>
                                                                handleUpdateAdditionalGuest(index, "ageQualifyingCode", value)
                                                            }
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="10">Age 10+</SelectItem>
                                                                <SelectItem value="8">Age 8+</SelectItem>
                                                                <SelectItem value="5">Age 5+</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={guest.amount}
                                                            onChange={(e) =>
                                                                handleUpdateAdditionalGuest(
                                                                    index,
                                                                    "amount",
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveAdditionalGuest(index)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No additional guest amounts added yet. Click "Add" to add one.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
