import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import type { IMasterIntegrations, ICMasterIntegrationsS } from "../types/integration.interface";
import {
  createMasterIntegrationService,
  getAllMasterIntegrationsService,
  deleteMasterIntegrationService,
} from "../services/integration.services.ts";

interface MasterIntegrationsTabProps {
  masterIntegrations: IMasterIntegrations[];
  setMasterIntegrations: React.Dispatch<React.SetStateAction<IMasterIntegrations[]>>;
}

export default function MasterIntegrationsTab({
  masterIntegrations,
  setMasterIntegrations,
}: MasterIntegrationsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IMasterIntegrations | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ICMasterIntegrationsS>({
    name: "",
    type: "channel_manager",
    urlFileds: [],
    requiredFields: [],
  });

  // Temporary input states
  const [urlFieldName, setUrlFieldName] = useState("");
  const [urlFieldUrl, setUrlFieldUrl] = useState("");
  const [requiredFieldName, setRequiredFieldName] = useState("");

  useEffect(() => {
    fetchMasterIntegrations();
  }, []);

  const fetchMasterIntegrations = async () => {
    try {
      const response = await getAllMasterIntegrationsService();
      if (response.success && response.data) {
        setMasterIntegrations(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch master integrations");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "channel_manager",
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

    // const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    // if (!urlPattern.test(urlFieldUrl)) {
    //   toast.error("Please enter a valid URL");
    //   return;
    // }

    const duplicate = formData.urlFileds.find(
      (field) => field.name.toLowerCase() === urlFieldName.toLowerCase()
    );
    if (duplicate) {
      toast.error("URL field name already exists");
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

    const duplicate = formData.requiredFields.find(
      (field) => field.name.toLowerCase() === requiredFieldName.toLowerCase()
    );
    if (duplicate) {
      toast.error("Required field name already exists");
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

    if (formData.urlFileds.length === 0) {
      toast.error("Please add at least one URL field");
      return;
    }

    if (formData.requiredFields.length === 0) {
      toast.error("Please add at least one required field");
      return;
    }

    setLoading(true);
    try {
      const response = await createMasterIntegrationService(formData);
      if (response.success) {
        toast.success("Master integration created successfully");
        await fetchMasterIntegrations();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to create master integration");
      }
    } catch (error) {
      toast.error("Failed to create master integration");
    } finally {
      setLoading(false);
    }
  };

  const handleViewIntegration = (integration: IMasterIntegrations) => {
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
      const response = await deleteMasterIntegrationService(integrationToDelete.id);
      if (response.success) {
        toast.success("Master integration deleted successfully");
        setMasterIntegrations(masterIntegrations.filter((item) => item.id !== integrationToDelete.id));
      } else {
        toast.error(response.error || "Failed to delete master integration");
      }
    } catch (error) {
      toast.error("Failed to delete master integration");
    } finally {
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    }
  };

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Master Property Integrations</CardTitle>
            <CardDescription>
              Manage master integration providers (PMS, Channel Managers, etc.)
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Master Integration
            </Button>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Master Integration</DialogTitle>
                <DialogDescription>
                  Add a new master integration provider with URL fields and required fields
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="integrationName">Integration Name *</Label>
                    <Input
                      id="integrationName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Opera PMS, Booking.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="integrationType">Integration Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "pms" | "channel_manager") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pms">PMS (Property Management System)</SelectItem>
                        <SelectItem value="channel_manager">Channel Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* URL Fields Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">URL Fields *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Field Name (e.g., API Endpoint)"
                      value={urlFieldName}
                      onChange={(e) => setUrlFieldName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
                    />
                    <Input
                      placeholder="URL (e.g., https://api.example.com)"
                      value={urlFieldUrl}
                      onChange={(e) => setUrlFieldUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrlField();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddUrlField} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.urlFileds.map((field, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2">
                        <div className="flex flex-col items-start text-xs">
                          <span className="font-semibold">{field.name}</span>
                          <span className="text-gray-500 truncate max-w-[200px]">{field.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUrlField(index)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Required Fields Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Required Fields *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Field Name (e.g., API Key, Hotel ID)"
                      value={requiredFieldName}
                      onChange={(e) => setRequiredFieldName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddRequiredField();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddRequiredField} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requiredFields.map((field, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {field.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredField(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateIntegration} disabled={loading}>
                  {loading ? "Creating..." : "Create Integration"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {formatType(integration.type)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewIntegration(integration)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteIntegration(integration.id, integration.name)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  {integration.requiredFieldsForMasterIntegration?.length || 0} required fields •{" "}
                  {integration.masterIntegrationURLFields?.length || 0} URL fields
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          {masterIntegrations.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No master integrations found. Create your first master integration to get started.
            </div>
          )}
        </div>
      </CardContent>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIntegration?.name}</DialogTitle>
            <DialogDescription>Integration Details</DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-semibold">Type</Label>
                <p className="mt-1">{formatType(selectedIntegration.type)}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Status</Label>
                <div className="mt-1">
                  <Badge variant={selectedIntegration.isActive ? "default" : "secondary"}>
                    {selectedIntegration.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">URL Fields</Label>
                <div className="mt-2 space-y-2">
                  {selectedIntegration.masterIntegrationURLFields?.map((field, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{field.name}</p>
                      <p className="text-xs text-gray-600 break-all">{field.url}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Required Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedIntegration.requiredFieldsForMasterIntegration?.map((field, index) => (
                    <Badge key={index} variant="outline">
                      {field.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-500">Created At</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedIntegration.createdAt).toLocaleString()}
                </p>
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
              Are you sure you want to delete "<span className="font-semibold">{integrationToDelete?.name}</span>"?
              This action cannot be undone.
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
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
