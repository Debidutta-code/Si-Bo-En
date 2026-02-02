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
import { DeviceSpecificPromotionForm } from './components';
import {
  getDeviceSpecificPromotionsByPropertyService,
  createDeviceSpecificPromotionService,
  updateDeviceSpecificPromotionService,
  deleteDeviceSpecificPromotionService
} from './services';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import {
  type CreateDeviceSpecificPromotion,
  type DeviceSpecificPromotionWithRatePlan,
} from './interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Smartphone, Tablet, Monitor, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { convertBackendToApplicableDays } from './interfaces/mobilePromotion.type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const DeviceSpecificPromotionList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [promotions, setPromotions] = useState<DeviceSpecificPromotionWithRatePlan[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<DeviceSpecificPromotionWithRatePlan | null>(null);
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

      const [promotionsResponse, plansResponse] = await Promise.all([
        getDeviceSpecificPromotionsByPropertyService(propertyId),
        fetchRatePlansService(propertyId)
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
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load device-specific promotions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (payload: CreateDeviceSpecificPromotion) => {
    setIsLoading(true);
    try {
      const result = await createDeviceSpecificPromotionService(payload);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success('Device-specific promotion created successfully!');
      } else {
        toast.error(result.message || 'Failed to create device-specific promotion');
      }
    } catch (error) {
      toast.error('An error occurred while creating the device-specific promotion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (payload: CreateDeviceSpecificPromotion) => {
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
        isActive: payload.isActive
      };

      const result = await updateDeviceSpecificPromotionService(editData.id, updatePayload);

      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success('Device-specific promotion updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update device-specific promotion');
      }
    } catch (error) {
      toast.error('An error occurred while updating the device-specific promotion');
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
      const result = await deleteDeviceSpecificPromotionService(promotionToDelete);
      if (result.success) {
        loadData();
        toast.success('Device-specific promotion deleted successfully!');
      } else {
        toast.error(result.message || 'Failed to delete device-specific promotion');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the device-specific promotion');
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

  const handleEdit = (promotion: DeviceSpecificPromotionWithRatePlan) => {
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

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDiscountDisplay = (promotion: DeviceSpecificPromotionWithRatePlan) => {
    if (promotion.DiscountType === 'percentage') {
      return `${promotion.DiscountValue}% OFF`;
    } else {
      return `${promotion.currencyCode || 'USD'} ${promotion.DiscountValue} OFF`;
    }
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {editData ? 'Edit' : 'Create'} Device-Specific Promotion
          </h2>
        </div>
        <DeviceSpecificPromotionForm
          ratePlans={ratePlans}
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
          <h2 className="text-2xl font-bold text-foreground">Device-Specific Promotions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Target specific devices with customized promotional offers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Create Device Promotion
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
                <TableHead>Rate Plan</TableHead>
                <TableHead>Promotion Name</TableHead>
                <TableHead>Devices</TableHead>
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
                    No device-specific promotions found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {promotion.ratePlan.ratePlanName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promotion.ratePlan.ratePlanCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{promotion.promotionName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {promotion.deviceType.map((device) => (
                          <div
                            key={device}
                            className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                            title={device.charAt(0).toUpperCase() + device.slice(1)}
                          >
                            {getDeviceIcon(device)}
                            <span className="capitalize">{device}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                        {getDiscountDisplay(promotion)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(promotion.validFrom)}</TableCell>
                    <TableCell>{formatDate(promotion.validTo)}</TableCell>
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
                <h3 className="text-lg font-semibold text-foreground">Delete Device-Specific Promotion</h3>
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

export default DeviceSpecificPromotionList;