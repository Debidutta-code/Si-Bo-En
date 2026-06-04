import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CreateRatePlan, RatePlan, LoaderProps } from "./interfaces"
import BackButton from "@/components/shared/BackButton";
import Loader from "@/components/Loader/Loader";
import { createRatePlanService, fetchRatePlansService, removeRatePlanService, updateRatePlanService } from "./services";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Plus, Package, Globe } from "lucide-react"; // ✅ ADDED Globe
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RatePlanRulesDialog from "./components/ratePlanRuleForm";
import ManageRateWithAddonsForm from "./components/ManageRateWithAddonsForm"; // ✅ ADDED
import AddRatePlanLanguageDialog from "./components/AddRatePlanLanguageDialog";
import CheckRatePlanLanguagesDialog from "./components/CheckRatePlanLanguagesDialog";
import { EditTranslationDialog } from "@/pages/management/components/multilang/ManagementTranslationDialogs";
import { upsertRatePlanTranslationService } from "./services/ratePlan-language.service";
// import { usePropertyContext } from '@/contexts/PropertyContext';

export default function RatePlan() {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [allRatePlans, setAllRatePlans] = useState<RatePlan[]>([]);
  const [newRatePlan, setNewRatePlan] = useState<CreateRatePlan>(
    {
      ratePlanName: "",
      b2bAvailable: false,
      b2cAvailable: true,
      roomOnlyVisible: true
    });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });
  // const [editRatePlanData, setEditRatePlanData] = useState<CreateRatePlan>({
  //   ratePlanName: "",
  //   b2bAvailable: false,
  //   b2cAvailable: true,
  //   roomOnlyVisible: true
  // });
  const [rulesDialog, setRulesDialog] = useState<{
    open: boolean;
    ratePlan: RatePlan | null
  }>({
    open: false,
    ratePlan: null,
  });

  // ✅ ADDED: State for managing addons dialog
  const [addonsDialog, setAddonsDialog] = useState<{
    open: boolean;
    ratePlan: RatePlan | null
  }>({
    open: false,
    ratePlan: null,
  });

  const [addLanguageDialog, setAddLanguageDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });

  const [checkLanguagesDialog, setCheckLanguagesDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });

  const [editLanguageDialog, setEditLanguageDialog] = useState<{
    open: boolean;
    ratePlanId: string | null;
    locale: string;
    data: Record<string, any>;
  }>({ open: false, ratePlanId: null, locale: "", data: {} });

  const [loader, setLoader] = useState<LoaderProps>({ isLoading: false, text: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ratePlan: RatePlan | null }>({
    open: false,
    ratePlan: null,
  });

  useEffect(() => {
    fetchRatePlans();
  }, [propertyId]);

  const fetchRatePlans = async () => {
    if (!propertyId) {
      toast.error(t("RatePlanManagement.toast.propertyIdMissing"));
      return;
    }
    try {
      setLoader({ isLoading: true, text: t("RatePlanManagement.fetchingRatePlans") });
      const ratePlans = await fetchRatePlansService(propertyId);
      if (ratePlans.success) {
        // toast.success(ratePlans.message || "Rate Plans fetched successfully");
        setAllRatePlans(ratePlans.data || []);
      } else {
        toast.error(ratePlans.message || t("RatePlanManagement.failedToFetchRatePlans"));
      }
    } catch (error) {
      toast.error(t("RatePlanManagement.failedToFetch"));
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  };

  const createRatePlan = async () => {
    if (!propertyId) {
      toast.error(t("RatePlanManagement.toast.propertyIdMissing"));
      return;
    }
    if (!newRatePlan.ratePlanName.trim()) {
      toast.error(t("RatePlanManagement.toast.ratePlanNameRequired"));
      return;
    }
    try {
      setLoader({ isLoading: true, text: t("RatePlanManagement.creatingRatePlan") });
      const response = await createRatePlanService(propertyId, newRatePlan);
      if (response.success) {
        toast.success(response.message || t("RatePlanManagement.ratePlanCreatedSuccess"));
        setNewRatePlan({ ratePlanName: "", b2bAvailable: false, b2cAvailable: true, roomOnlyVisible: true });
        setCreateDialogOpen(false);
        fetchRatePlans();
      } else {
        toast.error(response.message || t("RatePlanManagement.failedToCreateRatePlan"));
      }
    } catch (error) {
      toast.error(t("RatePlanManagement.failedToCreate"));
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  }

  const deleteRatePlan = async (ratePlanCode: string) => {
    if (!propertyId) {
      toast.error(t("RatePlanManagement.toast.propertyIdMissing"));
      return;
    }
    try {
      setLoader({ isLoading: true, text: t("RatePlanManagement.deletingRatePlan") });
      const response = await removeRatePlanService(ratePlanCode);
      if (response.success) {
        toast.success(response.message || t("RatePlanManagement.ratePlanDeletedSuccess"));
        fetchRatePlans();
      } else {
        toast.error(response.message || t("RatePlanManagement.failedToDeleteRatePlan"));
      }
    } catch (error) {
      toast.error(t("RatePlanManagement.failedToDelete"));
    } finally {
      setLoader({ isLoading: false, text: "" });
      setDeleteDialog({ open: false, ratePlan: null });
    }
  }

  const handleDeleteClick = (ratePlan: RatePlan) => {
    setDeleteDialog({ open: true, ratePlan });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.ratePlan) {
      deleteRatePlan(deleteDialog.ratePlan.ratePlanCode);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, ratePlan: null });
  };

  const handleEdit = (ratePlan: RatePlan) => {
    setEditDialog({ open: true, ratePlan });
    setNewRatePlan({
      ratePlanName: ratePlan.ratePlanName,
      b2bAvailable: ratePlan.b2bAvailable,
      b2cAvailable: ratePlan.b2cAvailable,
      roomOnlyVisible: ratePlan.roomOnlyVisible
    });
  };

  const handleUpdateRatePlan = async () => {
    if (!editDialog.ratePlan) return;

    if (!newRatePlan.ratePlanName.trim()) {
      toast.error(t("RatePlanManagement.toast.ratePlanNameRequired"));
      return;
    }

    try {
      setLoader({ isLoading: true, text: t("RatePlanManagement.updatingRatePlan") });
      const response = await updateRatePlanService(
        editDialog.ratePlan.ratePlanCode,
        newRatePlan
      );

      if (response.success) {
        toast.success(response.message || t("RatePlanManagement.ratePlanUpdatedSuccess"));
        setEditDialog({ open: false, ratePlan: null });
        setNewRatePlan({
          ratePlanName: "",
          b2bAvailable: false,
          b2cAvailable: true,
          roomOnlyVisible: true
        });
        fetchRatePlans();
      } else {
        toast.error(response.message || t("RatePlanManagement.failedToUpdateRatePlan"));
      }
    } catch (error) {
      toast.error(t("RatePlanManagement.failedToUpdate"));
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  };

  const handleCancelEdit = () => {
    setEditDialog({ open: false, ratePlan: null });
    setNewRatePlan({
      ratePlanName: "",
      b2bAvailable: false,
      b2cAvailable: true,
      roomOnlyVisible: true
    });
  };

  const handleAddRulesClick = (ratePlan: RatePlan) => {
    setRulesDialog({ open: true, ratePlan });
  };

  const handleRulesSuccess = () => {
    fetchRatePlans();
    setRulesDialog({ open: false, ratePlan: null });
  };

  // ✅ ADDED: Handler for managing addons
  const handleManageAddonsClick = (ratePlan: RatePlan) => {
    setAddonsDialog({ open: true, ratePlan });
  };

  const handleAddLanguageClick = (ratePlan: RatePlan) => {
    setAddLanguageDialog({ open: true, ratePlan });
  };

  const handleCheckLanguagesClick = (ratePlan: RatePlan) => {
    setCheckLanguagesDialog({ open: true, ratePlan });
  };

  if (loader.isLoading) {
    return (
      <div className='min-h-screen w-full flex justify-center items-center'>
        <Loader text={loader.text} />
      </div>
    )
  }

  // const { languages } = usePropertyContext();

  return (
    <>
      <div className="container mx-auto px-6 max-w-7xl">
        <BackButton />

        <div className="mt-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("RatePlanManagement.title")}</h1>
            <p className="text-gray-600 mt-1 text-sm">{t("RatePlanManagement.subtitle")}</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t("RatePlanManagement.createRatePlan")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("RatePlanManagement.createNewRatePlan")}</DialogTitle>
                <DialogDescription>
                  {t("RatePlanManagement.policiesTaxNote")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ratePlanName">
                    {t("RatePlanManagement.ratePlanName")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ratePlanName"
                    value={newRatePlan.ratePlanName}
                    onChange={(e) => setNewRatePlan({ ...newRatePlan, ratePlanName: e.target.value })}
                    placeholder={t("RatePlanManagement.ratePlanNamePlaceholder")}
                    className="col-span-3"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="b2b-available">{t("RatePlanManagement.b2bAvailable")}</Label>
                      <p className="text-xs text-gray-500">
                        {t("RatePlanManagement.b2bAvailableDesc")}
                      </p>
                    </div>
                    <Switch
                      id="b2b-available"
                      checked={newRatePlan.b2bAvailable}
                      onCheckedChange={(checked) =>
                        setNewRatePlan({ ...newRatePlan, b2bAvailable: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="b2c-available">{t("RatePlanManagement.b2cAvailable")}</Label>
                      <p className="text-xs text-gray-500">
                        {t("RatePlanManagement.b2cAvailableDesc")}
                      </p>
                    </div>
                    <Switch
                      id="b2c-available"
                      checked={newRatePlan.b2cAvailable}
                      onCheckedChange={(checked) =>
                        setNewRatePlan({ ...newRatePlan, b2cAvailable: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="edit-room-only-visible">{t("RatePlanManagement.roomOnlyPriceVisible")}</Label>
                      <p className="text-xs text-gray-500">
                        {t("RatePlanManagement.roomOnlyPriceVisibleDesc")}
                      </p>
                    </div>
                    <Switch
                      id="edit-room-only-visible"
                      checked={newRatePlan.roomOnlyVisible}
                      onCheckedChange={(checked) =>
                        setNewRatePlan({ ...newRatePlan, roomOnlyVisible: checked })
                      }
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {t("RatePlanManagement.policiesTaxNote")}
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewRatePlan({ ratePlanName: "", b2bAvailable: false, b2cAvailable: true, roomOnlyVisible: true });
                  }}
                >
                  {t("RatePlanManagement.cancel")}
                </Button>
                <Button
                  type="submit"
                  onClick={createRatePlan}
                  disabled={!newRatePlan.ratePlanName.trim()}
                >
                  {t("RatePlanManagement.createRatePlan")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rate Plans List Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{t("RatePlanManagement.allRatePlans")}</h2>
          {allRatePlans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              {t("RatePlanManagement.noRatePlansFound")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRatePlans.map((ratePlan) => (
                <div
                  key={ratePlan.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 relative"
                >
                  {/* More Menu - Top Right */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAddRulesClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          {ratePlan.ratePlanRules ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                          <span>{ratePlan.ratePlanRules ? t("RatePlanManagement.updateRules") : t("RatePlanManagement.addRules")}</span>
                        </DropdownMenuItem>

                        {/* ✅ ADDED: Manage Addons menu item */}
                        <DropdownMenuItem
                          onClick={() => handleManageAddonsClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          <span>{t("RatePlanManagement.manageAddons")}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleAddLanguageClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <span>{t("Common.addTranslation")}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => handleCheckLanguagesClick(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          <span>{t("Common.checkTranslation")}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleEdit(ratePlan)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>{t("RatePlanManagement.edit")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(ratePlan)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t("RatePlanManagement.delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3 pr-8">
                    {ratePlan._translations?ratePlan._translations.ratePlanName:ratePlan.ratePlanName}
                  </h3>
                  <div className="space-y-3 mb-4 text-xm">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t("RatePlanManagement.code")}:</span> {ratePlan.ratePlanCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ratePlan.createdAt
                          ? (() => {
                            const [y, m, d] = ratePlan.createdAt.split('T')[0].split('-').map(Number);
                            const monthKeys = ['january','february','march','april','may','june','july','august','september','october','november','december'];
                            const month = t(`Months.${monthKeys[m - 1]}`);
                            const time = new Date(ratePlan.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
                            return `${month} ${d}, ${y}, ${time}`;
                          })()
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Availability Status */}
                    <div className="flex gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.b2bAvailable ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">{t("RatePlanManagement.b2b")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.b2cAvailable ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">{t("RatePlanManagement.b2c")}</span>
                      </div>

                    </div>

                    {/* Policy and Tax Status Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.cancellationPolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.cancellationPolicy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.depositPolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.depositPolicy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.guaranteePolicyId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.guaranteePolicy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.taxGroupId ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.tax")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${!ratePlan.ratePlanRules ? 'bg-gray-300' : ratePlan.ratePlanRules.isActive ? 'bg-green-500' : 'bg-orange-300'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.mlosRules")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ratePlan.Addons?.length === 0 ? 'bg-gray-300' : 'bg-green-500'}`} />
                        <span className="text-xs text-gray-600">
                          {t("RatePlanManagement.addonIncluded")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Rate Plan Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("RatePlanManagement.editRatePlan")}</DialogTitle>
            <DialogDescription>
              {t("RatePlanManagement.updateRatePlanDetails")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ratePlanName">
                {t("RatePlanManagement.ratePlanName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-ratePlanName"
                value={newRatePlan.ratePlanName}
                onChange={(e) => setNewRatePlan({ ...newRatePlan, ratePlanName: e.target.value })}
                placeholder={t("RatePlanManagement.ratePlanNamePlaceholder")}
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-b2b-available">{t("RatePlanManagement.b2bAvailable")}</Label>
                  <p className="text-xs text-gray-500">
                    {t("RatePlanManagement.b2bAvailableDesc")}
                  </p>
                </div>
                <Switch
                  id="edit-b2b-available"
                  checked={newRatePlan.b2bAvailable}
                  onCheckedChange={(checked) =>
                    setNewRatePlan({ ...newRatePlan, b2bAvailable: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-b2c-available">{t("RatePlanManagement.b2cAvailable")}</Label>
                  <p className="text-xs text-gray-500">
                    {t("RatePlanManagement.b2cAvailableDesc")}
                  </p>
                </div>
                <Switch
                  id="edit-b2c-available"
                  checked={newRatePlan.b2cAvailable}
                  onCheckedChange={(checked) =>
                    setNewRatePlan({ ...newRatePlan, b2cAvailable: checked })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="edit-room-only-visible">{t("RatePlanManagement.roomOnlyPriceVisible")}</Label>
                <p className="text-xs text-gray-500">
                  {t("RatePlanManagement.roomOnlyPriceVisibleDesc")}
                </p>
              </div>
              <Switch
                id="edit-room-only-visible"
                checked={newRatePlan.roomOnlyVisible}
                onCheckedChange={(checked) =>
                  setNewRatePlan({ ...newRatePlan, roomOnlyVisible: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
            >
              {t("RatePlanManagement.cancel")}
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateRatePlan}
              disabled={!newRatePlan.ratePlanName.trim()}
            >
              {t("RatePlanManagement.updateRatePlan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("RatePlanManagement.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("RatePlanManagement.deleteRatePlanMessage", { name: deleteDialog.ratePlan?.ratePlanName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>{t("RatePlanManagement.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t("RatePlanManagement.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate Plan Rules Dialog */}
      {rulesDialog.ratePlan && (
        <RatePlanRulesDialog
          open={rulesDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setRulesDialog({ open: false, ratePlan: null });
            }
          }}
          ratePlanId={rulesDialog.ratePlan.id}
          ratePlanName={rulesDialog.ratePlan.ratePlanName}
          existingRule={rulesDialog.ratePlan.ratePlanRules || null}
          onSuccess={handleRulesSuccess}
        />
      )}

      {/* ✅ ADDED: Manage Addons Dialog */}
      {addonsDialog.ratePlan && propertyId && (
        <ManageRateWithAddonsForm
          open={addonsDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setAddonsDialog({ open: false, ratePlan: null });
            }
          }}
          ratePlanCode={addonsDialog.ratePlan.ratePlanCode}
          ratePlanName={addonsDialog.ratePlan.ratePlanName}
          propertyId={propertyId}
          onSuccess={fetchRatePlans} // ✅ This refetches rate plans after save
        />
      )}

      {/* Add Language Dialog */}
      {addLanguageDialog.ratePlan && (
        <AddRatePlanLanguageDialog
          open={addLanguageDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setAddLanguageDialog({ open: false, ratePlan: null });
            }
          }}
          ratePlanId={addLanguageDialog.ratePlan.id}
        />
      )}

      {/* Check Languages Dialog */}
      {checkLanguagesDialog.ratePlan && (
        <CheckRatePlanLanguagesDialog
          open={checkLanguagesDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setCheckLanguagesDialog({ open: false, ratePlan: null });
            }
          }}
          ratePlanId={checkLanguagesDialog.ratePlan.id}
          onEdit={(locale, data) => setEditLanguageDialog({ open: true, ratePlanId: checkLanguagesDialog.ratePlan!.id, locale, data })}
        />
      )}

      {/* Edit Language Dialog */}
      {editLanguageDialog.ratePlanId && (
        <EditTranslationDialog
          open={editLanguageDialog.open}
          onOpenChange={(open) => setEditLanguageDialog(prev => ({ ...prev, open }))}
          entityId={editLanguageDialog.ratePlanId}
          locale={editLanguageDialog.locale}
          initialData={editLanguageDialog.data}
          title={t("RatePlan.editTrans")}
          fields={[
            { key: "ratePlanName", label: t('RatePlan.planName'), placeholder: "e.g., Plan Estándar" },
          ]}
          onSave={async (id, locale, data) => upsertRatePlanTranslationService(id, { [locale]: data })}
        />
      )}
    </>
  );
}