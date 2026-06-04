import { format } from "date-fns";
import { Edit, MapPin, Eye, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import Loader from "@/components/Loader/Loader";
import type { Charges, RatePlan, RoomTypes } from "../types";
import { useTranslation } from "react-i18next";

interface MappingsTableProps {
    mappings: Charges[];
    onEdit: (mapping: Charges) => void;
    onDelete: (mapping: Charges) => void;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    allRatePlans: RatePlan[];
    allRoomTypes: RoomTypes[];
}

export default function MappingsTable({ 
    mappings, 
    onEdit, 
    onDelete,
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    isLoading = false,
    allRatePlans,
    allRoomTypes
}: MappingsTableProps) {
    const [viewPriceDetails, setViewPriceDetails] = useState<Charges | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Charges | null>(null);
    const { t } = useTranslation();

    return (
        <>
        
            <Card className="shadow-lg">
                <CardHeader className="border-b bg-white">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {t("MapRatePlan.mappedRatePlans")}
                    </CardTitle>
                    <CardDescription>
                        {totalItems > 0
                            ?   t("MapRatePlan.totalMappings", { count: totalItems })
                            : t("MapRatePlan.noMappingsFound")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Show loader when fetching data */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader text={t("MapRatePlan.loadingMappings")} />
                        </div>
                    ) : mappings.length > 0 ? (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold">{t("MapRatePlan.date")}</TableHead>
                                            <TableHead className="font-semibold">{t("MapRatePlan.roomType")}</TableHead>
                                            <TableHead className="font-semibold">{t("MapRatePlan.ratePlan")}</TableHead>
                                            <TableHead className="font-semibold">{t("MapRatePlan.price")}</TableHead>
                                            <TableHead className="font-semibold">{t("MapRatePlan.availableRooms")}</TableHead>
                                            <TableHead className="font-semibold">{t("MapRatePlan.sellStopped")}</TableHead>

                                            <TableHead className="font-semibold text-right">{t("MapRatePlan.actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mappings.map((mapping) => (
                                            <TableRow key={mapping.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {mapping.date ? format(new Date(mapping.date), "MMM dd, yyyy") : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const room = allRoomTypes.find(r => r.roomType === mapping.roomTypeCode);
                                                        return room?._translations?.roomName || mapping.roomTypeName;
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const plan = allRatePlans.find(p => p.ratePlanCode === mapping.ratePlanCode);
                                                        return plan?._translations?.ratePlanName || mapping.ratePlanName;
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-green-600">
                                                            {Number(mapping.baseGuestAmounts[0]?.amountBeforeTax || 0).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {mapping.currencyCode || "USD"}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setViewPriceDetails(mapping)}
                                                            className="h-7 w-7 p-0 hover:bg-primary/10"
                                                        >
                                                            <Eye className="w-4 h-4 text-primary" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">{mapping.availableRooms}</TableCell>
                                                <TableCell align="center">{mapping.isSaleStopped ? "Yes" : "No"}</TableCell>

                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                disabled={isLoading}
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="center" className="w-40">
                                                            <DropdownMenuItem
                                                                onClick={() => onEdit(mapping)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {t("Common.update")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setViewPriceDetails(mapping)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                {t("Common.viewDetails")}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteConfirm(mapping)}
                                                                className="cursor-pointer text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                {t("Common.delete")}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Backend Pagination */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={onPageChange}
                                    itemsPerPage={20}
                                    totalItems={totalItems}
                                />
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("MapRatePlan.noMappingsYet")}</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {t("MapRatePlan.selectFiltersSearch")}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Price Details Dialog */}
            <Dialog open={!!viewPriceDetails} onOpenChange={() => setViewPriceDetails(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t("MapRatePlan.priceDetails.title")}</DialogTitle>
                        <DialogDescription>
                            {t("MapRatePlan.priceDetails.viewingPricing", { ratePlan: viewPriceDetails?.ratePlanCode })}
                        </DialogDescription>
                    </DialogHeader>
                    {viewPriceDetails && (
                        <div className="space-y-6 pr-2">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">{t("MapRatePlan.priceDetails.ratePlan")}</p>
                                    <p className="font-semibold">{viewPriceDetails.ratePlanName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t("MapRatePlan.priceDetails.roomType")}</p>
                                    <p className="font-semibold">{viewPriceDetails.roomTypeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t("MapRatePlan.priceDetails.date")}</p>
                                    <p className="font-semibold">
                                        {format(new Date(viewPriceDetails.date), "MMM dd, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t("MapRatePlan.priceDetails.baseAmountFirstGuest")}</p>
                                    <p className="font-semibold text-green-600">
                                        {Number(viewPriceDetails.baseGuestAmounts[0]?.amountBeforeTax || 0).toFixed(2)}  {viewPriceDetails.currencyCode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t("MapRatePlan.priceDetails.saleStopped")}</p>
                                    <p className="font-semibold text-green-600">
                                        {viewPriceDetails.isSaleStopped ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>

                            {/* Base Guest Amounts */}
                            {viewPriceDetails.baseGuestAmounts && viewPriceDetails.baseGuestAmounts.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        {t("MapRatePlan.priceDetails.baseGuestAmounts")}
                                    </h4>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-semibold">{t("MapRatePlan.priceDetails.numberOfGuests")}</TableHead>
                                                    <TableHead className="font-semibold text-right">{t("MapRatePlan.price")}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {viewPriceDetails.baseGuestAmounts.map((guest, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{guest.ageQualifyingCode==="10"?`${t("MapRatePlan.priceDetails.adult")} ${guest.numberOfGuests}` : `${t("MapRatePlan.priceDetails.child")} ${guest.numberOfGuests}`}</TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">
                                                            {Number(guest.amountBeforeTax).toFixed(2)} {viewPriceDetails.currencyCode}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* Additional Guest Amounts */}
                            {viewPriceDetails.additionalGuestAmounts && viewPriceDetails.additionalGuestAmounts.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                        {t("MapRatePlan.priceDetails.additionalGuestCharges")}
                                    </h4>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-semibold">{t("MapRatePlan.priceDetails.ageCode")}</TableHead>
                                                    <TableHead className="font-semibold text-right">{t("MapRatePlan.price")}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {viewPriceDetails.additionalGuestAmounts.map((guest, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            {guest.ageQualifyingCode === "10" ? t("MapRatePlan.priceDetails.additionalChargeAdults") : t("MapRatePlan.priceDetails.additionalChargeChildren")}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold text-purple-600">
                                                            {Number(guest.amount).toFixed(2)} {viewPriceDetails.currencyCode}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {!viewPriceDetails.baseGuestAmounts?.length && !viewPriceDetails.additionalGuestAmounts?.length && (
                                <div className="text-center py-8 text-gray-500">
                                    {t("MapRatePlan.priceDetails.noAdditionalPricing")}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("MapRatePlan.deleteConfirm.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("MapRatePlan.deleteConfirm.message", { 
                                ratePlan: deleteConfirm?.ratePlanCode, 
                                date: deleteConfirm?.date && format(new Date(deleteConfirm.date), "MMM dd, yyyy") 
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("MapRatePlan.deleteConfirm.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteConfirm) {
                                    onDelete(deleteConfirm);
                                    setDeleteConfirm(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t("MapRatePlan.deleteConfirm.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}