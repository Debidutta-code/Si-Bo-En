import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronLeft, Users, User, Mail, Eye } from "lucide-react";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/Loader/Loader";
import { getLoyaltyGuestsForCreationService } from "./services/loyalty.guest.service";
import { Pagination } from "@/components/ui/pagination";
import type { IGetLoyaltyGuestsForCreation } from "./interfaces";

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
  const { t } = useTranslation();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: t("PropertyLoyaltyGuests.loading")
  });
  const [metadataDialogOpen, setMetadataDialogOpen] = useState<boolean>(false);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);

  const [guests, setGuests] = useState<IGetLoyaltyGuestsForCreation[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>({
    currentPage: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    if (loyalityId) {
      fetchGuests(1);
    }
  }, [loyalityId]);

  const fetchGuests = async (page: number, limit: number = 10) => {
    if (!loyalityId) return;

    setLoader({ isLoading: true, message: t("PropertyLoyaltyGuests.loading") });
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
        toast.error(response.message || t("PropertyLoyaltyGuests.errorFetching"));
        setGuests([]);
      }
    } catch (error) {
      console.error("Error fetching loyalty guests:", error);
      toast.error(t("PropertyLoyaltyGuests.errorFetching"));
      setGuests([]);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
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
          {t("PropertyLoyaltyGuests.backToPrograms")}
        </Button>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("PropertyLoyaltyGuests.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {pagination.totalCount !== 1 ? t("PropertyLoyaltyGuests.subtitlePlural", { count: pagination.totalCount }) : t("PropertyLoyaltyGuests.subtitle", { count: pagination.totalCount })}
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
              <p>{t("PropertyLoyaltyGuests.noGuests")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("PropertyLoyaltyGuests.table.guestName")}</TableHead>
                      <TableHead>{t("PropertyLoyaltyGuests.table.email")}</TableHead>
                      <TableHead>{t("PropertyLoyaltyGuests.table.loyaltyFields")}</TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((loyaltyGuest) => (
                      <TableRow key={loyaltyGuest.Customer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {loyaltyGuest.Customer.firstName} {loyaltyGuest.Customer.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {loyaltyGuest.Customer.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="flex justify-center items-center">
                          {loyaltyGuest?.metaData ? (
                            <span
                              onClick={() => openMetadataDialog(loyaltyGuest.metaData)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">{t("PropertyLoyaltyGuests.na")}</span>
                          )}
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




      <AlertDialog open={metadataDialogOpen} onOpenChange={setMetadataDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("PropertyLoyaltyGuests.modal.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("PropertyLoyaltyGuests.modal.desc")}
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
              <p className="text-sm text-muted-foreground">{t("PropertyLoyaltyGuests.modal.noMetadata")}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("PropertyLoyaltyGuests.modal.close")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
