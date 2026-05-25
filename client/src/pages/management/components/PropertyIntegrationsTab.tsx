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

interface PropertyIntegrationsTabProps {
  propertyIntegrations: IPaymentIntegration[];
  setPropertyIntegrations: React.Dispatch<React.SetStateAction<IPaymentIntegration[]>>;
}

export default function PropertyIntegrationsTab({ propertyIntegrations, setPropertyIntegrations }: PropertyIntegrationsTabProps) {
  const [isPropertyIntegrationDialogOpen, setIsPropertyIntegrationDialogOpen] = useState<boolean>(false);
  const [propertyIntegrationInput, setPropertyIntegrationInput] = useState("");
  const { t } = useTranslation();
  const formatIntegrationName = (name: string) => {
    return name
      .split('Management._')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCreatePropertyIntegration = async () => {
    if (!propertyIntegrationInput.trim()) {
      toast.error(t('Management.toast.pleaseEnterPropertyIntegrationName'));
      return;
    }
    const response = await createPaymentIntegrationService(propertyIntegrationInput);
    if (response.success) {
      toast.success(t('Management.toast.propertyIntegrationCreatedSuccessfully'));
      setPropertyIntegrations([...propertyIntegrations, response.data]);
      setPropertyIntegrationInput("");
      setIsPropertyIntegrationDialogOpen(false);
    } else {
      toast.error(response.error || t('Management.toast.pleaseEnterPropertyIntegrationName'));
    }
  };

  const handleDeletePropertyIntegration = async (id: string) => {
    const response = await deletePaymentIntegrationService(id);
    if (response.success) {
      toast.success(t('Management.toast.propertyIntegrationDeletedSuccessfully'));
      setPropertyIntegrations(propertyIntegrations.filter((integration) => integration.id !== id));
    } else {
      toast.error(response.error || t('Management.toast.propertyIntegrationDeletedSuccessfully'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("Management.masterIntegrationsTitle")}</CardTitle>
            <CardDescription>{t("Management.manageMasterIntegrations")}</CardDescription>
          </div>
          <Dialog open={isPropertyIntegrationDialogOpen} onOpenChange={setIsPropertyIntegrationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("Management.addPropertyIntegration")}  
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Management.addPropertyIntegration')}</DialogTitle>
                <DialogDescription>{t('Management.propertyIntegrationDialogDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyIntegrationName">{t('Management.propertyIntegrationNameLabel')}</Label>
                  <Input
                    id="propertyIntegrationName"
                    value={propertyIntegrationInput}
                    onChange={(e) => setPropertyIntegrationInput(e.target.value)}
                    placeholder={t('Management.propertyIntegrationNamePlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreatePropertyIntegration();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPropertyIntegrationDialogOpen(false);
                    setPropertyIntegrationInput("");
                  }}
                >
                  {t('Management.cancel')}
                </Button>
                <Button onClick={handleCreatePropertyIntegration}>{t('Management.create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {propertyIntegrations.map((integration) => (
            <Badge key={integration.id} variant="outline" className="text-sm py-2 px-3">
              {formatIntegrationName(integration.name)}
              <button
                onClick={() => handleDeletePropertyIntegration(integration.id)}
                className="ml-2 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {propertyIntegrations.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              {t('Management.noPropertyIntegrationsFound')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
