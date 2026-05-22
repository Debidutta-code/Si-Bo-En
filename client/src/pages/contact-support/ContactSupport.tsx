import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { ITicket } from "./interfaces";
import { TicketsTable, CreateTicketDialog } from "./components";
import { getAllTicketsService } from "./services";
import Loader from "@/components/Loader/Loader";
import type { ILoader, IPropertyCodeAndIds } from "../dashboard/interface";
import { fetchPropertiesService } from "../dashboard/services";
import { useTranslation } from "react-i18next";

export default function ContactSupport() {
    const { t } = useTranslation('ContactSupport');

  const user = useSelector((state: RootState) => state.user.user);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<ILoader>({
    isLoading: false,
    message: "",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [allProperties, setAllProperties] = useState<IPropertyCodeAndIds[]>([])
const fetchProperties = async () => {
    try {
      setIsLoadingTickets({ isLoading: true, message: "Fetching Property Names ..." });

      const response = await fetchPropertiesService();

      if (response.success ) {
        setAllProperties(response.data);
      } else {
        toast.error(response.message || "Failed to fetch analytics");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoadingTickets({ isLoading: false, message: "" });
    }
  }
  const fetchTickets = async () => {
    setIsLoadingTickets({ isLoading: true, message: "Loading tickets..." });
    try {
      const response = await getAllTicketsService();
      if (response.success) {
        setTickets(response.data || []);
      } else {
        toast.error(response.message );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message );
    } finally {
      setIsLoadingTickets({ isLoading: false, message: "" });
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProperties();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Tickets Table - Display First */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('yourSupportTickets')}</CardTitle>
              <CardDescription>
                {t('viewAndManageTickets')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTickets}
                disabled={isLoadingTickets.isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingTickets.isLoading ? "animate-spin" : ""}`} />
                {t('refresh')}
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('createIssue')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTickets.isLoading ? (
            <Loader text={isLoadingTickets.message} />
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('noSupportTicketsYet')}</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createYourFirstTicket')}
              </Button>
            </div>
          ) : (
            <TicketsTable
              tickets={tickets}
              userRole={user?.role || ""}
              onRefresh={fetchTickets}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchTickets}
        properties={allProperties}
      />
    </div>
  );
}
