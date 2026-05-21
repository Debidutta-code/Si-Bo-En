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
import { Smartphone, Tablet, Monitor, MoreVertical, Edit, Trash2, Check, X, Plus, Languages } from 'lucide-react';
import { convertBackendToApplicableDays } from './interfaces/mobilePromotion.type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import BackButton from '@/components/shared/BackButton';
import type { ILoader } from '@/pages/dashboard/interface';
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from '@/pages/management/components/multilang/ManagementTranslationDialogs';
import {
  upsertPromotionTranslationService,
  getAllPromotionTranslationsService,
  deletePromotionTranslationLocaleService,
} from '../multilanguage/service/promotion.service';

export const DeviceSpecificPromotionList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [promotions, setPromotions] = useState<DeviceSpecificPromotionWithRatePlan[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState<ILoader>({
    isLoading: false,
    message: ''
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<DeviceSpecificPromotionWithRatePlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setIsLoading({
      isLoading: true,
      message: 'Loading device-specific promotions...'
    });
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
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleCreate = async (payload: CreateDeviceSpecificPromotion) => {
    setIsLoading({
      isLoading: true,
      message: 'Creating device-specific promotion...'
    });
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
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleUpdate = async (payload: CreateDeviceSpecificPromotion) => {
    if (!editData) return;

    setIsLoading({
      isLoading: true,
      message: 'Updating device-specific promotion...'
    });
    try {
      const updatePayload = {
        promotionName: payload.promotionName,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        currencyCode: payload.currencyCode,
        deviceType: payload.deviceType,
        validFrom: payload.validFrom,
        validTo: payload.validTo,
        monApplicable: payload.monApplicable,
        tueApplicable: payload.tueApplicable,
        wedApplicable: payload.wedApplicable,
        thuApplicable: payload.thuApplicable,
        friApplicable: payload.friApplicable,
        satApplicable: payload.satApplicable,
        sunApplicable: payload.sunApplicable,
        isActive: payload.isActive,
        isAutoApplied: payload.isAutoApplied
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
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleDeleteClick = (promotionId: string) => {
    setPromotionToDelete(promotionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    setIsLoading({
      isLoading: true,
      message: 'Deleting device-specific promotion...'
    });
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
      setIsLoading({
        isLoading: false,
        message: ''
      });
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
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% OFF`;
    } else {
      return `${promotion.currencyCode || 'USD'} ${promotion.discountValue} OFF`;
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
      <BackButton/>
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
        {isLoading.isLoading? (
          <div className="py-12">
            <Loader text={isLoading.message} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Rate Plan</TableHead>
                <TableHead className='text-center'>Promotion Name</TableHead>
                <TableHead className='text-center'>Devices</TableHead>
                <TableHead className='text-center'>Discount</TableHead>
                <TableHead className='text-center'>Start Date</TableHead>
                <TableHead className='text-center'>End Date</TableHead>
                <TableHead className='text-center'>Active Days</TableHead>
                <TableHead className='text-center'>Auto Applied</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='text-center'>
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
                          {promotion.ratePlan._translations?promotion.ratePlan._translations.ratePlanName:promotion.ratePlan.ratePlanName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promotion.ratePlan.ratePlanCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{promotion._translations?promotion._translations.promotionName:promotion.promotionName}</TableCell>
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
                    <TableCell className='flex items-center justify-center'>
                      <span className={`px-3 py-1  rounded text-xs ${promotion.isAutoApplied
                        ? ' text-success '
                        : ' text-destructive'
                        }`}>
                        {promotion.isAutoApplied ? <Check className='h-4 w-4' /> : <X className='h-4 w-4' />}
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
                            onClick={() => { setTranslationEntityId(promotion.id); setAddTranslationOpen(true); }}
                            className="cursor-pointer"
                          >
                            <Plus className="w-4 h-4 mr-3 text-blue-500" />
                            Add Translation
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setTranslationEntityId(promotion.id); setCheckTranslationsOpen(true); }}
                            className="cursor-pointer"
                          >
                            <Languages className="w-4 h-4 mr-3 text-green-600" />
                            Check Translations
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
                  disabled={isLoading.isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                  disabled={isLoading.isLoading}
                >
                  {isLoading.isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title="Add Promotion Translation"
            fields={[{ key: "promotionName", label: "Promotion Name", placeholder: "e.g. Oferta Móvil" }]}
            onSave={async (id, locale, data) => {
              return await upsertPromotionTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Promotion Translations"
            displayFields={[{ key: "promotionName", label: "Name" }]}
            onFetch={getAllPromotionTranslationsService}
            onDelete={deletePromotionTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title="Edit Promotion Translation"
            fields={[{ key: "promotionName", label: "Promotion Name", placeholder: "e.g. Oferta Móvil" }]}
            onSave={async (id, locale, data) => upsertPromotionTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </div>
  );
};

export default DeviceSpecificPromotionList;