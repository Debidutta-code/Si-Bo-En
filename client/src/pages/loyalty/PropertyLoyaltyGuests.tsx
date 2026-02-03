import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { getLoyaltyGuestsForCreationService, deleteLoyaltyGuestService } from "./services/loyalty.guest.service";

interface ILoader {
  isLoading: boolean;
  message: string;
}

interface ILoyaltyGuest {
  id: string;
  guestId: string;
  propertyId: string;
  propertyCode: string;
  creationLoyaltyConfigId: string;
  createdAt: string;
  updatedAt: string;
}

interface IPaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function PropertyLoyaltyGuests() {
  const { propertyId, loyalityId } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty guests..."
  });
  const [guests, setGuests] = useState<ILoyaltyGuest[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (loyalityId) {
      fetchGuests(1);
    }
  }, [loyalityId]);

  const fetchGuests = async (page: number, limit: number = 10) => {
    if (!loyalityId) return;

    setLoader({ isLoading: true, message: "Loading loyalty guests..." });
    try {
      const skip = (page - 1) * limit;
      const response = await getLoyaltyGuestsForCreationService(loyalityId, skip, limit);

      if (response.success && response.data) {
        setGuests(response.data.data || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalCount: response.data.totalCount || 0,
          hasNextPage: response.data.hasNextPage || false,
          hasPreviousPage: response.data.hasPreviousPage || false
        });
      } else {
        toast.error(response.message || "Failed to fetch loyalty guests");
        setGuests([]);
      }
    } catch (error) {
      console.error("Error fetching loyalty guests:", error);
      toast.error("Failed to fetch loyalty guests");
      setGuests([]);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    setLoader({ isLoading: true, message: "Deleting guest..." });
    try {
      const response = await deleteLoyaltyGuestService(guestId);

      if (response.success) {
        toast.success("Guest removed from loyalty program");
        await fetchGuests(pagination.currentPage);
      } else {
        toast.error(response.message || "Failed to remove guest");
      }
    } catch (error) {
      toast.error("An error occurred while removing guest");
    } finally {
      setLoader({ isLoading: false, message: "" });
      setDeleteGuestId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchGuests(newPage);
    }
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/property/loyalty/${propertyId}`)}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Loyalty Programs
        </Button>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Loyalty Guests</h1>
            <p className="text-muted-foreground mt-1">
              {pagination.totalCount} guest{pagination.totalCount !== 1 ? 's' : ''} enrolled in this program
            </p>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <Card>
        <CardContent className="p-0">
          {guests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No guests enrolled in this loyalty program yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest ID</TableHead>
                      <TableHead>Property Code</TableHead>
                      <TableHead>Enrolled Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.guestId}</TableCell>
                        <TableCell>{guest.propertyCode}</TableCell>
                        <TableCell>
                          {new Date(guest.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteGuestId(guest.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteGuestId} onOpenChange={() => setDeleteGuestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Guest?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this guest from the loyalty program? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteGuestId && handleDeleteGuest(deleteGuestId)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}