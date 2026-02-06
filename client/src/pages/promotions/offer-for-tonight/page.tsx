import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Loader from '@/components/Loader/Loader';
import { OfferForTonightForm } from './components';
import {
    getOfferForTonightByPropertyService,
    createOfferForTonightService,
    updateOfferForTonightService,
    deleteOfferForTonightService
} from './services';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import { fetchRoomTypesService } from '@/pages/inventory/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { RoomTypes } from '@/pages/inventory/types';
import {
    type CreateOfferForTonight,
    type OfferForTonightWithRatePlan,
} from './interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { convertBackendToApplicableDays } from '../mobile-only/interfaces/mobilePromotion.type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const OfferForTonightList: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [promotions, setPromotions] = useState<OfferForTonightWithRatePlan[]>([]);
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<OfferForTonightWithRatePlan | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [propertyId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (!propertyId) {
                return;
            }

            const [promotionsResponse, plansResponse, roomsResponse] = await Promise.all([
                getOfferForTonightByPropertyService(propertyId),
                fetchRatePlansService(propertyId),
                fetchRoomTypesService(propertyId)
            ]);

            if (promotionsResponse.success) {
                // Convert backend format to frontend format
                const formattedPromotions = (promotionsResponse.data || []).map((promo: any) => ({
                    ...promo,
                    applicableDays: convertBackendToApplicableDays(promo)
                }));
                setPromotions(formattedPromotions);
            }
            if (plansResponse.success) {
                setRatePlans(plansResponse.data || []);
            }
            if (roomsResponse.success) {
                setRoomTypes(roomsResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load Offer For Tonight promotions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (payload: CreateOfferForTonight) => {
        setIsLoading(true);
        try {
            const result = await createOfferForTonightService(payload);
            if (result.success) {
                setShowForm(false);
                loadData();
                toast.success('Offer For Tonight promotion created successfully!');
            } else {
                toast.error(result.message || 'Failed to create Offer For Tonight promotion');
            }
        } catch (error) {
            toast.error('An error occurred while creating the Offer For Tonight promotion');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (payload: CreateOfferForTonight) => {
        if (!editData) return;

        setIsLoading(true);
        try {
            const updatePayload = {
                promotionName: payload.promotionName,
                discountType: payload.discountType,
                discountValue: payload.discountValue,
                currencyCode: payload.currencyCode,
                validFrom: payload.validFrom,
                validTo: payload.validTo,
                monApplicable: payload.monApplicable,
                tueApplicable: payload.tueApplicable,
                wedApplicable: payload.wedApplicable,
                thuApplicable: payload.thuApplicable,
                friApplicable: payload.friApplicable,
                satApplicable: payload.satApplicable,
                sunApplicable: payload.sunApplicable,
                isActive: true,
            };

            const result = await updateOfferForTonightService(editData.id, updatePayload);

            if (result.success) {
                setShowForm(false);
                setEditData(null);
                loadData();
                toast.success('Offer For Tonight promotion updated successfully!');
            } else {
                toast.error(result.message || 'Failed to update Offer For Tonight promotion');
            }
        } catch (error) {
            toast.error('An error occurred while updating the Offer For Tonight promotion');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (promotionId: string) => {
        setPromotionToDelete(promotionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!promotionToDelete) return;

        setIsLoading(true);
        try {
            const result = await deleteOfferForTonightService(promotionToDelete);
            if (result.success) {
                loadData();
                toast.success('Offer For Tonight promotion deleted successfully!');
            } else {
                toast.error(result.message || 'Failed to delete Offer For Tonight promotion');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the Offer For Tonight promotion');
        } finally {
            setIsLoading(false);
            setDeleteDialogOpen(false);
            setPromotionToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPromotionToDelete(null);
    };

    const handleEdit = (promotion: OfferForTonightWithRatePlan) => {
        setEditData(promotion);
        setShowForm(true);
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getActiveDays = (days: any) => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return Object.entries(days)
            .filter(([_, isActive]) => isActive)
            .map(([day]) => {
                const index = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.toLowerCase());
                return dayNames[index];
            })
            .join(', ');
    };

    const getDiscountDisplay = (promotion: OfferForTonightWithRatePlan) => {
        if (promotion.DiscountType === 'percentage') {
            return `${promotion.DiscountValue}% OFF`;
        } else {
            return `${promotion.currencyCode || 'USD'} ${promotion.DiscountValue} OFF`;
        }
    };

    const getBookingTimeRange = (validFrom: string | null, validTo: string | null) => {
        if (!validFrom) return 'N/A';
        const fromTime = formatTime(validFrom);
        const toTime = validTo ? formatTime(validTo) : '23:59';
        return `${fromTime} - ${toTime}`;
    };

    if (showForm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                        {editData ? 'Edit' : 'Create'} Offer For Tonight Promotion
                    </h2>
                </div>
                <OfferForTonightForm
                    ratePlans={ratePlans}
                    roomTypes={roomTypes}
                    propertyId={propertyId!}
                    onSubmit={editData ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setShowForm(false);
                        setEditData(null);
                    }}
                    editData={editData}
                    isLoading={isLoading}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Offer For Tonight Promotions</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Stand out among search results of the same-day bookings
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    + Create Offer For Tonight
                </button>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
                {isLoading ? (
                    <div className="py-12">
                        <Loader text="Loading..." />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rate Plan(s)</TableHead>
                                <TableHead>Promotion Name</TableHead>
                                <TableHead>Booking Time</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Active Days</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                        No Offer For Tonight promotions found. Create one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promotion) => (
                                    <TableRow key={promotion.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {promotion.ratePlan?.ratePlanName || 'Multiple Plans'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {promotion.ratePlan?.ratePlanCode || promotion.ratePlanCode}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{promotion.promotionName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span>{getBookingTimeRange(promotion.validFrom, promotion.validTo)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                                                {getDiscountDisplay(promotion)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(promotion.validFrom)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {formatDate(promotion.validTo)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-muted-foreground">
                                                {getActiveDays(promotion.applicableDays)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-3 py-1 rounded text-xs font-medium ${promotion.isActive
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {promotion.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-accent rounded-md transition-colors">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(promotion)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-3" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(promotion.id)}
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Delete Offer For Tonight Promotion</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Are you sure you want to delete this promotion? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferForTonightList;