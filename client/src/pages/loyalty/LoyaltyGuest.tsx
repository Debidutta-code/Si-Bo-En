import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, User, Mail, Phone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import type { IGetLoyaltyGuestsForCreation } from "./interfaces";
import BackButton from "@/components/shared/BackButton";
import Badge from "./components/Badge";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

  const { creationId } = useParams<{ creationId: string }>();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: t('Loyalty.guestLoading'),
  });
  const [creationLoyaltyId, setCreationLoyaltyId] = useState<string | null>(
    null,
  );
  const [guests, setGuests] = useState<IGetLoyaltyGuestsForCreation[]>([]);
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
  const [metadataDialogOpen, setMetadataDialogOpen] = useState<boolean>(false);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);

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
      toast.error(t('Loyalty.guestNotFound'));
      return;
    }

    setLoader({ isLoading: true, message: t('Loyalty.guestLoading') });
    const response = await getLoyalityByCreationService(creationId);

    if (response.success && response.data) {
      setCreationLoyaltyId(response.data.id);
    } else {
      toast.error(response.message || t('Loyalty.failedToFetchConfig'));
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchLoyaltyGuests = async (
    page: number,
    limit: number = 10,
  ): Promise<void> => {
    if (!creationLoyaltyId) {
      return;
    }

    setLoader({ isLoading: true, message: t('Loyalty.loadingGuests') });
    const skip = (page - 1) * limit;
    const response = await getLoyaltyGuestsForCreationService(
      creationLoyaltyId,
      skip,
      limit,
    );

    if (response.success && response.data) {
      setGuests(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } else {
      toast.error(response.message || t('Loyalty.failedToFetchGuests'));
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

  const openMetadataDialog = (metadata: any): void => {
    setSelectedMetadata(metadata);
    setMetadataDialogOpen(true);
  };

  const handleDeleteGuest = async (): Promise<void> => {
    if (!selectedGuestId) return;

    setLoader({ isLoading: true, message: t('Loyalty.deletingGuest') });
    const response = await deleteLoyaltyGuestService(selectedGuestId);

    if (response.success) {
      toast.success(t('Loyalty.guestDeleted'));
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
      toast.error(response.message || t('Loyalty.failedToDeleteGuest'));
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
      <BackButton />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('Loyalty.loyaltyGuests')}</CardTitle>
          <CardDescription>
            {t('Loyalty.manageGuests')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="rounded-full bg-muted p-4">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('Loyalty.noGuests')}
                </h3>
                
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 mb-4">
                <span className="text-primary text-lg leading-none mt-0.5">
                  ℹ
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                                   {t('Loyalty.guestsNAInfo')}

                </p>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Loyalty.guestName')}</TableHead>
                      <TableHead>{t('Loyalty.email')}</TableHead>
                      <TableHead>{t('Loyalty.phone')}</TableHead>
                      <TableHead>{t('Loyalty.guestLevel')}</TableHead>
                      <TableHead>{t('Loyalty.loyaltyFields')}</TableHead>
                      <TableHead>{t('Loyalty.enrolledOn')}</TableHead>
                      <TableHead className="text-right">{t('Loyalty.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((row) => (
                      <TableRow key={row.LoyalityGuest?.id ?? Math.random()}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {row.LoyalityGuest?.guest
                                ? `${row.LoyalityGuest.guest.firstName} ${row.LoyalityGuest.guest.lastName}`
                                : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {row.LoyalityGuest?.guestEmail || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {(row.LoyalityGuest?.guest &&
                                row.LoyalityGuest.guest.phoneNumber) ||
                                "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-center">

                          <Badge level={row?.guestLevel} />
                        </TableCell>

                        <TableCell className="flex justify-center items-center">
                          {row?.metaData ? (
                            <span
                              onClick={() =>
                                openMetadataDialog(row?.metaData)
                              }
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              {t('Loyalty.view')}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(row.LoyalityGuest?.createdAt ?? new Date())}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              row.LoyalityGuest?.id
                                ? openDeleteDialog(row.LoyalityGuest.id)
                                : undefined
                            }
                            disabled={!row.LoyalityGuest?.id}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Loyalty.deleteGuestConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Loyalty.deleteGuestConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Loyalty.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGuest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('Common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
      >
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Loyalty.loyaltyProgramFields')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Loyalty.guestInfo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {selectedMetadata && typeof selectedMetadata === "object" ? (
              Object.entries(selectedMetadata).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-3 gap-4 items-start border-b pb-3 last:border-b-0"
                >
                  <div className="font-medium text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim().replaceAll("_", " ")}:
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground break-words">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('Loyalty.noMetadata')}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Loyalty.close')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
