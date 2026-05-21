import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, ExternalLink, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import type { IMasterIntegrations, ICMasterIntegrationsS } from "../types/integration.interface";
import {
  createMasterIntegrationService,
  getAllMasterIntegrationsService,
  deleteMasterIntegrationService,
  addUrlFieldService,
  deleteUrlFieldService,
  addRequiredFieldService,
  deleteRequiredFieldService,
} from "../services/integration.services.ts";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterIntegrationTranslationService,
  getAllMasterIntegrationTranslationsService,
  deleteMasterIntegrationTranslationLocaleService,
} from "../services/multilanguage.services";

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
  const [isAddUrlFieldDialogOpen, setIsAddUrlFieldDialogOpen] = useState<boolean>(false);
  const [isAddRequiredFieldDialogOpen, setIsAddRequiredFieldDialogOpen] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IMasterIntegrations | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  // Form state for creating integration
  const [formData, setFormData] = useState<ICMasterIntegrationsS>({
    name: "",
    type: "channel_manager",
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

  // Add URL Field to existing integration
  const handleAddUrlFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newUrlFieldName.trim() || !newUrlFieldUrl.trim()) {
      toast.error("Please enter both name and URL");
      return;
    }

    setLoading(true);
    try {
      const response = await addUrlFieldService({
        name: newUrlFieldName.trim(),
        url: newUrlFieldUrl.trim(),
        masterIntegrationId: selectedIntegration.id,
      });
      if (response.success) {
        toast.success("URL field added successfully");
        await fetchMasterIntegrations();
        setNewUrlFieldName("");
        setNewUrlFieldUrl("");
        setIsAddUrlFieldDialogOpen(false);
        // Refresh selected integration
        const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
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

  // Delete URL Field from integration
  const handleDeleteUrlField = async (fieldId: string) => {
    try {
      const response = await deleteUrlFieldService(fieldId);
      if (response.success) {
        toast.success("URL field deleted successfully");
        await fetchMasterIntegrations();
        // Refresh selected integration if viewing
        if (selectedIntegration) {
          const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || "Failed to delete URL field");
      }
    } catch (error) {
      toast.error("Failed to delete URL field");
    }
  };

  // Add Required Field to existing integration
  const handleAddRequiredFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newRequiredFieldName.trim()) {
      toast.error("Please enter field name");
      return;
    }

    setLoading(true);
    try {
      const response = await addRequiredFieldService({
        name: newRequiredFieldName.trim(),
        masterIntegrationId: selectedIntegration.id,
      });
      if (response.success) {
        toast.success("Required field added successfully");
        await fetchMasterIntegrations();
        setNewRequiredFieldName("");
        setIsAddRequiredFieldDialogOpen(false);
        // Refresh selected integration
        const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
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

  // Delete Required Field from integration
  const handleDeleteRequiredField = async (fieldId: string) => {
    try {
      const response = await deleteRequiredFieldService(fieldId);
      if (response.success) {
        toast.success("Required field deleted successfully");
        await fetchMasterIntegrations();
        // Refresh selected integration if viewing
        if (selectedIntegration) {
          const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || "Failed to delete required field");
      }
    } catch (error) {
      toast.error("Failed to delete required field");
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Master Integration
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL Fields</TableHead>
                <TableHead>Required Fields</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterIntegrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No master integrations found. Create your first master integration to get started.
                  </TableCell>
                </TableRow>
              ) : (
                masterIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">{integration._translations?.name ?? integration.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatType(integration.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={integration.isActive ? "default" : "secondary"}>
                        {integration.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{integration.masterIntegrationURLFields?.length || 0}</TableCell>
                    <TableCell>{integration.requiredFieldsForMasterIntegration?.length || 0}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(integration.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
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
                          title="Add Translation"
                          onClick={() => { setTranslationEntityId(integration.id); setAddTranslationOpen(true); }}
                        >
                          <Plus className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Check Translations"
                          onClick={() => { setTranslationEntityId(integration.id); setCheckTranslationsOpen(true); }}
                        >
                          <Languages className="h-4 w-4 text-green-600" />
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration?.name}
              <Badge variant={selectedIntegration?.isActive ? "default" : "secondary"}>
                {selectedIntegration?.isActive ? "Active" : "Inactive"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration && formatType(selectedIntegration.type)} Integration
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-6">
              {/* URL Fields Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">URL Fields</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAddUrlFieldDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add URL Field
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedIntegration.masterIntegrationURLFields?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            No URL fields added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedIntegration.masterIntegrationURLFields?.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 truncate max-w-md">{field.url}</span>
                                <a href={field.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 text-blue-500" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUrlField(field.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Required Fields Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">Required Fields</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAddRequiredFieldDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Required Field
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedIntegration.requiredFieldsForMasterIntegration?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                            No required fields added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedIntegration.requiredFieldsForMasterIntegration?.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRequiredField(field.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Created: {new Date(selectedIntegration.createdAt).toLocaleString()}
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
              This action cannot be undone and will also delete all associated URL fields and required fields.
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

      {/* Add URL Field Dialog */}
      <Dialog open={isAddUrlFieldDialogOpen} onOpenChange={setIsAddUrlFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add URL Field</DialogTitle>
            <DialogDescription>
              Add a new URL field to {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="urlFieldName">Field Name *</Label>
              <Input
                id="urlFieldName"
                value={newUrlFieldName}
                onChange={(e) => setNewUrlFieldName(e.target.value)}
                placeholder="e.g., API Endpoint"
              />
            </div>
            <div>
              <Label htmlFor="urlFieldUrl">URL *</Label>
              <Input
                id="urlFieldUrl"
                value={newUrlFieldUrl}
                onChange={(e) => setNewUrlFieldUrl(e.target.value)}
                placeholder="e.g., https://api.example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddUrlFieldDialogOpen(false);
                setNewUrlFieldName("");
                setNewUrlFieldUrl("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUrlFieldToIntegration} disabled={loading}>
              {loading ? "Adding..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Required Field Dialog */}
      <Dialog open={isAddRequiredFieldDialogOpen} onOpenChange={setIsAddRequiredFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Required Field</DialogTitle>
            <DialogDescription>
              Add a new required field to {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="requiredFieldName">Field Name *</Label>
              <Input
                id="requiredFieldName"
                value={newRequiredFieldName}
                onChange={(e) => setNewRequiredFieldName(e.target.value)}
                placeholder="e.g., API Key, Hotel ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddRequiredFieldDialogOpen(false);
                setNewRequiredFieldName("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddRequiredFieldToIntegration} disabled={loading}>
              {loading ? "Adding..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title="Add Integration Translation"
            fields={[{ key: "name", label: "Integration Name", placeholder: "e.g., Opera PMS" }]}
            onSave={async (id, locale, data) => {
              return await upsertMasterIntegrationTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Integration Translations"
            displayFields={[{ key: "name", label: "Name" }]}
            onFetch={getAllMasterIntegrationTranslationsService}
            onDelete={deleteMasterIntegrationTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title="Edit Integration Translation"
            fields={[{ key: "name", label: "Integration Name", placeholder: "e.g., Opera PMS" }]}
            onSave={async (id, locale, data) => upsertMasterIntegrationTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
