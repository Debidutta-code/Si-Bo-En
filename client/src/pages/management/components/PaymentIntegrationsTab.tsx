import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { IPaymentIntegration } from "../types";
import { createPaymentIntegrationService, deletePaymentIntegrationService } from "../services/management.services";
import { useTranslation } from "react-i18next";

interface PaymentIntegrationsTabProps {
  paymentIntegrations: IPaymentIntegration[];
  setPaymentIntegrations: React.Dispatch<React.SetStateAction<IPaymentIntegration[]>>;
}

export default function PaymentIntegrationsTab({ paymentIntegrations, setPaymentIntegrations }: PaymentIntegrationsTabProps) {
  const [isPaymentIntegrationDialogOpen, setIsPaymentIntegrationDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<IPaymentIntegration | null>(null);
  const [paymentIntegrationInput, setPaymentIntegrationInput] = useState("");
  const { t } = useTranslation();

  const handleAddPaymentIntegration = async () => {
    if (!paymentIntegrationInput.trim()) return;

    if (paymentIntegrations.some((integration) => integration.name === paymentIntegrationInput.trim())) {
      toast.error(t("Toast.amenityAlreadyInList", { ns: "translation", defaultValue: "Field already in list" }));
      return;
    }

    const response = await createPaymentIntegrationService(paymentIntegrationInput.trim());
    if (response.success) {
      toast.success(t("Toast.paymentIntegrationCreatedSuccessfully", { ns: "translation" }));
      setPaymentIntegrations([...response.data]);
      setPaymentIntegrationInput("");
      setIsPaymentIntegrationDialogOpen(false);
    } else {
      toast.error(response.error || t("Toast.failedToCreatePaymentIntegration", { ns: "translation" }));
    }
  };

  const handleDeleteClick = (integration: IPaymentIntegration) => {
    setIntegrationToDelete(integration);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return;
    const response = await deletePaymentIntegrationService(integrationToDelete.id);
    if (response.success) {
      toast.success(t("Toast.fieldDeletedSuccessfully", { ns: "translation", defaultValue: "Integration deleted successfully" }));
      setPaymentIntegrations(paymentIntegrations.filter((integration) => integration.id !== integrationToDelete.id));
    } else {
      toast.error(response.error || t("Toast.failedToDeleteField", { ns: "translation", defaultValue: "Failed to delete integration" }));
    }
    setIsDeleteDialogOpen(false);
    setIntegrationToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("Management.paymentIntegrationsTitle")}</CardTitle>
            <CardDescription>{t("Management.managePaymentIntegrations")}</CardDescription>
          </div>
          <Dialog open={isPaymentIntegrationDialogOpen} onOpenChange={setIsPaymentIntegrationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("Management.addPaymentIntegration")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Management.addPaymentIntegrationTitle")}</DialogTitle>
                <DialogDescription>{t("Management.addPaymentIntegrationDescription")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="integrationName">{t("Management.paymentIntegrationName")}</Label>
                  <Input
                    id="integrationName"
                    value={paymentIntegrationInput}
                    onChange={(e) => setPaymentIntegrationInput(e.target.value)}
                    placeholder="e.g., Stripe, PayPal, Razorpay"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPaymentIntegration();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentIntegrationDialogOpen(false)}>
                  {t("Common.cancel", { ns: "translation" })}
                </Button>
                <Button onClick={handleAddPaymentIntegration}>{t("Management.addPaymentIntegration")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          {paymentIntegrations.map((integration) => (
            <Badge key={integration.id} variant="outline" className="text-sm py-2 px-3 flex items-center gap-2">
              {integration.name}
              <button
                onClick={() => handleDeleteClick(integration)}
                className="hover:text-red-500 ml-1 transition-colors"
                title={t("Common.delete", { ns: "translation" })}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {paymentIntegrations.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              {t("Management.noPaymentIntegrationsFound")}
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Management.deletePaymentIntegrationTitle")}</DialogTitle>
            <DialogDescription>
              {t("Management.deletePaymentIntegrationDescription", {
                name: integrationToDelete?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setIntegrationToDelete(null);
              }}
            >
              {t("Common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t("Management.deletePaymentIntegrationBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}