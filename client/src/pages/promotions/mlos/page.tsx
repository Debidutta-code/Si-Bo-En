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
import MLOSRuleForm from './components/MLOSRuleForm';

import { createRatePlanRuleService, fetchRatePlansService, updateRatePlanRuleService } from '@/pages/rate-plan/services';
import type { RatePlan } from '@/pages/rate-plan/interfaces';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RatePlanRule } from '@/pages/rate-plan/interfaces/ratePlan.type';
import { getRatePlanRulesByPropertyIdService } from './services';
import { deleteRatePlanRule } from '@/pages/rate-plan/api/api';

interface RatePlanRuleWithRatePlan extends RatePlanRule {
  ratePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
  };
}

export const MLOSRuleList: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [mlosRules, setMlosRules] = useState<RatePlanRuleWithRatePlan[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<RatePlanRuleWithRatePlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!propertyId) {
        return;
      }

      const [rulesResponse, plansResponse] = await Promise.all([
        getRatePlanRulesByPropertyIdService(propertyId),
        fetchRatePlansService(propertyId)
      ]);

      if (rulesResponse.success) {
        setMlosRules(rulesResponse.data || []);
      }
      if (plansResponse.success) {
        setRatePlans(plansResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load MLOS rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (payload: Partial<RatePlanRule>) => {
    setIsLoading(true);
    try {
      const result = await createRatePlanRuleService(payload);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success('MLOS rule created successfully!');
      } else {
        toast.error(result.message || 'Failed to create MLOS rule');
      }
    } catch (error) {
      toast.error('An error occurred while creating the MLOS rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (payload: Partial<RatePlanRule>) => {
    if (!editData) return;
    
    setIsLoading(true);
    try {
      const result = await updateRatePlanRuleService(editData.ratePlanId, payload);
      
      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success('MLOS rule updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update MLOS rule');
      }
    } catch (error) {
      toast.error('An error occurred while updating the MLOS rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (ratePlanId: string) => {
    setRuleToDelete(ratePlanId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteRatePlanRule(ruleToDelete);
      if (result.success) {
        loadData();
        toast.success('MLOS rule deleted successfully!');
      } else {
        toast.error(result.message || 'Failed to delete MLOS rule');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the MLOS rule');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  const handleEdit = (rule: RatePlanRuleWithRatePlan) => {
    setEditData(rule);
    setShowForm(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDiscount = (type: string | null, value: number | null) => {
    if (!type || !value) return 'No discount';
    return type === 'percentage' ? `${value}%` : `₹${value}`;
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {editData ? 'Edit' : 'Create'} MLOS Rule
          </h2>
        </div>
        <MLOSRuleForm
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
        <h2 className="text-2xl font-bold text-foreground">MLOS Rules</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          disabled={ratePlans.filter(rp => !rp.ratePlanRules).length === 0}
        >
          + Create MLOS Rule
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
                <TableHead>Date Range</TableHead>
                <TableHead>Min LOS</TableHead>
                <TableHead>Max LOS</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mlosRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No MLOS rules found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                mlosRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {rule.ratePlan.ratePlanName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rule.ratePlan.ratePlanCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
{formatDate(rule.startDate ?? null)} - {formatDate(rule.endDate ?? null)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {rule.minLos} nights
                      </span>
                    </TableCell>
                    <TableCell>
                      {rule.maxLos ? (
                        <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded text-xs font-medium">
                          {rule.maxLos} nights
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No limit</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rule.discountType && rule.discountValue
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {formatDiscount(rule.discountType || null, rule.discountValue || null)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        rule.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rule.ratePlanId)}
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
                <h3 className="text-lg font-semibold text-foreground">Delete MLOS Rule</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete this MLOS rule? This action cannot be undone.
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

export default MLOSRuleList;