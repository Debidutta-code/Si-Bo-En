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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.error(t('Management.toast.failedToFetchMasterIntegrations'));
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
      toast.error(t('Management.toast.pleaseEnterBothNameAndURL'));
      return;
    }

    const duplicate = formData.urlFileds.find(
      (field) => field.name.toLowerCase() === urlFieldName.toLowerCase()
    );
    if (duplicate) {
      toast.error(t('Management.toast.urlFieldNameAlreadyExists'));
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
      toast.error(t('Management.toast.pleaseEnterFieldName'));
      return;
    }

    const duplicate = formData.requiredFields.find(
      (field) => field.name.toLowerCase() === requiredFieldName.toLowerCase()
    );
    if (duplicate) {
      toast.error(t('Management.toast.requiredFieldNameAlreadyExists'));
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
      toast.error(t('Management.toast.pleaseEnterIntegrationName'));
      return;
    }

    if (formData.urlFileds.length === 0) {
      toast.error(t('Management.toast.pleaseAddAtLeastOneURLField'));
      return;
    }

    if (formData.requiredFields.length === 0) {
      toast.error(t('Management.toast.pleaseAddAtLeastOneRequiredField'));
      return;
    }

    setLoading(true);
    try {
      const response = await createMasterIntegrationService(formData);
      if (response.success) {
        toast.success(t('Management.toast.masterIntegrationCreatedSuccessfully'));
        await fetchMasterIntegrations();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.error || t('Management.toast.failedToFetchMasterIntegrations'));
      }
    } catch (error) {
      toast.error(t('Management.toast.failedToFetchMasterIntegrations'));
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
        toast.success(t('Management.toast.masterIntegrationDeletedSuccessfully'));
        setMasterIntegrations(masterIntegrations.filter((item) => item.id !== integrationToDelete.id));
      } else {
        toast.error(response.error || t('Management.toast.masterIntegrationDeletedSuccessfully'));
      }
    } catch (error) {
      toast.error(t('Management.toast.masterIntegrationDeletedSuccessfully'));
    } finally {
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    }
  };

  // Add URL Field to existing integration
  const handleAddUrlFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newUrlFieldName.trim() || !newUrlFieldUrl.trim()) {
      toast.error(t('Management.toast.pleaseEnterBothNameAndURLShort'));
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
        toast.success(t('Management.toast.urlFieldAddedSuccessfully'));
        await fetchMasterIntegrations();
        setNewUrlFieldName("");
        setNewUrlFieldUrl("");
        setIsAddUrlFieldDialogOpen(false);
        // Refresh selected integration
        const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
        if (updated) setSelectedIntegration(updated);
      } else {
        toast.error(response.error || t('Management.toast.urlFieldAddedSuccessfully'));
      }
    } catch (error) {
      toast.error(t('Management.toast.urlFieldAddedSuccessfully'));
    } finally {
      setLoading(false);
    }
  };

  // Delete URL Field from integration
  const handleDeleteUrlField = async (fieldId: string) => {
    try {
      const response = await deleteUrlFieldService(fieldId);
      if (response.success) {
        toast.success(t('Management.toast.urlFieldDeletedSuccessfully'));
        await fetchMasterIntegrations();
        // Refresh selected integration if viewing
        if (selectedIntegration) {
          const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || t('Management.toast.urlFieldDeletedSuccessfully'));
      }
    } catch (error) {
      toast.error(t('Management.toast.urlFieldDeletedSuccessfully'));
    }
  };

  // Add Required Field to existing integration
  const handleAddRequiredFieldToIntegration = async () => {
    if (!selectedIntegration) return;
    if (!newRequiredFieldName.trim()) {
      toast.error(t('Management.toast.pleaseEnterFieldNameShort'));
      return;
    }

    setLoading(true);
    try {
      const response = await addRequiredFieldService({
        name: newRequiredFieldName.trim(),
        masterIntegrationId: selectedIntegration.id,
      });
      if (response.success) {
        toast.success(t('Management.toast.requiredFieldAddedSuccessfully'));
        await fetchMasterIntegrations();
        setNewRequiredFieldName("");
        setIsAddRequiredFieldDialogOpen(false);
        // Refresh selected integration
        const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
        if (updated) setSelectedIntegration(updated);
      } else {
        toast.error(response.error || t('Management.toast.requiredFieldAddedSuccessfully'));
      }
    } catch (error) {
      toast.error(t('Management.toast.requiredFieldAddedSuccessfully'));
    } finally {
      setLoading(false);
    }
  };

  // Delete Required Field from integration
  const handleDeleteRequiredField = async (fieldId: string) => {
    try {
      const response = await deleteRequiredFieldService(fieldId);
      if (response.success) {
        toast.success(t('Management.toast.requiredFieldDeletedSuccessfully'));
        await fetchMasterIntegrations();
        // Refresh selected integration if viewing
        if (selectedIntegration) {
          const updated = masterIntegrations.find(i => i.id === selectedIntegration.id);
          if (updated) setSelectedIntegration(updated);
        }
      } else {
        toast.error(response.error || t('Management.toast.requiredFieldDeletedSuccessfully'));
      }
    } catch (error) {
      toast.error(t('Management.toast.requiredFieldDeletedSuccessfully'));
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
            <CardTitle>{t('Management.masterIntegrationsTitle')}</CardTitle>
            <CardDescription>
              {t('Management.manageMasterIntegrations')}
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
                <TableHead>{t('Management.name')}</TableHead>
                <TableHead>{t('Management.type')}</TableHead>
                <TableHead>{t('Management.status')}</TableHead>
                <TableHead>{t('Management.urlFields')}</TableHead>
                <TableHead>{t('Management.requiredFields')}</TableHead>
                <TableHead>{t('Management.createdAt')}</TableHead>
                <TableHead className="text-right">{t('Management.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterIntegrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No master integrations found. {t('Management.noMasterIntegrationsFound')}
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
                        {integration.isActive ? t('Management.active') : t('Management.inactive')}
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
                          title={t('Management.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("Common.addTranslation")}
                          onClick={() => { setTranslationEntityId(integration.id); setAddTranslationOpen(true); }}
                        >
                          <Plus className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("Common.checkTranslation")}
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
            <DialogTitle>{t('Management.createMasterIntegrationTitle')}</DialogTitle>
             <DialogDescription>
              {t('Management.createMasterIntegrationDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="integrationName">{t('Management.integrationNameFieldLabel')} *</Label>
                <Input
                  id="integrationName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('Management.integrationNamePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="integrationType">{t('Management.integrationType')} *</Label>
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
              <Label className="text-base font-semibold">{t('Management.urlFields')} *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Management.urlFieldNamePlaceholder')}
                  value={urlFieldName}
                  onChange={(e) => setUrlFieldName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
                />
                <Input
                  placeholder={t('Management.urlPlaceholder')}
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
                  {t('Management.add')}
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
              <Label className="text-base font-semibold">{t('Management.requiredFields')} *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Management.requiredFieldNamePlaceholder')}
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
                  {t('Management.add')}
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
              {t('Management.cancel')}
            </Button>
            <Button onClick={handleCreateIntegration} disabled={loading}>
              {loading ? t('Management.creating') : t('Management.createMasterIntegrationTitle')}
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
                {selectedIntegration?.isActive ? t('Management.active') : t('Management.inactive')}
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
                  <Label className="text-base font-semibold">{t('Management.urlFields')}</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAddUrlFieldDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('Management.addURLField')}
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('Management.fieldName')}</TableHead>
                        <TableHead>{t('Management.url')}</TableHead>
                        <TableHead className="text-right">{t('Management.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedIntegration.masterIntegrationURLFields?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            {t('Management.noURLFieldsYet')}
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
                  <Label className="text-base font-semibold">{t('Management.requiredFields')}</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsAddRequiredFieldDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('Management.addRequiredField')}
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('Management.fieldName')}</TableHead>
                        <TableHead className="text-right">{t('Management.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedIntegration.requiredFieldsForMasterIntegration?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                            {t('Management.noRequiredFieldsYet')}
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
                {t('Management.created')}: {new Date(selectedIntegration.createdAt).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t('Management.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Management.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('Management.confirmDeleteIntegrationDescription', { name: integrationToDelete?.name })}
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
              {t('Management.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('Management.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add URL Field Dialog */}
      <Dialog open={isAddUrlFieldDialogOpen} onOpenChange={setIsAddUrlFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Management.addURLField')}</DialogTitle>
            <DialogDescription>
              {t('Management.addURLFieldDialogDescription', { name: selectedIntegration?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="urlFieldName">{t('Management.fieldName')} *</Label>
              <Input
                id="urlFieldName"
                value={newUrlFieldName}
                onChange={(e) => setNewUrlFieldName(e.target.value)}
                placeholder={t('Management.apiEndpointPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="urlFieldUrl">{t('Management.url')} *</Label>
              <Input
                id="urlFieldUrl"
                value={newUrlFieldUrl}
                onChange={(e) => setNewUrlFieldUrl(e.target.value)}
                placeholder={t('Management.apiUrlPlaceholder')}
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
              {t('Management.cancel')}
            </Button>
            <Button onClick={handleAddUrlFieldToIntegration} disabled={loading}>
              {loading ? t('Management.adding') : t('Management.addURLField')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Required Field Dialog */}
      <Dialog open={isAddRequiredFieldDialogOpen} onOpenChange={setIsAddRequiredFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Management.addRequiredField')}</DialogTitle>
            <DialogDescription>
              {t('Management.addRequiredFieldDialogDescription', { name: selectedIntegration?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="requiredFieldName">{t('Management.fieldName')} *</Label>
              <Input
                id="requiredFieldName"
                value={newRequiredFieldName}
                onChange={(e) => setNewRequiredFieldName(e.target.value)}
                placeholder={t('Management.apiKeyPlaceholder')}
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
              {t('Management.cancel')}
            </Button>
            <Button onClick={handleAddRequiredFieldToIntegration} disabled={loading}>
              {loading ? t('Management.adding') : t('Management.addRequiredField')}
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
            title={t('Management.addIntegrationTranslationTitle')}
            fields={[{ key: "name", label: t('Management.integrationNameFieldLabel'), placeholder: t('Management.integrationNameFieldPlaceholder') }]}
            onSave={async (id, locale, data) => {
              return await upsertMasterIntegrationTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={t('Management.integrationTranslationsTitle')}
            displayFields={[{ key: "name", label: t('Management.name') }]}
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
            title={t('Management.editIntegrationTranslationTitle')}
            fields={[{ key: "name", label: t('Management.integrationNameFieldLabel'), placeholder: t('Management.integrationNameFieldPlaceholder') }]}
            onSave={async (id, locale, data) => upsertMasterIntegrationTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
