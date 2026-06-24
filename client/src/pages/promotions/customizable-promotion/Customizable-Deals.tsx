import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Loader from "@/components/Loader/Loader";
import { CustomizableDealForm } from "./components";
import {
  getCustomizableDealsByPropertyService,
  createCustomizableDealService,
  updateCustomizableDealService,
  deleteCustomizableDealService,
} from "./services";
import { fetchRatePlansService } from "@/pages/rate-plan/services";
import { fetchRoomTypesService } from "@/pages/inventory/services";
import type { RatePlan } from "@/pages/rate-plan/interfaces";
import type { RoomTypes } from "@/pages/inventory/types";
import type { CreateCustomizableDeal, CustomizableDeal } from "./interfaces";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit, MoreVertical, Trash2, Tag, Percent, DollarSign, Check, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAddOnsService } from "@/pages/add-on/services";
import type { IAddon } from "@/pages/add-on/interface";
import type { ILoader } from "@/pages/dashboard/interface";
import BackButton from "@/components/shared/BackButton";
import { useTranslation } from "react-i18next";

export const CustomizableDealList: React.FC = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [deals, setDeals] = useState<CustomizableDeal[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
  const [addons, setAddons] = useState<IAddon[]>([]);
  const [isLoading, setIsLoading] = useState<ILoader>({ isLoading: false, message: "" });
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<CustomizableDeal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [propertyId]);

  const loadData = async () => {
    setIsLoading({ isLoading: true, message: t("CustomizableDeals.loadingDeals") });
    try {
      if (!propertyId) { toast.error(t("CustomizableDeals.propertyNotFound")); return; }
      const [dealsRes, plansRes, roomsRes, addonsRes] = await Promise.all([
        getCustomizableDealsByPropertyService(propertyId),
        fetchRatePlansService(propertyId),
        fetchRoomTypesService(propertyId),
        fetchAddOnsService(propertyId),
      ]);
      if (dealsRes.success) setDeals(dealsRes.data || []);
      if (plansRes.success) setRatePlans(plansRes.data || []);
      if (roomsRes.success) setRoomTypes(roomsRes.data || []);
      if (addonsRes.success) setAddons(addonsRes.data || []);
    } catch {
      toast.error(t("CustomizableDeals.failedToLoadDeals"));
    } finally {
      setIsLoading({ isLoading: false, message: "" });
    }
  };

  const handleCreate = async (payload: CreateCustomizableDeal) => {
    if (!propertyId) return;
    setIsLoading({ isLoading: true, message: t("CustomizableDeals.creatingDeal") });
    try {
      const result = await createCustomizableDealService(payload, propertyId);
      if (result.success) {
        setShowForm(false);
        loadData();
        toast.success(t("CustomizableDeals.dealCreatedSuccessfully"));
      } else {
        toast.error(result.message || t("CustomizableDeals.failedToCreateDeal"));
      }
    } catch {
      toast.error(t("CustomizableDeals.errorCreatingDeal"));
    } finally {
      setIsLoading({ isLoading: false, message: "" });
    }
  };

  const handleUpdate = async (payload: CreateCustomizableDeal) => {
    if (!editData || !propertyId) return;
    setIsLoading({ isLoading: true, message: t("CustomizableDeals.updatingDeal") });
    try {
      const result = await updateCustomizableDealService(editData.id, payload, propertyId);
      if (result.success) {
        setShowForm(false);
        setEditData(null);
        loadData();
        toast.success(t("CustomizableDeals.dealUpdatedSuccessfully"));
      } else {
        toast.error(result.message || t("CustomizableDeals.failedToUpdateDeal"));
      }
    } catch {
      toast.error(t("CustomizableDeals.errorUpdatingDeal"));
    } finally {
      setIsLoading({ isLoading: false, message: "" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dealToDelete || !propertyId) return;
    setIsLoading({ isLoading: true, message: t("CustomizableDeals.deletingDeal") });
    try {
      const result = await deleteCustomizableDealService(dealToDelete, propertyId);
      if (result.success) {
        loadData();
        toast.success(t("CustomizableDeals.dealDeletedSuccessfully"));
      } else {
        toast.error(result.message || t("CustomizableDeals.failedToDeleteDeal"));
      }
    } catch {
      toast.error(t("CustomizableDeals.errorDeletingDeal"));
    } finally {
      setIsLoading({ isLoading: false, message: "" });
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const getDiscountDisplay = (deal: CustomizableDeal) => {
    if (deal.discountType === "percentage") {
      return <div className="flex items-center gap-1"><Percent className="w-3 h-3" /><span>{deal.discountValue}%</span></div>;
    }
    return <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /><span>{deal.currencyCode} {deal.discountValue}</span></div>;
  };

  const formatDate = (date: string) => {
    const [y, m, d] = date.split('T')[0].split('-').map(Number);
    const monthKeys = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    return `${t(`Months.${monthKeys[m - 1]}`)} ${String(d).padStart(2, '0')}, ${y}`;
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {editData ? t("CustomizableDeals.editTitle") : t("CustomizableDeals.createTitle")}
        </h2>
        <CustomizableDealForm
          ratePlans={ratePlans}
          roomTypes={roomTypes}
          addons={addons}
          onSubmit={editData ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditData(null); }}
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
          <h2 className="text-2xl font-bold text-foreground">{t("CustomizableDeals.customizableDeals")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("CustomizableDeals.targetDescription")}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + {t("CustomizableDeals.createDeal")}
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading.isLoading ? (
          <div className="py-12"><Loader text={isLoading.message} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("CustomizableDeals.discount")}</TableHead>
                <TableHead>{t("CustomizableDeals.room")}</TableHead>
                <TableHead>{t("CustomizableDeals.ratePlan")}</TableHead>
                <TableHead>{t("CustomizableDeals.period")}</TableHead>
                <TableHead>{t("CustomizableDeals.addons")}</TableHead>
                <TableHead className="text-center">{t("CustomizableDeals.active")}</TableHead>
                <TableHead>{t("CustomizableDeals.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {t("CustomizableDeals.noDealsFound")}
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
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{deal.Room._translations?.roomName || deal.Room.roomName}</span>
                        <span className="text-xs text-muted-foreground">({deal.roomType})</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{deal.RatePlan._translations?.ratePlanName || deal.RatePlan.ratePlanName}</span>
                        <span className="text-xs text-muted-foreground">({deal.ratePlanCode})</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{formatDate(deal.startDate)}</span>
                        <span className="text-muted-foreground text-xs">{t("CustomizableDeals.to")}</span>
                        <span>{formatDate(deal.endDate)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {deal.CustomizableDealsApplicableAddons.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{deal.CustomizableDealsApplicableAddons.length} {t("CustomizableDeals.addons")}</span>
                        </div>
                      )}
                    </TableCell>

                    

                    <TableCell className="text-center">
                      {deal.isActive
                        ? <Check className="h-4 w-4 text-success mx-auto" />
                        : <X className="h-4 w-4 text-destructive mx-auto" />}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-accent rounded-md transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => { setEditData(deal); setShowForm(true); }} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-3" /> {t("Common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setDealToDelete(deal.id); setDeleteDialogOpen(true); }}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-3" /> {t("Common.delete")}
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
            <h3 className="text-lg font-semibold text-foreground">{t("CustomizableDeals.deleteDeal")}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t("CustomizableDeals.deleteConfirmation")}
            </p>
            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-border">
              <button
                onClick={() => { setDeleteDialogOpen(false); setDealToDelete(null); }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                disabled={isLoading.isLoading}
              >
                {t("CustomizableDeals.cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                disabled={isLoading.isLoading}
              >
                {isLoading.isLoading ? t("CustomizableDeals.deleting") : t("CustomizableDeals.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizableDealList;