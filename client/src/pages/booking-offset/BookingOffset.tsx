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
import { Edit, MoreVertical, Trash2, Calendar } from "lucide-react";
import {
  OffsetFormModal,
  DeleteConfirmDialog,
  CreateBookingOffsetForm,
} from "./components";

export default function BookingOffset() {
  const { propertyId } = useParams();
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

  // Bulk date range (separate from the page-level filter)
  const [bulkStartDate, setBulkStartDate] = useState<string>("");
  const [bulkEndDate, setBulkEndDate] = useState<string>("");

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (propertyId) {
      loadRatePlans();
    }else{
      console.log("Property ID is required");
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchOffsets();
    }
  }, [propertyId, selectedRatePlan, startDate, endDate]);

  const loadRatePlans = async () => {
    if (!propertyId) {
      toast.error("Property ID is required");
      return;
    }
    setLoader({ isLoading: true, message: "Loading Rate Plans..." });
    try {
      const ratePlansResponse = await fetchRatePlansService(propertyId);
      if (ratePlansResponse.success) {
        setRatePlans(ratePlansResponse.data);
      } else {
        toast.error(ratePlansResponse.message);
      }
    } catch (error) {
      toast.error("Failed to load Rate Plans, try again later");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchOffsets = async () => {
    if (!propertyId) return;
    setLoader({ isLoading: true, message: "Loading Booking Offsets..." });
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
        toast.error(response.message || "Failed to fetch booking offsets");
      }
    } catch (error) {
      toast.error("Failed to fetch booking offsets");
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
    setLoader({ isLoading: true, message: "Updating Booking Offset..." });
    try {
      const result = await updateBookingOffsetByIdService(
        editOffset.id,
        editForm,
      );
      if (result.success) {
        toast.success("Booking offset updated successfully!");
        setEditModalOpen(false);
        setEditOffset(null);
        fetchOffsets();
      } else {
        toast.error(result.message || "Failed to update booking offset");
      }
    } catch (error) {
      toast.error("Failed to update booking offset");
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
    setDeleteTarget({ type: "bulk" });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoader({ isLoading: true, message: "Deleting Booking Offset(s)..." });
    try {
      let result;
      if (deleteTarget.type === "single" && deleteTarget.id) {
        result = await deleteBookingOffsetByIdService(deleteTarget.id);
      } else if (
        deleteTarget.type === "bulk" &&
        propertyId &&
        selectedRatePlan &&
        bulkStartDate &&
        bulkEndDate
      ) {
        result = await deleteBookingOffsetsService(
          propertyId,
          selectedRatePlan.id,
          bulkStartDate,
          bulkEndDate,
        );
      }
      if (result?.success) {
        toast.success(
          deleteTarget.type === "single"
            ? "Booking offset deleted successfully!"
            : "Booking offsets deleted successfully!",
        );
        fetchOffsets();
      } else {
        toast.error(result?.message || "Failed to delete booking offset(s)");
      }
    } catch (error) {
      toast.error("Failed to delete booking offset(s)");
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
    if (!propertyId || !selectedRatePlan || !bulkStartDate || !bulkEndDate)
      return;
    setLoader({ isLoading: true, message: "Updating Booking Offsets..." });
    try {
      const result = await updateBookingOffsetsService(
        propertyId,
        selectedRatePlan.id,
        bulkStartDate,
        bulkEndDate,
        bulkUpdateForm,
      );
      if (result.success) {
        toast.success("Booking offsets updated successfully!");
        setBulkUpdateModalOpen(false);
        fetchOffsets();
      } else {
        toast.error(result.message || "Failed to update booking offsets");
      }
    } catch (error) {
      toast.error("Failed to update booking offsets");
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
      return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours > 1 ? "s" : ""}`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };
  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Booking Offsets</h2>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Create Booking Offsets
        </button>
      </div>

      {/* Rate Plan Selector */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
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
              <option value="">Select a Rate Plan</option>
              {ratePlans.map((rp) => (
                <option key={rp.id} value={rp.id}>
                  {rp.ratePlanName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Start Date
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
              End Date
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
            No Rate Plan Selected
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Select a rate plan and date range above to view and manage booking
            offsets.
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleBulkUpdateClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
              disabled={bookingOffsets.length === 0}
            >
              Bulk Update
            </button>
            <button
              onClick={handleBulkDeleteClick}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
              disabled={bookingOffsets.length === 0}
            >
              Bulk Delete
            </button>
          </div>

          {/* Offsets Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Min Advance Booking</TableHead>
                  <TableHead className="text-center">Max Advance Booking</TableHead>
                  <TableHead className="text-center">Min Amend Booking</TableHead>
                  <TableHead className="text-center">Max Amend Booking</TableHead>
                  <TableHead className="text-center">Min Cancel Booking</TableHead>
                  <TableHead className="text-center">Max Cancel Booking</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingOffsets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No booking offsets found for this rate plan and date
                      range.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookingOffsets.map((offset) => (
                    <TableRow key={offset.id}>
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(offset.id)}
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
          </div>
        </>
      )}

      {/* Edit Modal (Single Row) */}
      {editModalOpen && editOffset && (
        <OffsetFormModal
          title="Edit Booking Offset"
          subtitle={`Date: ${formatDate(editOffset.date)}`}
          form={editForm}
          onFormChange={(f) => setEditForm(f as IUBookingOffsetR)}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setEditModalOpen(false);
            setEditOffset(null);
          }}
          submitLabel="Save Changes"
        />
      )}

      {/* Bulk Update Modal */}
      {bulkUpdateModalOpen && (
        <OffsetFormModal
          title="Bulk Update Booking Offsets"
          subtitle={`This will update all offsets for ${selectedRatePlan?.ratePlanName}.`}
          form={bulkUpdateForm}
          onFormChange={setBulkUpdateForm}
          onSubmit={handleBulkUpdateSubmit}
          onClose={() => setBulkUpdateModalOpen(false)}
          submitLabel="Update All"
          showDateRange
          startDate={bulkStartDate}
          endDate={bulkEndDate}
          onStartDateChange={setBulkStartDate}
          onEndDateChange={setBulkEndDate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <DeleteConfirmDialog
          title={
            deleteTarget?.type === "bulk"
              ? "Delete All Booking Offsets"
              : "Delete Booking Offset"
          }
          message={
            deleteTarget?.type === "bulk"
              ? `Are you sure you want to delete all booking offsets for ${selectedRatePlan?.ratePlanName}? This action cannot be undone.`
              : "Are you sure you want to delete this booking offset? This action cannot be undone."
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={loader.isLoading}
          showDateRange={deleteTarget?.type === "bulk"}
          startDate={bulkStartDate}
          endDate={bulkEndDate}
          onStartDateChange={setBulkStartDate}
          onEndDateChange={setBulkEndDate}
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
