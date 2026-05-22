import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ImageSlider from "@/components/shared/ImageSlider";
import {
  Package,
  Settings,
  DollarSign,
  Calendar,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  Baby,
  Languages,
  PlusCircle,
} from "lucide-react";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import {
  createAddOnService,
  updateAddOnService,
  fetchAddOnsService,
  deleteAddOnService,
  fetchCategoriesService,
  fetchSubCategoriesService,
  fetchVariantsService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  createSubCategoryService,
  updateSubCategoryService,
  deleteSubCategoryService,
  createVariantService,
  updateVariantService,
  deleteVariantService,
  createAvailabilityService,
  fetchAvailabilitiesService,
  updateAvailabilityService,
  deleteAvailabilityService,
  createChildAddonService,
  getAllChildAddonsService,
  updateChildAddonService,
  deleteChildAddonService,
} from "./services";
import type {
  IAddon,
  IAddonCreate,
  IAddonUpdate,
  IAddonCategory,
  IAddonCategoryCreate,
  IAddonSubCategory,
  IAddonSubCategoryCreate,
  IAddonVariant,
  IAddonVariantCreate,
  IAddonAvailability,
  IAddonAvailabilityCreate,
  IAddonAvailabilityUpdate,
  IChildAddon,
  ICChildAddoon,
  IUpdateChildAddon,
} from "./interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AddOnDialog from "./components/AddOnDialog";
import CategoryDialog from "./components/CategoryDialog";
import SubCategoryDialog from "./components/SubCategoryDialog";
import VariantDialog from "./components/VariantDialog";
import ManagementTabs from "./components/ManagementTabs";
import AddOnAvailabilityDialog from "./components/AddOnAvailabilityDialog";
import AddOnAvailabilityTable from "./components/AddOnAvailabilityTable";
import ChildAddonDialog from "./components/ChildAddonDialog";
import { AddTranslationDialog, CheckTranslationsDialog } from "../management/components/multilang/ManagementTranslationDialogs";
import {
  upsertAddonTranslation,
  getAllAddonTranslations,
  deleteAddonTranslationLocale
} from "./api/addon-langa.api";
import { EditTranslationDialog } from "../management/components/multilang/ManagementTranslationDialogs";
import { usePropertyContext } from "@/contexts/PropertyContext";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  isLoading: boolean;
  message?: string;
}

export default function AddOns() {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();

  // State management
  const [addOns, setAddOns] = useState<IAddon[]>([]);
  const { languages: propertyLanguages } = usePropertyContext();
  const activeLanguageCodes = propertyLanguages.map((l) => l.language);
  const [categories, setCategories] = useState<IAddonCategory[]>([]);
  const [subCategories, setSubCategories] = useState<IAddonSubCategory[]>([]);
  const [variants, setVariants] = useState<IAddonVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showManagement, setShowManagement] = useState(false);
  const [selectedAddonForAvailability, setSelectedAddonForAvailability] =
    useState<IAddon | null>(null);
  const [availabilities, setAvailabilities] = useState<IAddonAvailability[]>(
    [],
  );

  const [loader, setLoader] = useState<LoaderProps>({
    isLoading: false,
    message: "",
  });

  // Dialog states
  const [addOnDialog, setAddOnDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    addOn: IAddon | null;
  }>({
    open: false,
    mode: "create",
    addOn: null,
  });
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: IAddonCategory | null;
  }>({
    open: false,
    mode: "create",
    category: null,
  });
  const [subCategoryDialog, setSubCategoryDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    subCategory: IAddonSubCategory | null;
  }>({
    open: false,
    mode: "create",
    subCategory: null,
  });
  const [variantDialog, setVariantDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    variant: IAddonVariant | null;
  }>({
    open: false,
    mode: "create",
    variant: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    addOn: IAddon | null;
  }>({
    open: false,
    addOn: null,
  });
  const [availabilityDialog, setAvailabilityDialog] = useState({ open: false });
  const [childAddonDialog, setChildAddonDialog] = useState<{
    open: boolean;
    addonId: string | null;
  }>({
    open: false,
    addonId: null,
  });
  const [translationDialog, setTranslationDialog] = useState<{
    openAdd: boolean;
    openCheck: boolean;
    openEdit: boolean;
    addonId: string | null;
    editingLocale: string;
    editingData: Record<string, any>;
  }>({
    openAdd: false,
    openCheck: false,
    openEdit: false,
    addonId: null,
    editingLocale: "",
    editingData: {},
  });
  const [childAddons, setChildAddons] = useState<IChildAddon[]>([]);
  const [childAddonLoading, setChildAddonLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (propertyId) {
      fetchAllData();
    }
  }, [propertyId]);

  const fetchAllData = async () => {
    setLoader({ isLoading: true, message: t("Addon.loadingAddonsData") });
    try {
      await Promise.all([
        fetchAddOns(),
        fetchCategories(),
        fetchSubCategories(),
        fetchVariants(),
      ]);
    } catch (error) {
      toast.error(t("Addon.failedToLoadData"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchAddOns = async () => {
    if (!propertyId) return;
    try {
      const response = await fetchAddOnsService(propertyId);
      if (response.success) {
        setAddOns(response.data || []);
      } else {
        toast.error(response.message || t("Addon.failedToFetchAddons"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToFetchAddons"));
    }
  };

  const fetchCategories = async () => {
    if (!propertyId) return
    try {
      const response = await fetchCategoriesService(propertyId);
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async () => {
    if (!propertyId) return

    try {
      const response = await fetchSubCategoriesService(propertyId);
      if (response.success) {
        setSubCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories");
    }
  };

  const fetchVariants = async () => {
    if (!propertyId) return

    try {
      const response = await fetchVariantsService(propertyId);
      if (response.success) {
        setVariants(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch variants");
    }
  };

  // Add-On handlers
  const handleSaveAddOn = async (data: IAddonCreate | IAddonUpdate) => {
    if (addOnDialog.mode === "create") {
      await handleCreateAddOn(data);
    } else {
      await handleUpdateAddOn(data);
    }
  };

  const handleCreateAddOn = async (data: IAddonCreate | IAddonUpdate) => {
    if (!propertyId) {
      toast.error(t("Addon.propertyIdMissing"));
      return;
    }

    setLoader({ isLoading: true, message: t("Addon.creatingAddon") });
    try {
      const response = await createAddOnService(
        data as IAddonCreate,
        propertyId,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.addonCreatedSuccessfully"));
        setAddOnDialog({ open: false, mode: "create", addOn: null });
        fetchAddOns();
      } else {
        toast.error(response.message || t("Addon.failedToCreateAddon"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateAddon"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateAddOn = async (data: IAddonCreate | IAddonUpdate) => {
    if (!addOnDialog.addOn) return;

    setLoader({ isLoading: true, message: t("Addon.updatingAddon") });
    try {
      const response = await updateAddOnService(
        addOnDialog.addOn.id,
        data as IAddonUpdate,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.addonUpdatedSuccessfully"));
        setAddOnDialog({ open: false, mode: "create", addOn: null });
        fetchAddOns();
      } else {
        toast.error(response.message || t("Addon.failedToUpdateAddon"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateAddon"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteAddOn = async () => {
    if (!deleteDialog.addOn) return;

    setLoader({ isLoading: true, message: t("Addon.deletingAddon") });
    try {
      const response = await deleteAddOnService(deleteDialog.addOn.id);
      if (response.success) {
        toast.success(response.message || t("Addon.addonDeletedSuccessfully"));
        setDeleteDialog({ open: false, addOn: null });
        fetchAddOns();
      } else {
        toast.error(response.message || t("Addon.failedToDeleteAddon"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToDeleteAddon"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // Category handlers
  const handleSaveCategory = async (data: IAddonCategoryCreate) => {
    if (categoryDialog.mode === "create") {
      await handleCreateCategory(data);
    } else {
      await handleUpdateCategory(data);
    }
  };

  const handleCreateCategory = async (data: IAddonCategoryCreate) => {
    if (!propertyId) return
    setLoader({ isLoading: true, message: t("Addon.creatingCategory") });
    try {
      const response = await createCategoryService(data, propertyId);
      if (response.success) {
        toast.success(response.message || t("Addon.categoryCreatedSuccessfully"));
        setCategoryDialog({ open: false, mode: "create", category: null });
        fetchCategories();
      } else {
        toast.error(response.message || t("Addon.failedToCreateCategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateCategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateCategory = async (data: IAddonCategoryCreate) => {
    if (!categoryDialog.category) return;

    setLoader({ isLoading: true, message: t("Addon.updatingCategory") });
    try {
      const response = await updateCategoryService(
        categoryDialog.category.id,
        data,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.categoryUpdatedSuccessfully"));
        setCategoryDialog({ open: false, mode: "create", category: null });
        fetchCategories();
      } else {
        toast.error(response.message || t("Addon.failedToUpdateCategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateCategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setLoader({ isLoading: true, message: t("Addon.deletingCategory") });
    try {
      const response = await deleteCategoryService(categoryId);
      if (response.success) {
        toast.success(response.message || t("Addon.categoryDeletedSuccessfully"));
        fetchCategories();
      } else {
        toast.error(response.message || t("Addon.failedToDeleteCategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToDeleteCategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // Subcategory handlers
  const handleSaveSubCategory = async (data: IAddonSubCategoryCreate) => {
    if (subCategoryDialog.mode === "create") {
      await handleCreateSubCategory(data);
    } else {
      await handleUpdateSubCategory(data);
    }
  };

  const handleCreateSubCategory = async (data: IAddonSubCategoryCreate) => {
    if (!propertyId) return
    setLoader({ isLoading: true, message: t("Addon.creatingSubcategory") });
    try {
      const response = await createSubCategoryService(data, propertyId);
      if (response.success) {
        toast.success(response.message || t("Addon.subcategoryCreatedSuccessfully"));
        setSubCategoryDialog({
          open: false,
          mode: "create",
          subCategory: null,
        });
        fetchSubCategories();
      } else {
        toast.error(response.message || t("Addon.failedToCreateSubcategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateSubcategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateSubCategory = async (data: IAddonSubCategoryCreate) => {
    if (!subCategoryDialog.subCategory) return;

    setLoader({ isLoading: true, message: t("Addon.updatingSubcategory") });
    try {
      const response = await updateSubCategoryService(
        subCategoryDialog.subCategory.id,
        data,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.subcategoryUpdatedSuccessfully"));
        setSubCategoryDialog({
          open: false,
          mode: "create",
          subCategory: null,
        });
        fetchSubCategories();
      } else {
        toast.error(response.message || t("Addon.failedToUpdateSubcategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateSubcategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    setLoader({ isLoading: true, message: t("Addon.deletingSubcategory") });
    try {
      const response = await deleteSubCategoryService(subCategoryId);
      if (response.success) {
        toast.success(response.message || t("Addon.subcategoryDeletedSuccessfully"));
        fetchSubCategories();
      } else {
        toast.error(response.message || t("Addon.failedToDeleteSubcategory"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToDeleteSubcategory"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // Variant handlers
  const handleSaveVariant = async (data: IAddonVariantCreate) => {
    if (variantDialog.mode === "create") {
      await handleCreateVariant(data);
    } else {
      await handleUpdateVariant(data);
    }
  };

  const handleCreateVariant = async (data: IAddonVariantCreate) => {
    if (!propertyId) return
    setLoader({ isLoading: true, message: t("Addon.creatingVariant") });
    try {
      const response = await createVariantService(data, propertyId);
      if (response.success) {
        toast.success(response.message || t("Addon.variantCreatedSuccessfully"));
        setVariantDialog({ open: false, mode: "create", variant: null });
        fetchVariants();
      } else {
        toast.error(response.message || t("Addon.failedToCreateVariant"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateVariant"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateVariant = async (data: IAddonVariantCreate) => {
    if (!variantDialog.variant) return;

    setLoader({ isLoading: true, message: t("Addon.updatingVariant") });
    try {
      const response = await updateVariantService(
        variantDialog.variant.id,
        data,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.variantUpdatedSuccessfully"));
        setVariantDialog({ open: false, mode: "create", variant: null });
        fetchVariants();
      } else {
        toast.error(response.message || t("Addon.failedToUpdateVariant"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateVariant"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    setLoader({ isLoading: true, message: t("Addon.deletingVariant") });
    try {
      const response = await deleteVariantService(variantId);
      if (response.success) {
        toast.success(response.message || t("Addon.variantDeletedSuccessfully"));
        fetchVariants();
      } else {
        toast.error(response.message || t("Addon.failedToDeleteVariant"));
      }
    } catch (error) {
      toast.error("Failed to delete variant");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // Availability handlers
  const handleCreateAvailability = async (data: IAddonAvailabilityCreate) => {
    setLoader({ isLoading: true, message: t("Addon.creatingAvailability") });
    try {
      const response = await createAvailabilityService(data);
      if (response.success) {
        toast.success(response.message || t("Addon.availabilityCreatedSuccessfully"));
        setAvailabilityDialog({ open: false });
        if (selectedAddonForAvailability) {
          fetchAvailabilitiesForAddon(selectedAddonForAvailability.id);
        }
      } else {
        toast.error(response.message || t("Addon.failedToCreateAvailability"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateAvailability"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const fetchAvailabilitiesForAddon = async (addonId: string) => {
    setLoader({ isLoading: true, message: t("Addon.loadingAvailabilities") });
    try {
      const response = await fetchAvailabilitiesService(addonId);
      if (response.success) {
        setAvailabilities(response.data || []);
      } else {
        toast.error(response.message || t("Addon.failedToFetchAvailabilities"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToFetchAvailabilities"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateAvailability = async (
    availabilityId: string,
    data: { price: number; currencyCode: string; isAvailable: boolean },
  ) => {
    setLoader({ isLoading: true, message: t("Addon.updatingAvailability") });
    try {
      const updateData: IAddonAvailabilityUpdate = {
        id: availabilityId,
        ...data,
      };
      const response = await updateAvailabilityService(
        availabilityId,
        updateData,
      );
      if (response.success) {
        toast.success(response.message || t("Addon.availabilityUpdatedSuccessfully"));
        if (selectedAddonForAvailability) {
          fetchAvailabilitiesForAddon(selectedAddonForAvailability.id);
        }
      } else {
        toast.error(response.message || t("Addon.failedToUpdateAvailability"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateAvailability"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    setLoader({ isLoading: true, message: t("Addon.deletingAvailability") });
    try {
      const response = await deleteAvailabilityService(availabilityId);
      if (response.success) {
        toast.success(response.message || t("Addon.availabilityDeletedSuccessfully"));
        if (selectedAddonForAvailability) {
          fetchAvailabilitiesForAddon(selectedAddonForAvailability.id);
        }
      } else {
        toast.error(response.message || t("Addon.failedToDeleteAvailability"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToDeleteAvailability"));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleManageAvailability = (addOn: IAddon) => {
    setSelectedAddonForAvailability(addOn);
    fetchAvailabilitiesForAddon(addOn.id);
  };

  const handleBackToAddOns = () => {
    setSelectedAddonForAvailability(null);
    setAvailabilities([]);
  };

  // Child Addon handlers
  const handleOpenChildAddonDialog = async (addonId: string) => {
    setChildAddonDialog({ open: true, addonId });
    await fetchChildAddons(addonId);
  };

  const fetchChildAddons = async (addonId: string) => {
    setChildAddonLoading(true);
    try {
      const response = await getAllChildAddonsService(addonId);
      if (response.success) {
        setChildAddons(response.data || []);
      } else {
        toast.error(response.message || t("Addon.failedToFetchChildrenCatalog"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToFetchChildrenCatalog"));
    } finally {
      setChildAddonLoading(false);
    }
  };

  const handleCreateChildAddon = async (data: ICChildAddoon) => {
    if (!propertyId) return;
    setChildAddonLoading(true);
    try {
      const response = await createChildAddonService(data, propertyId);
      if (response.success) {
        toast.success(
          response.message || t("Addon.childrenCatalogCreatedSuccessfully"),
        );
        if (childAddonDialog.addonId) {
          await fetchChildAddons(childAddonDialog.addonId);
        }
      } else {
        toast.error(response.message || t("Addon.failedToCreateChildrenCatalog"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToCreateChildrenCatalog"));
    } finally {
      setChildAddonLoading(false);
    }
  };

  const handleUpdateChildAddon = async (
    id: string,
    data: IUpdateChildAddon,
  ) => {
    setChildAddonLoading(true);
    if (!propertyId) return;
    try {
      const response = await updateChildAddonService(id, data, propertyId);
      if (response.success) {
        toast.success(
          response.message || t("Addon.childrenCatalogUpdatedSuccessfully"),
        );
        if (childAddonDialog.addonId) {
          await fetchChildAddons(childAddonDialog.addonId);
        }
      } else {
        toast.error(response.message || t("Addon.failedToUpdateChildrenCatalog"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToUpdateChildrenCatalog"));
    } finally {
      setChildAddonLoading(false);
    }
  };

  const handleDeleteChildAddon = async (id: string) => {
    setChildAddonLoading(true);
    try {
      const response = await deleteChildAddonService(id);
      if (response.success) {
        toast.success(
          response.message || t("Addon.childrenCatalogDeletedSuccessfully"),
        );
        if (childAddonDialog.addonId) {
          await fetchChildAddons(childAddonDialog.addonId);
        }
      } else {
        toast.error(response.message || t("Addon.failedToDeleteChildrenCatalog"));
      }
    } catch (error) {
      toast.error(t("Addon.failedToDeleteChildrenCatalog"));
    } finally {
      setChildAddonLoading(false);
    }
  };

  const convertText = (txt: string): string => {
    return txt
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Filter add-ons
  const filteredAddOns = addOns?.filter((addOn) => {
    const matchesSearch =
      addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && addOn.isActive) ||
      (filterActive === "inactive" && !addOn.isActive);
    return matchesSearch && matchesFilter;
  });

  if (loader.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("Addon.addonsManagement")}
                </h1>
                <p className="text-gray-600">
                  {t("Addon.manageAdditionalServices")}
                </p>
              </div>
            </div>
            <Button
              variant={showManagement ? "default" : "outline"}
              onClick={() => setShowManagement(!showManagement)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showManagement ? t("Addon.viewAddons") : t("Addon.manageCategories")}
            </Button>
          </div>
        </div>

        {showManagement ? (
          // Management View
          <ManagementTabs
            categories={categories}
            subCategories={subCategories}
            variants={variants}
            onCreateCategory={() =>
              setCategoryDialog({ open: true, mode: "create", category: null })
            }
            onEditCategory={(category) =>
              setCategoryDialog({ open: true, mode: "edit", category })
            }
            onDeleteCategory={handleDeleteCategory}
            onCreateSubCategory={() =>
              setSubCategoryDialog({
                open: true,
                mode: "create",
                subCategory: null,
              })
            }
            onEditSubCategory={(subCategory) =>
              setSubCategoryDialog({ open: true, mode: "edit", subCategory })
            }
            onDeleteSubCategory={handleDeleteSubCategory}
            onCreateVariant={() =>
              setVariantDialog({ open: true, mode: "create", variant: null })
            }
            onEditVariant={(variant) =>
              setVariantDialog({ open: true, mode: "edit", variant })
            }
            onDeleteVariant={handleDeleteVariant}
          />
        ) : selectedAddonForAvailability ? (
          // Availability Management View
          <div className="space-y-6">
            <Button variant="outline" onClick={handleBackToAddOns}>
              ← {t("Addon.backToAddons")}
            </Button>
            <AddOnAvailabilityTable
              availabilities={availabilities}
              addOn={selectedAddonForAvailability}
              onUpdate={handleUpdateAvailability}
              onDelete={handleDeleteAvailability}
              onCreateNew={() => setAvailabilityDialog({ open: true })}
              isLoading={loader.isLoading}
            />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t("Addon.totalAddons")}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {addOns.length}
                      </p>
                    </div>
                    <Package className="w-10 h-10 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t("Addon.activeAddons")}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {addOns.filter((a) => a.isActive).length}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t("Addon.inactiveAddons")}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {addOns.filter((a) => !a.isActive).length}
                      </p>
                    </div>
                    <Calendar className="w-10 h-10 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Bar */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder={t("Addon.searchAddons")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={filterActive}
                      onValueChange={(value: any) => setFilterActive(value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("Addon.allStatus")}</SelectItem>
                        <SelectItem value="active">{t("Addon.active")}</SelectItem>
                        <SelectItem value="inactive">{t("Addon.inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() =>
                        setAddOnDialog({
                          open: true,
                          mode: "create",
                          addOn: null,
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("Addon.addNew")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add-Ons Grid */}
            {filteredAddOns.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {t("Addon.noAddonsFound")}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || filterActive !== "all"
                      ? t("Addon.noAddonsMatchCriteria")
                      : t("Addon.getStartedAddons")}
                  </p>
                  {!searchQuery && filterActive === "all" && (
                    <Button
                      onClick={() =>
                        setAddOnDialog({
                          open: true,
                          mode: "create",
                          addOn: null,
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("Addon.createAddon")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAddOns.map((addOn) => (
                  <Card
                    key={addOn.id}
                    className="hover:shadow-xl transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="h-48 w-full border-b">
                      {addOn.images && addOn.images.length > 0 ? (
                        <ImageSlider images={addOn.images} alt={addOn.name} height="h-48" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">
                            {addOn._translations ? addOn._translations.name : addOn.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {t("Addon.code")}: {addOn.code}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleManageAvailability(addOn)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {t("Addon.manageAvailability")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleOpenChildAddonDialog(addOn.id)
                              }
                            >
                              <Baby className="w-4 h-4 mr-2" />
                              {t("Addon.manageChildren")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, openEdit: false, addonId: addOn.id }))
                              }
                            >
                              <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                              Add Translation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, openEdit: false, addonId: addOn.id }))
                              }
                            >
                              <Languages className="w-4 h-4 mr-2 text-green-600" />
                              Check Translations
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setAddOnDialog({
                                  open: true,
                                  mode: "edit",
                                  addOn,
                                })
                              }
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              {t("Common.edit")}

                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteDialog({ open: true, addOn })
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("Common.delete")}

                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                          {addOn._translations ? addOn._translations.description : addOn.description || t("Addon.noDescriptionProvided")}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge
                            variant={addOn.isActive ? "default" : "secondary"}
                          >
                            {addOn.isActive ? t("Addon.active") : t("Addon.inactive")}
                          </Badge>
                          <Badge variant="outline">
                            {convertText(addOn.postingRhythm)}
                          </Badge>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            {t("Addon.created")}:{" "}
                            {new Date(addOn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Dialogs */}
        <AddOnDialog
          open={addOnDialog.open}
          onOpenChange={(open) =>
            setAddOnDialog({ open, mode: "create", addOn: null })
          }
          onSave={handleSaveAddOn}
          addOn={addOnDialog.addOn}
          categories={categories}
          subCategories={subCategories}
          variants={variants}
          mode={addOnDialog.mode}
        />

        <CategoryDialog
          open={categoryDialog.open}
          onOpenChange={(open) =>
            setCategoryDialog({ open, mode: "create", category: null })
          }
          onSave={handleSaveCategory}
          category={categoryDialog.category}
          mode={categoryDialog.mode}
        />

        <SubCategoryDialog
          open={subCategoryDialog.open}
          onOpenChange={(open) =>
            setSubCategoryDialog({ open, mode: "create", subCategory: null })
          }
          onSave={handleSaveSubCategory}
          subCategory={subCategoryDialog.subCategory}
          categories={categories}
          mode={subCategoryDialog.mode}
        />

        <VariantDialog
          open={variantDialog.open}
          onOpenChange={(open) =>
            setVariantDialog({ open, mode: "create", variant: null })
          }
          onSave={handleSaveVariant}
          variant={variantDialog.variant}
          categories={categories}
          subCategories={subCategories}
          mode={variantDialog.mode}
        />

        <AddOnAvailabilityDialog
          open={availabilityDialog.open}
          onOpenChange={(open) => setAvailabilityDialog({ open })}
          onSave={handleCreateAvailability}
          addOns={addOns}
          selectedAddonId={selectedAddonForAvailability?.id}
        />

        <ChildAddonDialog
          open={childAddonDialog.open}
          onOpenChange={(open) => {
            setChildAddonDialog({
              open,
              addonId: open ? childAddonDialog.addonId : null,
            });
            if (!open) setChildAddons([]);
          }}
          onSave={handleCreateChildAddon}
          onUpdate={handleUpdateChildAddon}
          onDelete={handleDeleteChildAddon}
          childAddons={childAddons}
          addonId={childAddonDialog.addonId}
          isLoading={childAddonLoading}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, addOn: null })}
        >
           <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Addon.areYouSure")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("Addon.deleteAddonDescription", { name: deleteDialog.addOn?.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAddOn}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("Common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Translation Dialogs */}
        {translationDialog.addonId && (
          <>
            <AddTranslationDialog
              open={translationDialog.openAdd}
              onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
              entityId={translationDialog.addonId}
              title="Add Add-On Translation"
              fields={[
                { key: "name", label: "Add-On Name", placeholder: "e.g. Desayuno Extra" },
                { key: "description", label: "Description", placeholder: "Enter translated description..." }
              ]}
              allowedLanguageCodes={activeLanguageCodes}
              onSave={async (id, locale, data) => {
                return await upsertAddonTranslation(id, { [locale]: data });
              }}
            />
            <CheckTranslationsDialog
              open={translationDialog.openCheck}
              onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
              entityId={translationDialog.addonId}
              title="Add-On Translations"
              displayFields={[
                { key: "name", label: "Name" },
                { key: "description", label: "Description" }
              ]}
              onFetch={getAllAddonTranslations}
              onDelete={deleteAddonTranslationLocale}
              onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, openCheck: false, editingLocale: locale, editingData: data }))}
            />
            <EditTranslationDialog
              open={translationDialog.openEdit}
              onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
              entityId={translationDialog.addonId!}
              locale={translationDialog.editingLocale}
              initialData={translationDialog.editingData}
              title="Edit Add-On Translation"
              fields={[
                { key: "name", label: "Add-On Name", placeholder: "e.g. Desayuno Extra" },
                { key: "description", label: "Description", placeholder: "Enter translated description..." }
              ]}
              onSave={async (id, locale, data) => upsertAddonTranslation(id, { [locale]: data })}
            />
          </>
        )}
      </div>
    </div>
  );
}
