import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import type { IMasterPaymentIntegration, ICMasterPaymentIntegrationS } from "../types/integration.interface";
import {
  createPaymentIntegrationService,
  getMasterPaymentIntegrationService,
  deletePaymentIntegrationService,
  addPaymentUrlFieldService,
  deletePaymentUrlFieldService,
  addPaymentRequiredFieldService,
  deletePaymentRequiredFieldService,
} from "../services/management.services";

interface PaymentIntegrationsTabProps {
  paymentIntegrations: IMasterPaymentIntegration[];
  setPaymentIntegrations: React.Dispatch<React.SetStateAction<IMasterPaymentIntegration[]>>;
}

export default function PaymentIntegrationsTab({
  paymentIntegrations,
  setPaymentIntegrations,
}: PaymentIntegrationsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddUrlFieldDialogOpen, setIsAddUrlFieldDialogOpen] = useState<boolean>(false);
  const [isAddRequiredFieldDialogOpen, setIsAddRequiredFieldDialogOpen] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IMasterPaymentIntegration | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for creating integration
  const [formData, setFormData] = useState<ICMasterPaymentIntegrationS>({
    name: "",
    urlFileds: [],
    requiredFields: [],
  });

  // Temporary input states for initial creation
  const [urlFieldName, setUrlFieldName] = useState("");
  const [urlFieldUrl, setUrlFieldUrl] = useState("");
  const [requiredFieldName, setRequiredFieldName] = useState("");

  // States for adding fields to existing integration
  const [newUrlFieldName, setNewUrlFieldName] = useState("");
  const [newUrlFieldUrl, setNewUrlFieldUrl] = useState("");
  const [newRequiredFieldName, setNewRequiredFieldName] = useState("");

  const fetchPaymentIntegrations = async () => {
    try {
      const response = await getMasterPaymentIntegrationService();
      if (response.success && response.data) {
        setPaymentIntegrations(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch payment integrations");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      urlFileds: [],
      requiredFields: [],
    });
    setUrlFieldName("");
    setUrlFieldUrl("");
    setRequiredFieldName("");
  };

  const handleAddUrlField = () => {
    if (!urlFieldName.trim() || !urlFieldUrl.trim()) {
      toast.error("Please enter both name and URL for the URL field");
      return;
    }
    setFormData({
      ...formData,
      urlFileds: [...formData.urlFileds, { name: urlFieldName.trim(), url: urlFieldUrl.trim() }],
    });
    setUrlFieldName("");
    setUrlFieldUrl("");
  };

  const handleRemoveUrlField = (index: number) => {
    setFormData({
      ...formData,
      urlFileds: formData.urlFileds.filter((_, i) => i !== index),
    });
  };

  const handleAddRequiredField = () => {
    if (!requiredFieldName.trim()) {
      toast.error("Please enter a field name");
      return;
    }
    setFormData({
      ...formData,
      requiredFields: [...formData.requiredFields, { name: requiredFieldName.trim() }],
    });
    setRequiredFieldName("");
  };

  const handleRemoveRequiredField = (index: number) => {
    setFormData({
      ...formData,
      requiredFields: formData.requiredFields.filter((_, i) => i !== index),
    });
  };

  const handleCreateIntegration = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter integration name");
      return;
    }
    setLoading(true);
    try {
      const response = await createPaymentIntegrationService(formData);
      if (response.success) {
        toast.success("Payment integration created successfully");
        await fetchPaymentIntegrations();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to create payment integration");
      }
    } catch (error) {
      toast.error("Failed to create payment integration");
    } finally {
      setLoading(false);
    }
  };

  const handleViewIntegration = (integration: IMasterPaymentIntegration) => {
    setSelectedIntegration(integration);
    setIsViewDialogOpen(true);
  };

  const handleDeleteIntegration = (id: string, name: string) => {
    setIntegrationToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!integrationToDelete) return;
    try {
      const response = await deletePaymentIntegrationService(integrationToDelete.id);
      if (response.success) {
        toast.success("Payment integration deleted successfully");
        setPaymentIntegrations(paymentIntegrations.filter((item) => item.id !== integrationToDelete.id));
      } else {
        toast.error(response.error || "Failed to delete payment integration");
      }
    } catch (error) {
      toast.error("Failed to delete payment integration");
    } finally {
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    }
  };

  const handleAddUrlFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newUrlFieldName.trim() || !newUrlFieldUrl.trim()) {
      toast.error("Please enter both name and URL");
      return;
    }
    setLoading(true);
    try {
      const response = await addPaymentUrlFieldService({
        name: newUrlFieldName.trim(),
        url: newUrlFieldUrl.trim(),
        masterPaymentIntegrationId: selectedIntegration.id,
      });
      if (response.success) {
        toast.success("URL field added successfully");
        await fetchPaymentIntegrations();
        setNewUrlFieldName("");
        setNewUrlFieldUrl("");
        setIsAddUrlFieldDialogOpen(false);
        // Refresh selected integration
        const updated = (await getMasterPaymentIntegrationService()).data.find((i:any) => i.id === selectedIntegration.id);
        if (updated) setSelectedIntegration(updated);
      } else {
        toast.error(response.error || "Failed to add URL field");
      }
    } catch (error) {
      toast.error("Failed to add URL field");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUrlField = async (fieldId: string) => {
    try {
      const response = await deletePaymentUrlFieldService(fieldId);
      if (response.success) {
        toast.success("URL field deleted successfully");
        await fetchPaymentIntegrations();
        if (selectedIntegration) {
          const updated = (await getMasterPaymentIntegrationService()).data.find((i:any) => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || "Failed to delete URL field");
      }
    } catch (error) {
      toast.error("Failed to delete URL field");
    }
  };

  const handleAddRequiredFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newRequiredFieldName.trim()) {
      toast.error("Please enter field name");
      return;
    }
    setLoading(true);
    try {
      const response = await addPaymentRequiredFieldService({
        name: newRequiredFieldName.trim(),
        masterPaymentIntegrationId: selectedIntegration.id,
      });
      if (response.success) {
        toast.success("Required field added successfully");
        await fetchPaymentIntegrations();
        setNewRequiredFieldName("");
        setIsAddRequiredFieldDialogOpen(false);
        const updated = (await getMasterPaymentIntegrationService()).data.find((i:any) => i.id === selectedIntegration.id);
        if (updated) setSelectedIntegration(updated);
      } else {
        toast.error(response.error || "Failed to add required field");
      }
    } catch (error) {
      toast.error("Failed to add required field");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequiredField = async (fieldId: string) => {
    try {
      const response = await deletePaymentRequiredFieldService(fieldId);
      if (response.success) {
        toast.success("Required field deleted successfully");
        await fetchPaymentIntegrations();
        if (selectedIntegration) {
          const updated = (await getMasterPaymentIntegrationService()).data.find((i:any) => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || "Failed to delete required field");
      }
    } catch (error) {
      toast.error("Failed to delete required field");
    }
  };

  const formatName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Integrations</CardTitle>
            <CardDescription>Manage payment integration providers</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Integration
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL Fields</TableHead>
                <TableHead>Required Fields</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentIntegrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No payment integrations found.
                  </TableCell>
                </TableRow>
              ) : (
                paymentIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">{formatName(integration.name)}</TableCell>
                    <TableCell>
                      <Badge variant={integration.isActive ? "default" : "secondary"}>
                        {integration.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{integration.masterPaymentIntegrationURLFields?.length || 0}</TableCell>
                    <TableCell>{integration.requiredFieldsForMasterPaymentIntegration?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleViewIntegration(integration)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteIntegration(integration.id, integration.name)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="integrationName">Integration Name *</Label>
              <Input
                id="integrationName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Stripe, NGenius, Fikafi"
              />
            </div>
            {/* URL Fields Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">URL Fields</Label>
              <div className="flex gap-2">
                <Input placeholder="Field Name" value={urlFieldName} onChange={(e) => setUrlFieldName(e.target.value)} />
                <Input placeholder="URL" value={urlFieldUrl} onChange={(e) => setUrlFieldUrl(e.target.value)} />
                <Button type="button" onClick={handleAddUrlField} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.urlFileds.map((field, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2">
                    <span className="font-semibold">{field.name}:</span>
                    <span className="text-gray-500 truncate max-w-[150px]">{field.url}</span>
                    <button type="button" onClick={() => handleRemoveUrlField(index)}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
            {/* Required Fields Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Required Fields</Label>
              <div className="flex gap-2">
                <Input placeholder="Field Name (e.g., API Key)" value={requiredFieldName} onChange={(e) => setRequiredFieldName(e.target.value)} />
                <Button type="button" onClick={handleAddRequiredField} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredFields.map((field, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {field.name}
                    <button type="button" onClick={() => handleRemoveRequiredField(index)}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateIntegration} disabled={loading}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formatName(selectedIntegration?.name || "")}</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">URL Fields</Label>
                  <Button size="sm" variant="outline" onClick={() => setIsAddUrlFieldDialogOpen(true)}>Add Field</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedIntegration.masterPaymentIntegrationURLFields?.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.url}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUrlField(field.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Required Fields</Label>
                  <Button size="sm" variant="outline" onClick={() => setIsAddRequiredFieldDialogOpen(true)}>Add Field</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedIntegration.requiredFieldsForMasterPaymentIntegration?.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRequiredField(field.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{integrationToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add URL Field Dialog */}
      <Dialog open={isAddUrlFieldDialogOpen} onOpenChange={setIsAddUrlFieldDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add URL Field</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Field Name</Label>
              <Input value={newUrlFieldName} onChange={(e) => setNewUrlFieldName(e.target.value)} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={newUrlFieldUrl} onChange={(e) => setNewUrlFieldUrl(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUrlFieldDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUrlFieldToIntegration} disabled={loading}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Required Field Dialog */}
      <Dialog open={isAddRequiredFieldDialogOpen} onOpenChange={setIsAddRequiredFieldDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Required Field</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Field Name</Label>
              <Input value={newRequiredFieldName} onChange={(e) => setNewRequiredFieldName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRequiredFieldDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRequiredFieldToIntegration} disabled={loading}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
