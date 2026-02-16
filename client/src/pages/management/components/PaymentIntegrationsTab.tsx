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

interface PaymentIntegrationsTabProps {
  paymentIntegrations: IPaymentIntegration[];
  setPaymentIntegrations: React.Dispatch<React.SetStateAction<IPaymentIntegration[]>>;
}

export default function PaymentIntegrationsTab({ paymentIntegrations, setPaymentIntegrations }: PaymentIntegrationsTabProps) {
  const [isPaymentIntegrationDialogOpen, setIsPaymentIntegrationDialogOpen] = useState<boolean>(false);
  const [paymentIntegrationInput, setPaymentIntegrationInput] = useState("");

  const formatPaymentIntegrationName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCreatePaymentIntegration = async () => {
    if (!paymentIntegrationInput.trim()) {
      toast.error("Please enter a payment integration name");
      return;
    }
    const response = await createPaymentIntegrationService(paymentIntegrationInput);
    if (response.success) {
      toast.success("Payment integration created successfully");
      setPaymentIntegrations([...paymentIntegrations, response.data]);
      setPaymentIntegrationInput("");
      setIsPaymentIntegrationDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create payment integration");
    }
  };

  const handleDeletePaymentIntegration = async (id: string) => {
    const response = await deletePaymentIntegrationService(id);
    if (response.success) {
      toast.success("Payment integration deleted successfully");
      setPaymentIntegrations(paymentIntegrations.filter((integration) => integration.id !== id));
    } else {
      toast.error(response.error || "Failed to delete payment integration");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Integrations</CardTitle>
            <CardDescription>Manage payment integration providers</CardDescription>
          </div>
          <Dialog open={isPaymentIntegrationDialogOpen} onOpenChange={setIsPaymentIntegrationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Integration</DialogTitle>
                <DialogDescription>Add a payment integration provider name</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentIntegrationName">Payment Integration Name</Label>
                  <Input
                    id="paymentIntegrationName"
                    value={paymentIntegrationInput}
                    onChange={(e) => setPaymentIntegrationInput(e.target.value)}
                    placeholder="e.g., Stripe Payment, PayPal Gateway"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreatePaymentIntegration();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPaymentIntegrationDialogOpen(false);
                    setPaymentIntegrationInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePaymentIntegration}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {paymentIntegrations.map((integration) => (
            <Badge key={integration.id} variant="outline" className="text-sm py-2 px-3">
              {formatPaymentIntegrationName(integration.name)}
              <button
                onClick={() => handleDeletePaymentIntegration(integration.id)}
                className="ml-2 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {paymentIntegrations.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              No payment integrations found. Create your first payment integration to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
