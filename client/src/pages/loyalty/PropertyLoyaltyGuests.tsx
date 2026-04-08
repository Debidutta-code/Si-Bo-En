import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Users, Trash2, User, Mail, Phone, Eye } from "lucide-react";
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
import type { ILoyalityGuestsWDP } from "./interfaces";
import { Pagination } from "@/components/ui/pagination";

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

export default function PropertyLoyaltyGuests() {
  const { propertyId, loyalityId } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty guests..."
  });
  const [metadataDialogOpen, setMetadataDialogOpen] = useState<boolean>(false);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const [guests, setGuests] = useState<ILoyalityGuestsWDP[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>({
    currentPage: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
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
        // API returns guests array in `data` and pagination in `pagination`
        setGuests(response.data || []);
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage || 1,
            totalPages: response.pagination.totalPages || 1,
            totalCount: response.pagination.totalCount || 0,
            hasNextPage: response.pagination.hasNextPage || false,
            hasPrevPage: response.pagination.hasPrevPage || false,
            limit: response.pagination.limit || limit,
          });
        }
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

  const handleDeleteGuest = async (guestId:string): Promise<void> => {
    try {
      
      if (!guestId) return;
  
      setLoader({ isLoading: true, message: "Deleting loyalty guest..." });
      const response = await deleteLoyaltyGuestService(guestId);
  
      if (response.success) {
        toast.success("Loyalty guest deleted successfully");
        const currentPageGuests = guests.length;
        if (currentPageGuests === 1 && pagination.currentPage > 1) {
          fetchGuests(pagination.currentPage - 1, pagination.limit);
        } else {
          fetchGuests(pagination.currentPage, pagination.limit);
        }
      } else {
      }
    } catch (error) {
      
      toast.error( "Failed to delete loyalty guest");
    }finally{
      setLoader({ isLoading: false, message: "" });

    }
  };
  const openDeleteDialog = (guestId: string): void => {
    setDeleteGuestId(guestId);
    // setDeleteDialogOpen(true);
  };
  const openMetadataDialog = (metadata: any): void => {
    setSelectedMetadata(metadata);
    setMetadataDialogOpen(true);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchGuests(newPage);
    }
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
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Loyality Fields</TableHead>

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
                              {loyaltyGuest.guest && loyaltyGuest.guest.firstName}{" "}
                              {loyaltyGuest.guest && loyaltyGuest.guest.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {loyaltyGuest.guest && loyaltyGuest.guest.email || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {loyaltyGuest.guest && loyaltyGuest.guest.phoneNumber || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{propertyId || "N/A"}</p>
                          </div>
                        </TableCell>


                        <TableCell className="flex justify-center items-center">
                          {loyaltyGuest.metaData ? (
                            <span
                              onClick={() => openMetadataDialog(loyaltyGuest.metaData)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
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

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={pagination.limit}
                  totalItems={pagination.totalCount}
                />
              </div>
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


      <AlertDialog open={metadataDialogOpen} onOpenChange={setMetadataDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Loyalty Program Fields</AlertDialogTitle>
            <AlertDialogDescription>
              Guest-specific loyalty program information
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {selectedMetadata && typeof selectedMetadata === 'object' ? (
              Object.entries(selectedMetadata).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 items-start border-b pb-3 last:border-b-0">
                  <div className="font-medium text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim().replaceAll("_", " ")}:
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground break-words">
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No metadata available</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
