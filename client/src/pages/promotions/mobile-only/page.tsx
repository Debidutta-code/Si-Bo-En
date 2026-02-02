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
import MobilePromotionForm from './components/MobilePromotionForm';
import {
  getMobilePromotionsByPropertyIdService,
  createMobilePromotionService,
  updateMobilePromotionService,
  deleteMobilePromotionService
} from './services/mobilePromotion.service';
import { fetchRatePlansService } from '@/pages/rate-plan/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import type { CreateMobilePromotion, MobilePromotionWithRatePlan } from './interfaces/mobilePromotion.type';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MobilePromotionList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [promotions, setPromotions] = useState<MobilePromotionWithRatePlan[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<MobilePromotionWithRatePlan | null>(null);
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
        getMobilePromotionsByPropertyIdService(propertyId),
        fetchRatePlansService(propertyId)
      ]);

      if (promotionsResponse.success) {
        setPromotions(promotionsResponse.data || []);
      }
      if (plansResponse.success) {
        setRatePlans(plansResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load mobile promotions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (payload: CreateMobilePromotion) => {
    setIsLoading(true);
    try {
      const result = await createMobilePromotionService(payload);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success('Mobile promotion created successfully!');
      } else {
        toast.error(result.message || 'Failed to create mobile promotion');
      }
    } catch (error) {
      toast.error('An error occurred while creating the mobile promotion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (payload: CreateMobilePromotion) => {
    if (!editData) return;
    
    setIsLoading(true);
    try {
      const result = await updateMobilePromotionService(editData.ratePlanId, payload);
      
      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success('Mobile promotion updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update mobile promotion');
      }
    } catch (error) {
      toast.error('An error occurred while updating the mobile promotion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (ratePlanId: string) => {
    setPromotionToDelete(ratePlanId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteMobilePromotionService(promotionToDelete);
      if (result.success) {
        loadData();
        toast.success('Mobile promotion deleted successfully!');
      } else {
        toast.error(result.message || 'Failed to delete mobile promotion');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the mobile promotion');
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

  const handleEdit = (promotion: MobilePromotionWithRatePlan) => {
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

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {editData ? 'Edit' : 'Create'} Mobile Rate Promotion
          </h2>
        </div>
        <MobilePromotionForm
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Mobile Rate Promotions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Create Mobile Promotion
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
                <TableHead>Discount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Active Days</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No mobile promotions found. Create one to get started!
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
                      <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">
                        {promotion.discountPercentage}% OFF
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(promotion.startDate)}</TableCell>
                    <TableCell>{formatDate(promotion.endDate)}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {getActiveDays(promotion.applicableDays)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {promotion.isB2C && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                            B2C
                          </span>
                        )}
                        {promotion.isB2B && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                            B2B
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        promotion.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(promotion.ratePlanId)}
                          className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
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
                <h3 className="text-lg font-semibold text-foreground">Delete Mobile Promotion</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete this mobile promotion? This action cannot be undone.
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

export default MobilePromotionList;