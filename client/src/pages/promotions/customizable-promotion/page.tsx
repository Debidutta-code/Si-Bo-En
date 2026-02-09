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
import {CustomizableDealForm} from './components';
import {
    getCustomizableDealsByPropertyService,
    createCustomizableDealService,
    updateCustomizableDealService,
    deleteCustomizableDealService
} from './services';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import { fetchRoomTypesService } from '@/pages/inventory/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { RoomTypes } from '@/pages/inventory/types';
import type {
    CreateCustomizableDeal,
    CustomizableDeal,
} from './interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit, MoreVertical, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fetchAddOnsService } from '@/pages/add-on/services';
import type { IAddon } from '@/pages/add-on/interface';

export const CustomizableDealList: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [deals, setDeals] = useState<CustomizableDeal[]>([]);
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
    const [addons, setAddons] = useState<IAddon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<CustomizableDeal | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [dealToDelete, setDealToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [propertyId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (!propertyId) {
                toast.error('Property ID not found');
                return;
            }

            const [dealsResponse, plansResponse, roomsResponse, addonsResponse] = await Promise.all([
                getCustomizableDealsByPropertyService(propertyId),
                fetchRatePlansService(propertyId),
                fetchRoomTypesService(propertyId),
                fetchAddOnsService(propertyId)
            ]);

            if (dealsResponse.success) {
                setDeals(dealsResponse.data || []);
            }
            if (plansResponse.success) {
                setRatePlans(plansResponse.data || []);
            }
            if (roomsResponse.success) {
                setRoomTypes(roomsResponse.data || []);
            }
            if (addonsResponse.success) {
                setAddons(addonsResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load customizable deals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (payload: CreateCustomizableDeal) => {
        if (!propertyId) return;
        
        setIsLoading(true);
        try {
            const result = await createCustomizableDealService(payload, propertyId);
            if (result.success) {
                setShowForm(false);
                loadData();
                toast.success('Customizable deal created successfully!');
            } else {
                toast.error(result.message || 'Failed to create customizable deal');
            }
        } catch (error) {
            toast.error('An error occurred while creating the customizable deal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (payload: CreateCustomizableDeal) => {
        if (!editData || !propertyId) return;

        setIsLoading(true);
        try {
            const result = await updateCustomizableDealService(editData.id, payload, propertyId);

            if (result.success) {
                setShowForm(false);
                setEditData(null);
                loadData();
                toast.success('Customizable deal updated successfully!');
            } else {
                toast.error(result.message || 'Failed to update customizable deal');
            }
        } catch (error) {
            toast.error('An error occurred while updating the customizable deal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (dealId: string) => {
        setDealToDelete(dealId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!dealToDelete || !propertyId) return;

        setIsLoading(true);
        try {
            const result = await deleteCustomizableDealService(dealToDelete, propertyId);
            if (result.success) {
                loadData();
                toast.success('Customizable deal deleted successfully!');
            } else {
                toast.error(result.message || 'Failed to delete customizable deal');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the customizable deal');
        } finally {
            setIsLoading(false);
            setDeleteDialogOpen(false);
            setDealToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDealToDelete(null);
    };

    const handleEdit = (deal: CustomizableDeal) => {
        setEditData(deal);
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

    const getDiscountDisplay = (deal: CustomizableDeal) => {
        if (deal.discountType === 'percentage') {
            return (
                <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>{deal.discountValue}%</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{deal.currencyCode} {deal.discountValue}</span>
                </div>
            );
        }
    };

    if (showForm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                        {editData ? 'Edit' : 'Create'} Customizable Deal
                    </h2>
                </div>
                <CustomizableDealForm
                    ratePlans={ratePlans}
                    roomTypes={roomTypes}
                    addons={addons}
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
                    <h2 className="text-2xl font-bold text-foreground">Customizable Deals</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create flexible deals by combining room types, rate plans, and add-ons
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    + Create Deal
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
                                <TableHead>Discount</TableHead>
                                <TableHead>Room Types</TableHead>
                                <TableHead>Rate Plans</TableHead>
                                <TableHead>Add-ons</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No customizable deals found. Create one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deals.map((deal) => (
                                    <TableRow key={deal.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-success/10 text-success rounded text-sm font-medium">
                                                    {getDiscountDisplay(deal)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {deal.discountType}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">
                                                    {deal.CustomizableDealsApplicableRoomTypes.length} room type(s)
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {deal.CustomizableDealsApplicableRoomTypes.slice(0, 2).map((rt) => (
                                                        <span key={rt.id} className="text-xs px-2 py-0.5 bg-muted rounded">
                                                            {rt.Room.roomType}
                                                        </span>
                                                    ))}
                                                    {deal.CustomizableDealsApplicableRoomTypes.length > 2 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{deal.CustomizableDealsApplicableRoomTypes.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">
                                                    {deal.CustomizableDealsApplicableRatePlanTypes.length} rate plan(s)
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {deal.CustomizableDealsApplicableRatePlanTypes.slice(0, 2).map((rp) => (
                                                        <span key={rp.id} className="text-xs px-2 py-0.5 bg-muted rounded">
                                                            {rp.RatePlan.ratePlanCode}
                                                        </span>
                                                    ))}
                                                    {deal.CustomizableDealsApplicableRatePlanTypes.length > 2 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{deal.CustomizableDealsApplicableRatePlanTypes.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {deal.CustomizableDealsApplicableAddons.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">None</span>
                                                ) : (
                                                    <>
                                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {deal.CustomizableDealsApplicableAddons.length} add-on(s)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(deal.createdAt)}
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
                                                        onClick={() => handleEdit(deal)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4 mr-3" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(deal.id)}
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
                                <h3 className="text-lg font-semibold text-foreground">Delete Customizable Deal</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Are you sure you want to delete this deal? This action cannot be undone.
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

export default CustomizableDealList;