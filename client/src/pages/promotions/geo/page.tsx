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
import { GeoRatePlanForm, GeoRatePlanFilter } from './components';
import { getCountryFlag, getCountryName } from '@/pages/bookings/utils/country.utils';
import {
  fetchGeoRatePlansService,
  removeGeoRatePlanService,
  createGeoRatePlanService,
  updateGeoRatePlanService
} from './services';
import { fetchRoomTypesService } from '@/pages/inventory/services';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import type { RoomTypes } from '@/pages/inventory/types';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { CreateGeoRatePlan, GeoRatePlan } from './interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, Edit, MoreVertical, Trash2, X } from 'lucide-react';
import type { ILoader } from '@/pages/dashboard/interface';
import BackButton from '@/components/shared/BackButton';


export const GeoRatePlanList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [geoRatePlans, setGeoRatePlans] = useState<GeoRatePlan[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState<ILoader>({
    isLoading: true,
    message: 'Loading MLOS RatePlans ...'
  });
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<GeoRatePlan | null>(null);


  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [selectedRatePlan, setSelectedRatePlan] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  useEffect(() => {
    loadData();
  }, [propertyId, selectedRoomType, selectedRatePlan]);

  const loadData = async () => {
    setIsLoading({
      isLoading: true,
      message: 'Loading MLOS RatePlans ...'
    });
    try {
      if (!propertyId) {
        return;
      }
      const [geoPlansResponse, roomsResponse, plansResponse] = await Promise.all([
        fetchGeoRatePlansService(propertyId, {
          roomType: selectedRoomType || undefined,
          ratePlanCode: selectedRatePlan || undefined
        }),
        fetchRoomTypesService(propertyId),
        fetchRatePlansService(propertyId)
      ]);

      if (geoPlansResponse.success) {
        setGeoRatePlans(geoPlansResponse.data || []);
      }
      if (roomsResponse.success) {
        setRoomTypes(roomsResponse.data || []);
      }
      if (plansResponse.success) {
        setRatePlans(plansResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleCreate = async (payload: CreateGeoRatePlan) => {
    setIsLoading({
      isLoading: true,
      message: 'Creating Geo Rate Plan ...'
    });
    try {
      const result = await createGeoRatePlanService(payload);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success('Geo Rate Plan created successfully!');
      } else {
        toast.error(result.message || 'Failed to create Geo Rate Plan');
      }
    } catch (error) {
      toast.error('An error occurred while creating the Geo Rate Plan');
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleUpdate = async (payload: CreateGeoRatePlan) => {
    if (!editData) return;

    setIsLoading({
      isLoading: true,
      message: 'Updating Geo Rate Plan ...'
    });
    try {
      const result = await updateGeoRatePlanService(editData.id, {
        restrictionType: payload.restrictionType,
        restrictionTypeAction: payload.restrictionTypeAction,
        restrictionValue: payload.restrictionValue,
        currencyCode: payload.currencyCode,
        countryCode: payload.countryCode,
        isActive: payload.isActive,
        isAutoApplied: payload.isAutoApplied

      });

      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success('Geo Rate Plan updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update Geo Rate Plan');
      }
    } catch (error) {
      toast.error('An error occurred while updating the Geo Rate Plan');
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setPlanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    setIsLoading({
      isLoading: true,
      message: 'Deleting Geo Rate Plan ...'
    });
    try {
      const result = await removeGeoRatePlanService(planToDelete);
      if (result.success) {
        loadData();
        toast.success('Geo Rate Plan deleted successfully!');
      } else {
        toast.error(result.message || 'Failed to delete Geo Rate Plan');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the Geo Rate Plan');
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };


  const handleEdit = (plan: GeoRatePlan) => {
    setEditData(plan);
    setShowForm(true);
  };

  const handleClearFilters = () => {
    setSelectedRoomType('all');
    setSelectedRatePlan('all');
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {editData ? 'Edit' : 'Create'} Geo Rate Plan
          </h2>
        </div>
        <GeoRatePlanForm
          propertyId={propertyId!}
          roomTypes={roomTypes}
          ratePlans={ratePlans}
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
        <h2 className="text-2xl font-bold text-foreground">Geo Rate Plans</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Create Geo Rate Plan
        </button>
      </div>

      <GeoRatePlanFilter
        roomTypes={roomTypes}
        ratePlans={ratePlans}
        selectedRoomType={selectedRoomType}
        selectedRatePlan={selectedRatePlan}
        onRoomTypeChange={setSelectedRoomType}
        onRatePlanChange={setSelectedRatePlan}
        onClearFilters={handleClearFilters}
      />

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading.isLoading ? (
          <div className="py-12">
            <Loader text="Loading..." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Type</TableHead>
                <TableHead>Rate Plan</TableHead>
                <TableHead>Restriction Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Auto Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {geoRatePlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No geo rate plans found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                geoRatePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.roomType || 'All Rooms'}</TableCell>
                    <TableCell>{plan.ratePlan?.ratePlanName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${plan.restrictionType === 'restricted'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                        }`}>
                        {plan.restrictionType === 'percentage' ? 'Percentage' :
                          plan.restrictionType === 'fixed' ? 'Fixed Amount' : 'Restricted'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {plan.restrictionTypeAction ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${plan.restrictionTypeAction === 'increase'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-success/10 text-success'
                          }`}>
                          {plan.restrictionTypeAction === 'increase' ? '↑ Increase' : '↓ Decrease'}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {plan.restrictionValue !== null ? (
                        plan.restrictionType === 'percentage' ? `${plan.restrictionValue}%` :
                          plan.restrictionType === 'fixed' ? `${plan.currencyCode} ${plan.restrictionValue}` :
                            plan.restrictionValue
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {plan.countryCode.slice(0, 3).map(code => (
                          <span key={code} title={getCountryName(code)} className="text-lg">
                            {getCountryFlag(code)}
                          </span>
                        ))}
                        {plan.countryCode.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{plan.countryCode.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                     <TableCell >
                      <div className={`px-3 py-1  flex items-center justify-center  rounded text-xs ${plan.isAutoApplied
                        ? ' text-success '
                        : ' text-destructive'
                        }`}>
                        {plan.isAutoApplied ? <Check className='h-4 w-4' /> : <X className='h-4 w-4' />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${plan.isActive
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
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
                            onClick={() => handleEdit(plan)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(plan.id)}
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
                <h3 className="text-lg font-semibold text-foreground">Delete Geo Rate Plan</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete this geo rate plan? This action cannot be undone.
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
    </div>
  );
};

export default GeoRatePlanList;