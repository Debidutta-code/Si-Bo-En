import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { IMasterPaymentIntegration } from "../types";
import { createPaymentIntegrationService, deletePaymentIntegrationService } from "../services/management.services";

interface PropertyIntegrationsTabProps {
  propertyIntegrations: IMasterPaymentIntegration[];
  setPropertyIntegrations: React.Dispatch<React.SetStateAction<IMasterPaymentIntegration[]>>;
}

export default function PropertyIntegrationsTab({ propertyIntegrations, setPropertyIntegrations }: PropertyIntegrationsTabProps) {
  const [isPropertyIntegrationDialogOpen, setIsPropertyIntegrationDialogOpen] = useState<boolean>(false);
  const [propertyIntegrationInput, setPropertyIntegrationInput] = useState("");

  const formatIntegrationName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCreatePropertyIntegration = async () => {
    if (!propertyIntegrationInput.trim()) {
      toast.error("Please enter a property integration name");
      return;
    }
    const response = await createPaymentIntegrationService({ name: propertyIntegrationInput, urlFileds: [], requiredFields: [] });
    if (response.success) {
      toast.success("Property integration created successfully");
      setPropertyIntegrations([...propertyIntegrations, response.data]);
      setPropertyIntegrationInput("");
      setIsPropertyIntegrationDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create property integration");
    }
  };

  const handleDeletePropertyIntegration = async (id: string) => {
    const response = await deletePaymentIntegrationService(id);
    if (response.success) {
      toast.success("Property integration deleted successfully");
      setPropertyIntegrations(propertyIntegrations.filter((integration) => integration.id !== id));
    } else {
      toast.error(response.error || "Failed to delete property integration");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Property Integrations</CardTitle>
            <CardDescription>Manage property integration providers</CardDescription>
          </div>
          <Dialog open={isPropertyIntegrationDialogOpen} onOpenChange={setIsPropertyIntegrationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Property Integration</DialogTitle>
                <DialogDescription>Add a property integration provider name</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyIntegrationName">Property Integration Name</Label>
                  <Input
                    id="propertyIntegrationName"
                    value={propertyIntegrationInput}
                    onChange={(e) => setPropertyIntegrationInput(e.target.value)}
                    placeholder="e.g., Channel Manager, PMS Integration"
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
                  Cancel
                </Button>
                <Button onClick={handleCreatePropertyIntegration}>Create</Button>
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
              No property integrations found. Create your first property integration to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
