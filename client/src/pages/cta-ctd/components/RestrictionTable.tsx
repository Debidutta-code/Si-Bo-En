// components/RestrictionTable.tsx

import { format } from "date-fns";
import { MoreVertical, Edit, Ban, LogIn, LogOut } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Restriction } from "../interfaces";

interface RestrictionTableProps {
    restrictions: Restriction[];
    onEdit: (restriction: Restriction) => void;
    isLoading: boolean;
}

export default function RestrictionTable({
    restrictions,
    onEdit,
    isLoading
}: RestrictionTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading restrictions...</p>
                </div>
            </div>
        );
    }

    if (restrictions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No CTA/CTD Restrictions
                    </h3>
                    <p className="text-gray-600">
                        There are no restrictions set for the selected dates.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Room Type</TableHead>
                        <TableHead>Rate Plan</TableHead>
                        <TableHead>Restriction Type</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {restrictions.map((restriction) => (
                        <TableRow key={restriction.id}>
                            <TableCell className="font-medium">
                                {format(new Date(restriction.date), "PPP")}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{restriction.roomTypeName}</div>
                                    <div className="text-sm text-gray-500">
                                        {restriction.roomTypeCode}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{restriction.ratePlanName}</div>
                                    <div className="text-sm text-gray-500">
                                        {restriction.ratePlanCode}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    {restriction.isClosedToArrival && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <LogIn className="w-3 h-3" />
                                            CTA
                                        </Badge>
                                    )}
                                    {restriction.isClosedToDeparture && (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <LogOut className="w-3 h-3" />
                                            CTD
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-gray-600">
                                    {restriction.restrictionNotes || "-"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(restriction)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Restriction
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}