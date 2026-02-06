import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/Loader/Loader";
import {
  getLoyaltyGuestsForCreationService,
  deleteLoyaltyGuestService,
} from "./services/loyalty.guest.service";
import { getLoyalityByCreationService } from "./services";
import type { ILoyalityGuestsWDP } from "./interfaces";

interface ILoader {
  isLoading: boolean;
  message: string;
}

interface IPaginationData {
  currentPage: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function LoyaltyGuest() {
  const { creationId } = useParams<{ creationId: string }>();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty configuration...",
  });
  const [creationLoyaltyId, setCreationLoyaltyId] = useState<string | null>(null);
  const [guests, setGuests] = useState<ILoyalityGuestsWDP[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>({
    currentPage: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (creationId) {
      fetchCreationLoyalty();
    }
  }, [creationId]);

  useEffect(() => {
    if (creationLoyaltyId) {
      fetchLoyaltyGuests(1, pagination.limit);
    }
  }, [creationLoyaltyId]);

  const fetchCreationLoyalty = async (): Promise<void> => {
    if (!creationId) {
      toast.error("Creation ID not found");
      return;
    }

    setLoader({ isLoading: true, message: "Loading loyalty configuration..." });
    const response = await getLoyalityByCreationService(creationId);

    if (response.success && response.data) {
      setCreationLoyaltyId(response.data.id);
    } else {
      toast.error(response.message || "Failed to fetch loyalty configuration");
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchLoyaltyGuests = async (page: number, limit: number = 10): Promise<void> => {
    if (!creationLoyaltyId) {
      return;
    }

    setLoader({ isLoading: true, message: "Loading loyalty guests..." });
    const skip = (page - 1) * limit;
    const response = await getLoyaltyGuestsForCreationService(
      creationLoyaltyId,
      skip,
      limit
    );

    if (response.success && response.data) {
      setGuests(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } else {
      toast.error(response.message || "Failed to fetch loyalty guests");
      setGuests([]);
    }
    setLoader({ isLoading: false, message: "" });
  };

  const handlePageChange = (page: number): void => {
    fetchLoyaltyGuests(page, pagination.limit);
  };

  const openDeleteDialog = (guestId: string): void => {
    setSelectedGuestId(guestId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteGuest = async (): Promise<void> => {
    if (!selectedGuestId) return;

    setLoader({ isLoading: true, message: "Deleting loyalty guest..." });
    const response = await deleteLoyaltyGuestService(selectedGuestId);

    if (response.success) {
      toast.success("Loyalty guest deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedGuestId(null);
      // Refresh the current page or go to previous page if current page becomes empty
      const currentPageGuests = guests.length;
      if (currentPageGuests === 1 && pagination.currentPage > 1) {
        fetchLoyaltyGuests(pagination.currentPage - 1, pagination.limit);
      } else {
        fetchLoyaltyGuests(pagination.currentPage, pagination.limit);
      }
    } else {
      toast.error(response.message || "Failed to delete loyalty guest");
    }
    setLoader({ isLoading: false, message: "" });
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Loyalty Guests</CardTitle>
          <CardDescription>
            Manage guests enrolled in the loyalty program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Loyalty Guests</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No guests have enrolled in this loyalty program yet.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Enrolled On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((loyaltyGuest) => (
                      <TableRow key={loyaltyGuest.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {loyaltyGuest.guest.firstName}{" "}
                              {loyaltyGuest.guest.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {loyaltyGuest.guest.email || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {loyaltyGuest.guest.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {loyaltyGuest.property.propertyName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Code: {loyaltyGuest.property.propertyCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {loyaltyGuest.guest.city || loyaltyGuest.guest.state
                                ? `${loyaltyGuest.guest.city || ""}${
                                    loyaltyGuest.guest.city &&
                                    loyaltyGuest.guest.state
                                      ? ", "
                                      : ""
                                  }${loyaltyGuest.guest.state || ""}`
                                : "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                            {loyaltyGuest.guest.userType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(loyaltyGuest.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(loyaltyGuest.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={pagination.limit}
                    totalItems={pagination.totalCount}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              guest from the loyalty program.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGuest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
