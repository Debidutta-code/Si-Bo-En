import { useEffect, useState } from "react";
import type { ILoader } from "../dashboard/interface";
import type {
  IBookingOffset,
  ICBookingOffsetS,
  IUBookingOffsetR,
} from "./interfaces";
import {
  getBookingOffsetsService,
  deleteBookingOffsetByIdService,
  deleteBookingOffsetsService,
  updateBookingOffsetByIdService,
  updateBookingOffsetsService,
} from "./services";
import Loader from "@/components/Loader/Loader";
import { useParams } from "react-router-dom";
import type { RatePlan } from "../tax-system/interface";
import { fetchRatePlansService } from "../rate-plan/services";
import toast from "react-hot-toast";
import BackButton from "@/components/shared/BackButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2, Calendar, Filter } from "lucide-react";
import {
  OffsetFormModal,
  DeleteConfirmDialog,
  CreateBookingOffsetForm,
} from "./components";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function BookingOffset() {
  const { propertyId } = useParams();
  const { t } = useTranslation();

  const [loader, setLoader] = useState<ILoader>({
    isLoading: false,
    message: "",
  });
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(
    null,
  );
  const [bookingOffsets, setBookingOffsets] = useState<IBookingOffset[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editOffset, setEditOffset] = useState<IBookingOffset | null>(null);
  const [editForm, setEditForm] = useState<IUBookingOffsetR>({
    minimumAdvanceBookingOffset: null,
    maximumAdvanceBookingOffset: null,
    minimumAmendBookingOffset: null,
    maximumAmendBookingOffset: null,
    minimumCancelBookingOffset: null,
    maximumCancelBookingOffset: null,
  });

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    id?: string;
  } | null>(null);

  // Bulk update modal
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] =
    useState<boolean>(false);
  const [bulkUpdateForm, setBulkUpdateForm] = useState<ICBookingOffsetS>({
    minimumAdvanceBookingOffset: null,
    maximumAdvanceBookingOffset: null,
    minimumAmendBookingOffset: null,
    maximumAmendBookingOffset: null,
    minimumCancelBookingOffset: null,
    maximumCancelBookingOffset: null,
  });

  const [bulkStartDate, setBulkStartDate] = useState<string>("");
  const [bulkEndDate, setBulkEndDate] = useState<string>("");
  const [bulkRatePlanId, setBulkRatePlanId] = useState<string>("");

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (propertyId) {
      loadRatePlans();
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchOffsets();
    }
  }, [propertyId, selectedRatePlan, startDate, endDate]);

  const loadRatePlans = async () => {
    if (!propertyId) {
      toast.error(t("BookingOffset.toast.propertyIdRequired"));
      return;
    }
    setLoader({ isLoading: true, message: t("BookingOffset.toast.loadingRatePlans") });
    try {
      const ratePlansResponse = await fetchRatePlansService(propertyId);
      if (ratePlansResponse.success) {
        setRatePlans(ratePlansResponse.data);
      } else {
        toast.error(ratePlansResponse.message);
      }
    } catch (error) {
      toast.error(t("BookingOffset.toast.failedLoadRatePlans"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchOffsets = async () => {
    if (!propertyId) return;
    setLoader({ isLoading: true, message: t("BookingOffset.toast.loadingOffsets") });
    try {
      const response = await getBookingOffsetsService(
        propertyId,
        selectedRatePlan?.id || null,
        startDate ? startDate : null,
        endDate ? endDate : null,
      );
      if (response.success) {
        setBookingOffsets(response.data || []);
      } else {
        toast.error(response.message || t("BookingOffset.toast.failedFetchOffsets"));
      }
    } catch (error) {
      toast.error(t("BookingOffset.toast.failedFetchOffsets"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // --- Single row update ---
  const handleEditClick = (offset: IBookingOffset) => {
    setEditOffset(offset);
    setEditForm({
      minimumAdvanceBookingOffset: offset.minimumAdvanceBookingOffset,
      maximumAdvanceBookingOffset: offset.maximumAdvanceBookingOffset,
      minimumAmendBookingOffset: offset.minimumAmendBookingOffset,
      maximumAmendBookingOffset: offset.maximumAmendBookingOffset,
      minimumCancelBookingOffset: offset.minimumCancelBookingOffset,
      maximumCancelBookingOffset: offset.maximumCancelBookingOffset,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editOffset) return;
    setLoader({ isLoading: true, message: t("BookingOffset.toast.updating") });
    try {
      const result = await updateBookingOffsetByIdService(
        editOffset.id,
        editForm,
      );
      if (result.success) {
        toast.success(t("BookingOffset.toast.updatedSuccess"));
        setEditModalOpen(false);
        setEditOffset(null);
        fetchOffsets();
      } else {
        toast.error(result.message || t("BookingOffset.toast.failedUpdate"));
      }
    } catch (error) {
      toast.error(t("BookingOffset.toast.failedUpdate"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // --- Delete ---
  const handleDeleteClick = (id: string) => {
    setDeleteTarget({ type: "single", id });
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setBulkStartDate(startDate);
    setBulkEndDate(endDate);
    setBulkRatePlanId(selectedRatePlan?.id || "");
    setDeleteTarget({ type: "bulk" });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoader({ isLoading: true, message: t("BookingOffset.toast.deleting") });
    try {
      let result;
      if (deleteTarget.type === "single" && deleteTarget.id) {
        result = await deleteBookingOffsetByIdService(deleteTarget.id);
      } else if (
        deleteTarget.type === "bulk" &&
        propertyId &&
        bulkRatePlanId &&
        bulkStartDate &&
        bulkEndDate
      ) {
        result = await deleteBookingOffsetsService(
          propertyId,
          bulkRatePlanId,
          bulkStartDate,
          bulkEndDate,
        );
      }
      if (result?.success) {
        toast.success(
        deleteTarget.type === "single"
            ? t("BookingOffset.toast.deletedSingleSuccess")
            : t("BookingOffset.toast.deletedBulkSuccess"),
        );
        fetchOffsets();
      } else {
        toast.error(result?.message || t("BookingOffset.toast.failedDelete"));
      }
    } catch (error) {
      toast.error(t("BookingOffset.toast.failedDelete"));
    } finally {
      setLoader({ isLoading: false, message: "" });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // --- Bulk update ---
  const handleBulkUpdateClick = () => {
    setBulkStartDate(startDate);
    setBulkEndDate(endDate);
    setBulkRatePlanId(selectedRatePlan?.id || "");
    setBulkUpdateForm({
      minimumAdvanceBookingOffset: null,
      maximumAdvanceBookingOffset: null,
      minimumAmendBookingOffset: null,
      maximumAmendBookingOffset: null,
      minimumCancelBookingOffset: null,
      maximumCancelBookingOffset: null,
    });
    setBulkUpdateModalOpen(true);
  };

  const handleBulkUpdateSubmit = async () => {
    if (!propertyId || !bulkRatePlanId || !bulkStartDate || !bulkEndDate)
      return;
    setLoader({ isLoading: true, message: t("BookingOffset.toast.bulkUpdating") });
    try {
      const result = await updateBookingOffsetsService(
        propertyId,
        bulkRatePlanId,
        bulkStartDate,
        bulkEndDate,
        bulkUpdateForm,
      );
      if (result.success) {
        toast.success(t("BookingOffset.toast.bulkUpdatedSuccess"));
        setBulkUpdateModalOpen(false);
        fetchOffsets();
      } else {
        toast.error(result.message || t("BookingOffset.toast.failedBulkUpdate"));
      }
    } catch (error) {
      toast.error(t("BookingOffset.toast.failedBulkUpdate"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loader.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loader.message} />
      </div>
    );
  }
  const convertToDaysOrHours = (value: number | null) => {
    if (!value) return "-";
    const days = Math.floor(value / 24);
    const hours = value % 24;
    if (days > 0 && hours > 0)
      return `${days} ${days > 1 ? t("BookingOffset.daysAndHours.days") : t("BookingOffset.daysAndHours.day")} ${t("BookingOffset.daysAndHours.and")} ${hours} ${hours > 1 ? t("BookingOffset.daysAndHours.hours") : t("BookingOffset.daysAndHours.hour")}`;
    if (days > 0) return `${days} ${days > 1 ? t("BookingOffset.daysAndHours.days") : t("BookingOffset.daysAndHours.day")}`;
    return `${hours} ${hours > 1 ? t("BookingOffset.daysAndHours.hours") : t("BookingOffset.daysAndHours.hour")}`;
  };
  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("BookingOffset.title")}</h2>
        <Button
          onClick={() => setCreateModalOpen(true)}
        // className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + {t("BookingOffset.createButton")}
        </Button>
      </div>

      {/* Rate Plan Selector */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="flex justify-between">

          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={handleBulkUpdateClick}
              variant={"default"}
            >
              {t("BookingOffset.bulkActions.bulkUpdate")}
            </Button>
            <Button
              onClick={handleBulkDeleteClick}
              variant={"destructive"}
            >
              {t("BookingOffset.bulkActions.bulkUpdate")}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Rate Plan
            </label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedRatePlan?.id || ""}
              onChange={(e) => {
                const rp = ratePlans.find((r) => r.id === e.target.value);
                setSelectedRatePlan(rp || null);
                setBookingOffsets([]);
              }}
            >
              <option value="">{t("BookingOffset.filters.selectRatePlan")}</option>
              {ratePlans.map((rp) => (
                <option key={rp.id} value={rp.id}>
                  {rp._translations?.ratePlanName ?? rp.ratePlanName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t("BookingOffset.filters.startDate")}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t("BookingOffset.filters.endDate")}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {bookingOffsets.length === 0 && !selectedRatePlan ? (
        <div className="bg-card rounded-lg border border-border p-12 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("BookingOffset.empty.title")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {t("BookingOffset.empty.description")}
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Action Buttons */}


          {/* Offsets Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Rate Plan</TableHead>

                  <TableHead className="text-center">{t("BookingOffset.table.date")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.minAdvanceBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.maxAdvanceBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.minAmendBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.maxAmendBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.minCancelBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.maxCancelBooking")}</TableHead>
                  <TableHead className="text-center">{t("BookingOffset.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingOffsets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {t("BookingOffset.table.noOffsets")}
                    </TableCell>
                  </TableRow>
                ) : (
                  bookingOffsets.map((offset) => (
                    <TableRow key={offset.id}>
                      <TableCell className="font-medium">
                        {ratePlans.find(r => r.ratePlanCode === offset.ratePlanCode)?._translations?.ratePlanName ?? offset.ratePlanName}
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatDate(offset.date)}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(
                          offset.minimumAdvanceBookingOffset,
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(
                          offset.maximumAdvanceBookingOffset,
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(offset.minimumAmendBookingOffset)}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(offset.maximumAmendBookingOffset)}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(
                          offset.minimumCancelBookingOffset,
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {convertToDaysOrHours(
                          offset.maximumCancelBookingOffset,
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-accent rounded-md transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(offset)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-3" />
                              {t("Common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(offset.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              {t("Common.edit")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Edit Modal (Single Row) */}
      {editModalOpen && editOffset && (
        <OffsetFormModal
          title={t("BookingOffset.form.editTitle")}
          subtitle={t("BookingOffset.form.editSubtitle", { date: formatDate(editOffset.date) })}
          form={editForm}
          onFormChange={(f) => setEditForm(f as IUBookingOffsetR)}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setEditModalOpen(false);
            setEditOffset(null);
          }}
          submitLabel={t("BookingOffset.form.submitLabel")}
        />
      )}

      {/* Bulk Update Modal */}
      {bulkUpdateModalOpen && (
        <OffsetFormModal
          title={t("BookingOffset.form.bulkUpdateTitle")}
          subtitle={t("BookingOffset.form.bulkUpdateSubtitle", { ratePlanName: selectedRatePlan?.ratePlanName })}
          form={bulkUpdateForm}
          onFormChange={setBulkUpdateForm}
          onSubmit={handleBulkUpdateSubmit}
          onClose={() => setBulkUpdateModalOpen(false)}
          submitLabel={t("BookingOffset.form.updateAllLabel")}
          showDateRange
          startDate={bulkStartDate}
          endDate={bulkEndDate}
          onStartDateChange={setBulkStartDate}
          onEndDateChange={setBulkEndDate}
          ratePlans={ratePlans}
          selectedRatePlanId={bulkRatePlanId}
          onRatePlanChange={setBulkRatePlanId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <DeleteConfirmDialog
          title={
            deleteTarget?.type === "bulk"
              ? t("BookingOffset.delete.bulkTitle")
              : t("BookingOffset.delete.singleTitle")
          }
          message={
            deleteTarget?.type === "bulk"
              ? t("BookingOffset.delete.bulkMessage", { ratePlanName: selectedRatePlan?.ratePlanName })
              : t("BookingOffset.delete.singleMessage")
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={loader.isLoading}
          showDateRange={deleteTarget?.type === "bulk"}
          startDate={bulkStartDate}
          endDate={bulkEndDate}
          onStartDateChange={setBulkStartDate}
          onEndDateChange={setBulkEndDate}
          ratePlans={deleteTarget?.type === "bulk" ? ratePlans : undefined}
          selectedRatePlanId={bulkRatePlanId}
          onRatePlanChange={setBulkRatePlanId}
        />
      )}

      {/* Create Modal */}
      {createModalOpen && propertyId && (
        <CreateBookingOffsetForm
          propertyId={propertyId}
          ratePlans={ratePlans}
          selectedRatePlan={selectedRatePlan}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchOffsets();
          }}
        />
      )}
    </div>
  );
}
