import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { ICRatePlanRule, RatePlanRule } from '@/pages/rate-plan/interfaces/ratePlan.type';
import { getRatePlanRulesByPropertyIdService } from './services';
import { deleteRatePlanRule } from '@/pages/rate-plan/api/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, Edit, MoreVertical, Trash2, X } from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import type { ILoader } from '@/pages/dashboard/interface';

interface RatePlanRuleWithRatePlan extends RatePlanRule {
  ratePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
  };
}

export const MLOSRuleList: React.FC = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [mlosRules, setMlosRules] = useState<RatePlanRuleWithRatePlan[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState<ILoader>({
    isLoading: false,
    message: ''
  })
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<RatePlanRuleWithRatePlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setIsLoading({
      isLoading: true,
      message: t("MLOS.loadingMlosRules")
    });
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
      toast.error(t("MLOS.failedToLoadMlosRules"));
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleCreate = async (payload: ICRatePlanRule) => {
    setIsLoading({
      isLoading: true,
      message: t("MLOS.creatingMlosRule")
    });
    try {
      const result = await createRatePlanRuleService(payload);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success(t("MLOS.mlosRuleCreatedSuccessfully"));
      } else {
        toast.error(result.message || t("MLOS.failedToCreateMlosRule"));
      }
    } catch (error) {
      toast.error(t("MLOS.errorCreatingMlosRule"));
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleUpdate = async (payload: ICRatePlanRule) => {
    if (!editData) return;

    setIsLoading({
      isLoading: true,
      message: t("MLOS.updatingMlosRule")
    });
    try {
      const result = await updateRatePlanRuleService(editData.ratePlanId, payload);

      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success(t("MLOS.mlosRuleUpdatedSuccessfully"));
      } else {
        toast.error(result.message || t("MLOS.failedToUpdateMlosRule"));
      }
    } catch (error) {
      toast.error(t("MLOS.errorUpdatingMlosRule"));
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
    }
  };

  const handleDeleteClick = (ratePlanId: string) => {
    setRuleToDelete(ratePlanId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    setIsLoading({
      isLoading: true,
      message: t("MLOS.deletingMlosRule")
    });
    try {
      const result = await deleteRatePlanRule(ruleToDelete);
      if (result.success) {
        loadData();
        toast.success(t("MLOS.mlosRuleDeletedSuccessfully"));
      } else {
        toast.error(result.message || t("MLOS.failedToDeleteMlosRule"));
      }
    } catch (error) {
      toast.error(t("MLOS.errorDeletingMlosRule"));
    } finally {
      setIsLoading({
        isLoading: false,
        message: ''
      });
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
    if (!type || !value) return t("MLOS.noDiscount");
    return type === 'percentage' ? `${value}%` : ` ${value}`;
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {editData ? t("MLOS.edit") : t("MLOS.createMlosRule")}
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
        <BackButton/>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("MLOS.mlosRules")}</h2>
        <button
          onClick={() => {
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("MLOS.createMlosRule")}
        >
          + {t("MLOS.createMlosRule")}
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading.isLoading ? (
          <div className="py-12">
            <Loader text={isLoading.message} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("MLOS.ratePlan")}</TableHead>
                <TableHead>{t("MLOS.dateRange")}</TableHead>
                <TableHead>{t("MLOS.minLos")}</TableHead>
                <TableHead>{t("MLOS.maxLos")}</TableHead>
                <TableHead>{t("MLOS.discount")}</TableHead>
                <TableHead className='text-center'>{t("MLOS.autoApplied")}</TableHead>
                <TableHead>{t("MLOS.status")}</TableHead>

                <TableHead>{t("MLOS.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mlosRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {t("MLOS.noMlosRulesFound")}
                  </TableCell>
                </TableRow>
              ) : (
                mlosRules.map((rule) => {
                  const matchedRatePlan = ratePlans.find((rp) => rp.id === rule.ratePlan.id);
                  return (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {matchedRatePlan?._translations?.ratePlanName || rule.ratePlan.ratePlanName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rule.ratePlan.ratePlanCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {(() => {
                          if (!rule.startDate && !rule.endDate) return "N/A";
                          const start = rule.startDate ? (() => {
                            const d = new Date(rule.startDate);
                            const month = t(`Months.${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}`);
                            return `${month} ${d.getDate()}, ${d.getFullYear()}`;
                          })() : "";
                          const end = rule.endDate ? (() => {
                            const d = new Date(rule.endDate);
                            const month = t(`Months.${d.toLocaleString('en-US', { month: 'long' }).toLowerCase()}`);
                            return `${month} ${d.getDate()}, ${d.getFullYear()}`;
                          })() : "";
                          return start && end ? `${start} - ${end}` : start || end;
                        })()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {rule.minLos} {t("MLOS.nights")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {rule.maxLos ? (
                        <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded text-xs font-medium">
                          {rule.maxLos} {t("MLOS.nights")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("MLOS.noLimit")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${rule.discountType && rule.discountValue
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {formatDiscount(rule.discountType || null, rule.discountValue || null)} {rule.discountType === 'flat' && rule.currencyCode ? rule.currencyCode : ''}
                      </span>
                    </TableCell>
                    <TableCell >
                      <div className={`px-3 py-1  flex items-center justify-center  rounded text-xs ${rule.isAutoApplied
                        ? ' text-success '
                        : ' text-destructive'
                        }`}>
                        {rule.isAutoApplied ? <Check className='h-4 w-4' /> : <X className='h-4 w-4' />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${rule.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        {rule.isActive ? t("Common.active") : t("Common.inactive")}
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
                            onClick={() => handleEdit(rule)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            {t("MLOS.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(rule.ratePlanId)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            {t("Common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
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
                <h3 className="text-lg font-semibold text-foreground">{t("MLOS.deleteMlosRule")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("MLOS.deleteMlosRuleConfirmation")}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  disabled={isLoading.isLoading}
                >
                  {t("MLOS.cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                  disabled={isLoading.isLoading}
                >
                  {isLoading.isLoading ? t("MLOS.deleting") : t("Common.delete")}
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