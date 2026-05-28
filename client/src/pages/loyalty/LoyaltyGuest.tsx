import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { User, Mail,Eye } from "lucide-react";
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


  const openMetadataDialog = (metadata: any): void => {
    setSelectedMetadata(metadata);
    setMetadataDialogOpen(true);
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
                      <TableHead>{t('Loyalty.guestLevel')}</TableHead>
                      <TableHead>{t('Loyalty.loyaltyFields')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((row) => (
                      <TableRow key={row.Customer?.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {row.Customer
                                ? `${row.Customer.firstName} ${row.Customer.lastName}`
                                : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {row.Customer?.email || "N/A"}
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
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
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


{/* meta data virw doalog */}
      <AlertDialog
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
      >
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('PropertyLoyalties.loyaltyProgramFields')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('PropertyLoyalties.guestInfo')}
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
                {t('PropertyLoyalties.noMetadata')}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('PropertyLoyalties.close')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
