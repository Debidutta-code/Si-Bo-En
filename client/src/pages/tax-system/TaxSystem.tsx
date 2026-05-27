import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import toast from "react-hot-toast";
import {
    createTaxRuleService,
    updateTaxRuleService,
    deleteTaxRuleService,
    fetchTaxRulesByPropertyService,
    createTaxGroupService,
    updateTaxGroupService,
    deleteTaxGroupService,
    getTaxGroupsByPropertyIdService,
    addRulesToTaxGroupService,
    removeRulesFromTaxGroupService,
    addRatePlanToTaxGroupService,
    removeRatePlanFromTaxGroupService,
    fetchRatePlansService,
    fetchTouristTaxesByPropertyService,
    createTouristTaxService,
    updateTouristTaxService,
    deleteTouristTaxService

} from "./services";
import type { ITaxRule, ICTaxRule, ITaxGroup, ICTaxGroup, RatePlan, ITouristTax, ICTouristTax } from "./interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Receipt,
    Search,
    Layers,
    CheckCircle,
    XCircle,
    UserPlus,
    UserMinus,
    Languages,
    PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaxRuleDialog, TaxGroupDialog, TouristTaxDialog } from "./components";
import { fetchRoomTypesService } from "../inventory/services";
import type { RoomTypes } from "../inventory/types";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "../management/components/multilang/ManagementTranslationDialogs";
import {
    upsertTaxRuleTranslation,
    getAllTaxRuleTranslations,
    deleteTaxRuleTranslationLocale,
    upsertTaxGroupTranslation,
    getAllTaxGroupTranslations,
    deleteTaxGroupTranslationLocale,
    upsertTouristTaxTranslation,
    getAllTouristTaxTranslations,
    deleteTouristTaxTranslationLocale
} from "./api/multilanguage.api";
import { usePropertyContext } from "@/contexts/PropertyContext";
import { languages } from "@/components/language/language";

interface LoadingProps {
    isLoading: boolean;
    message: string;
}

export default function TaxSystem() {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    // State management
        const { languages: propertyLanguages } = usePropertyContext();
        const availableLanguages = propertyLanguages && propertyLanguages.length > 0
            ? languages.filter((l) => propertyLanguages.some((pl) => pl.language === l.code))
            : languages;
    
    const [taxRules, setTaxRules] = useState<ITaxRule[]>([]);
    const [taxGroups, setTaxGroups] = useState<ITaxGroup[]>([]);
    const [touristTaxes, setTouristTaxes] = useState<ITouristTax[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [loader, setLoader] = useState<LoadingProps>({
        isLoading: false,
        message: "",
    });

    // Dialog states
    const [taxRuleDialog, setTaxRuleDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        taxRule: ITaxRule | null;
    }>({
        open: false,
        mode: "create",
        taxRule: null,
    });

    const [taxGroupDialog, setTaxGroupDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        taxGroup: ITaxGroup | null;
    }>({
        open: false,
        mode: "create",
        taxGroup: null,
    });
    const [touristTaxDialog, setTouristTaxDialog] = useState<{
        open: boolean;
        mode: "create" | "edit";
        touristTax: ITouristTax | null;
    }>({
        open: false,
        mode: "create",
        touristTax: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "rule" | "group" | "charge" | null;
        item: ITaxRule | ITaxGroup | ITouristTax | null;
    }>({
        open: false,
        type: null,
        item: null,
    });
    const [translationDialog, setTranslationDialog] = useState<{
        openAdd: boolean;
        openCheck: boolean;
        openEdit: boolean;
        type: "rule" | "group" | "charge" | null;
        entityId: string | null;
        editingLocale: string;
        editingData: Record<string, any>;
    }>({
        openAdd: false,
        openCheck: false,
        openEdit: false,
        type: null,
        entityId: null,
        editingLocale: "",
        editingData: {},
    });
  const [allRooms, setAllRooms] = useState<RoomTypes[]>([]);

    const [groupActionDialog, setGroupActionDialog] = useState<{
        open: boolean;
        action: "add" | "remove" | null;
        ruleId: string | null;
        selectedGroupId: string | null;
    }>({
        open: false,
        action: null,
        ruleId: null,
        selectedGroupId: null,
    });

    const [ratePlanActionDialog, setRatePlanActionDialog] = useState<{
        open: boolean;
        action: "add" | "remove" | null;
        ratePlanId: string | null;
        selectedGroupId: string | null;
    }>({
        open: false,
        action: null,
        ratePlanId: null,
        selectedGroupId: null,
    });

    // Fetch data on mount
    useEffect(() => {
        if (propertyId) {
            fetchAllData();
        }
    }, [propertyId]);

    const fetchAllData = async () => {
        setLoader({ isLoading: true, message: t("TaxSystem.loadingTaxSystemData") });
        try {
            await Promise.all([fetchTaxRules(), fetchTaxGroups(), fetchRatePlans(), fetchTouristTaxes(), fetchRoomTypes()]);
        } catch (error) {
            toast.error(t("TaxSystem.failedToLoadTaxSystemData"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };
    const fetchTouristTaxes = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchTouristTaxesByPropertyService(propertyId);
            if (response.success) {
                setTouristTaxes(response.data || []);
            } else {
                toast.error(response.message || t("TaxSystem.failedToFetchTouristTaxes"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToFetchTouristTaxes"));
        }
    }
    const fetchRoomTypes = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchRoomTypesService(propertyId);
            if (response.success) {
                setAllRooms(response.data || []);
            } else {
                toast.error(response.message || t("TaxSystem.failedToFetchRoomTypes"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToFetchRoomTypes"));
        }
    };
    const handleSaveTouristTax = async (data: ICTouristTax) => {
        if (touristTaxDialog.mode === "create") {
            await handleCreateTouristTax(data);
        } else {
            await handleUpdateTouristTax(data);
        }
    };
    const handleDeleteTouristTax = async () => {
        if (!deleteDialog.item) return;
        setLoader({ isLoading: true, message: t("TaxSystem.deletingAdditionalCharge") });
        try {
            const response = await deleteTouristTaxService(deleteDialog.item.id);
            if (response.success) {
                toast.success(response.message || t("TaxSystem.additionalChargeDeletedSuccessfully"));
                setDeleteDialog({ open: false, type: null, item: null });
                fetchTouristTaxes();
            } else {
                toast.error(response.message || t("TaxSystem.failedToDeleteAdditionalCharge"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToDeleteAdditionalCharge"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };
    const handleCreateTouristTax = async (data: ICTouristTax) => {
        if (!propertyId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.creatingTouristTax") });
        try {
            const response = await createTouristTaxService(propertyId, data);
            if (response.success) {
                toast.success(response.message || t("TaxSystem.touristTaxCreatedSuccessfully"));
                setTouristTaxDialog({ open: false, mode: "create", touristTax: null });
                fetchTouristTaxes();
            } else {
                toast.error(response.message || t("TaxSystem.failedToCreateTouristTax"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToCreateTouristTax"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleUpdateTouristTax = async (data: ICTouristTax) => {
        if (!touristTaxDialog.touristTax) return;
        setLoader({ isLoading: true, message: t("TaxSystem.updatingTouristTax") });
        try {
            const response = await updateTouristTaxService(
                touristTaxDialog.touristTax.id,
                data
            );
            if (response.success) {
                toast.success(response.message || t("TaxSystem.touristTaxUpdatedSuccessfully"));
                setTouristTaxDialog({ open: false, mode: "create", touristTax: null });
                fetchTouristTaxes();
            } else {
                toast.error(response.message || t("TaxSystem.failedToUpdateTouristTax"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToUpdateTouristTax"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };




    const fetchRatePlans = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchRatePlansService(propertyId);
            if (response.success) {
                setRatePlans(response.data || []);
            } else {
                toast.error(response.message || t("TaxSystem.failedToFetchRatePlans"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToFetchRatePlans"));
        }
    }
    // console.log("Rate Plans:", ratePlans);
    const fetchTaxRules = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchTaxRulesByPropertyService(propertyId);
            if (response.success) {
                setTaxRules(response.data || []);
            } else {
                toast.error(response.message || t("TaxSystem.failedToFetchTaxRules"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToFetchTaxRules"));
        }
    };

    const fetchTaxGroups = async () => {
        if (!propertyId) return;
        try {
            const response = await getTaxGroupsByPropertyIdService(propertyId);
            // console.log(response)
            if (response.success) {
                setTaxGroups(response.data || []);
            } else {
                toast.error(response.message || t("TaxSystem.failedToFetchTaxGroups"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToFetchTaxGroups"));
        }
    };

    // Tax Rule handlers
    const handleSaveTaxRule = async (data: ICTaxRule) => {
        if (taxRuleDialog.mode === "create") {
            await handleCreateTaxRule(data);
        } else {
            await handleUpdateTaxRule(data);
        }
    };

    const handleCreateTaxRule = async (data: ICTaxRule) => {
        if (!propertyId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.creatingTaxRule") });
        try {
            const response = await createTaxRuleService(propertyId, data);
            if (response.success) {
                toast.success(response.message || t("TaxSystem.taxRuleCreatedSuccessfully"));
                setTaxRuleDialog({ open: false, mode: "create", taxRule: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || t("TaxSystem.failedToCreateTaxRule"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToCreateTaxRule"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleUpdateTaxRule = async (data: ICTaxRule) => {
        if (!taxRuleDialog.taxRule) return;
        setLoader({ isLoading: true, message: t("TaxSystem.updatingTaxRule") });
        try {
            const response = await updateTaxRuleService(
                taxRuleDialog.taxRule.id,
                data
            );
            if (response.success) {
                toast.success(response.message || t("TaxSystem.taxRuleUpdatedSuccessfully"));
                setTaxRuleDialog({ open: false, mode: "create", taxRule: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || t("TaxSystem.failedToUpdateTaxRule"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToUpdateTaxRule"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleDeleteTaxRule = async () => {
        if (!deleteDialog.item) return;
        setLoader({ isLoading: true, message: t("TaxSystem.deletingTaxRule") });
        try {
            const response = await deleteTaxRuleService(deleteDialog.item.id);
            if (response.success) {
                toast.success(response.message || t("TaxSystem.taxRuleDeletedSuccessfully"));
                setDeleteDialog({ open: false, type: null, item: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || t("TaxSystem.failedToDeleteTaxRule"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToDeleteTaxRule"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    // Tax Group handlers
    const handleSaveTaxGroup = async (data: ICTaxGroup) => {
        if (taxGroupDialog.mode === "create") {
            await handleCreateTaxGroup(data);
        } else {
            await handleUpdateTaxGroup(data);
        }
    };

    const handleCreateTaxGroup = async (data: ICTaxGroup) => {
        if (!propertyId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.creatingTaxGroup") });
        try {
            const response = await createTaxGroupService(propertyId, data);
            if (response.success) {
                // Add selected tax rules to the newly created group
                if (data.taxRuleIds && data.taxRuleIds.length > 0 && response.data?.id) {
                    await addRulesToTaxGroupService(response.data.id, data.taxRuleIds);
                }

                toast.success(response.message || t("TaxSystem.taxGroupCreatedSuccessfully"));
                setTaxGroupDialog({ open: false, mode: "create", taxGroup: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || t("TaxSystem.failedToCreateTaxGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToCreateTaxGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleUpdateTaxGroup = async (data: ICTaxGroup) => {
        if (!taxGroupDialog.taxGroup) return;
        setLoader({ isLoading: true, message: t("TaxSystem.updatingTaxGroup") });
        try {
            // Update basic tax group details
            const response = await updateTaxGroupService(
                taxGroupDialog.taxGroup.id,
                data
            );

            if (response.success) {
                // Get current rule IDs from the tax group
                const currentRuleIds = (taxGroupDialog.taxGroup as any).taxGroupRules?.map((rule: any) => rule.taxRuleId) || [];
                const newRuleIds = data.taxRuleIds || [];

                // Calculate rules to add and remove
                const rulesToAdd = newRuleIds.filter(id => !currentRuleIds.includes(id));
                const rulesToRemove = currentRuleIds.filter((id: string) => !newRuleIds.includes(id));

                // Add new rules
                if (rulesToAdd.length > 0) {
                    await addRulesToTaxGroupService(taxGroupDialog.taxGroup.id, rulesToAdd);
                }

                // Remove unselected rules
                if (rulesToRemove.length > 0) {
                    await removeRulesFromTaxGroupService(taxGroupDialog.taxGroup.id, rulesToRemove);
                }

                toast.success(response.message || t("TaxSystem.taxGroupUpdatedSuccessfully"));
                setTaxGroupDialog({ open: false, mode: "create", taxGroup: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || t("TaxSystem.failedToUpdateTaxGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToUpdateTaxGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleDeleteTaxGroup = async () => {
        if (!deleteDialog.item) return;
        setLoader({ isLoading: true, message: t("TaxSystem.deletingTaxGroup") });
        try {
            const response = await deleteTaxGroupService(deleteDialog.item.id);
            if (response.success) {
                toast.success(response.message || t("TaxSystem.taxGroupDeletedSuccessfully"));
                setDeleteDialog({ open: false, type: null, item: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || t("TaxSystem.failedToDeleteTaxGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToDeleteTaxGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    // Group action handlers
    const handleAddRuleToGroup = async () => {
        if (!groupActionDialog.ruleId || !groupActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.addingRuleToGroup") });
        try {
            const response = await addRulesToTaxGroupService(
                groupActionDialog.selectedGroupId,
                [groupActionDialog.ruleId]
            );
            if (response.success) {
                toast.success(t("TaxSystem.taxRuleAddedToGroupSuccessfully"));
                setGroupActionDialog({
                    open: false,
                    action: null,
                    ruleId: null,
                    selectedGroupId: null,
                });
                await Promise.all([

                    fetchTaxRules(),
                    fetchTaxGroups()
                ])
            } else {
                toast.error(response.message || t("TaxSystem.failedToAddRuleToGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToAddRuleToGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleRemoveRuleFromGroup = async () => {
        if (!groupActionDialog.ruleId || !groupActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.removingRuleFromGroup") });
        try {
            const response = await removeRulesFromTaxGroupService(
                groupActionDialog.selectedGroupId,
                [groupActionDialog.ruleId]
            );
            if (response.success) {
                toast.success(t("TaxSystem.taxRuleRemovedFromGroupSuccessfully"));
                setGroupActionDialog({
                    open: false,
                    action: null,
                    ruleId: null,
                    selectedGroupId: null,
                });
                await Promise.all([

                    fetchTaxRules(),
                    fetchTaxGroups()
                ])
            } else {
                toast.error(response.message || t("TaxSystem.failedToRemoveRuleFromGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToRemoveRuleFromGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    // Get groups that contain a specific rule
    const getGroupsForRule = (ruleId: string) => {
        const rule = taxRules.find(r => r.id === ruleId);
        if (!rule?.taxGroupRules) return [];
        return rule.taxGroupRules.map(gr => gr.taxGroup);
    };

    // Get groups that don't contain a specific rule
    const getAvailableGroupsForRule = (ruleId: string) => {
        const assignedGroups = getGroupsForRule(ruleId);
        return taxGroups.filter(group => !assignedGroups.some(ag => ag.id === group.id));
    };

    // Rate Plan action handlers
    const handleAddRatePlanToGroup = async () => {
        // console.log("add called")
        if (!ratePlanActionDialog.ratePlanId || !ratePlanActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.addingRatePlanToTaxGroup") });
        try {
            const response = await addRatePlanToTaxGroupService(
                ratePlanActionDialog.selectedGroupId,
                ratePlanActionDialog.ratePlanId
            );
            if (response.success) {
                toast.success(t("TaxSystem.ratePlanAddedToTaxGroupSuccessfully"));
                setRatePlanActionDialog({
                    open: false,
                    action: null,
                    ratePlanId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || t("TaxSystem.failedToAddRatePlanToTaxGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToAddRatePlanToTaxGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleRemoveRatePlanFromGroup = async () => {
        if (!ratePlanActionDialog.ratePlanId || !ratePlanActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: t("TaxSystem.removingRatePlanFromTaxGroup") });
        try {
            const response = await removeRatePlanFromTaxGroupService(
                ratePlanActionDialog.selectedGroupId,
                ratePlanActionDialog.ratePlanId
            );
            if (response.success) {
                toast.success(t("TaxSystem.ratePlanRemovedFromTaxGroupSuccessfully"));
                setRatePlanActionDialog({
                    open: false,
                    action: null,
                    ratePlanId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || t("TaxSystem.failedToRemoveRatePlanFromTaxGroup"));
            }
        } catch (error) {
            toast.error(t("TaxSystem.failedToRemoveRatePlanFromTaxGroup"));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    // Get rate plans that are assigned to a specific group
    const getRatePlansForGroup = (groupId: string) => {
        const group = taxGroups.find(g => g.id === groupId) as any;
        if (!group?.ratePlans) return [];
        return ratePlans.filter(rp => group.ratePlans.some((grp: any) => grp.id === rp.id));
    };

    // Get rate plans that are not assigned to a specific group
    const getAvailableRatePlansForGroup = (groupId: string) => {
        const assignedPlans = getRatePlansForGroup(groupId);
        return ratePlans.filter(rp => !assignedPlans.some(ap => ap.id === rp.id));
    };

    // Filter functions
    const filteredTaxRules = taxRules.filter((rule) =>
        rule.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTaxGroups = taxGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {t("TaxSystem.taxSystemManagement")}
                            </h1>
                            <p className="text-gray-600">
                                {t("TaxSystem.configureTaxRules")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t("TaxSystem.totalTaxRules")}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {taxRules.length}
                                    </p>
                                </div>
                                <Receipt className="w-10 h-10 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t("TaxSystem.totalTaxGroups")}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {taxGroups.length}
                                    </p>
                                </div>
                                <Layers className="w-10 h-10 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t("TaxSystem.totalAdditionalCharges")}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {touristTaxes.length}
                                    </p>
                                </div>
                                <Receipt className="w-10 h-10 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="rules" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="rules">{t("TaxSystem.taxRules")}</TabsTrigger>
                        <TabsTrigger value="groups">{t("TaxSystem.taxGroups")}</TabsTrigger>
                        <TabsTrigger value="additional-charges">{t("TouristTaxDialog.createTitle")}</TabsTrigger>
                    </TabsList>

                    {/* Tax Rules Tab */}
                    <TabsContent value="rules" className="space-y-6">
                        {/* Search and Create */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder={t("TaxSystem.searchTaxRules")}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setTaxRuleDialog({
                                                open: true,
                                                mode: "create",
                                                taxRule: null,
                                            })
                                        }
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t("TaxSystem.createTax")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tax Rules List */}
                        {filteredTaxRules.length === 0 ? (
                            <Card className="shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("TaxSystem.noTaxRulesFound")}
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchQuery
                                            ? t("TaxSystem.noTaxRulesMatchCriteria")
                                            : t("TaxSystem.getStartedTaxRules")}
                                    </p>
                                    {!searchQuery && (
                                        <Button
                                            onClick={() =>
                                                setTaxRuleDialog({
                                                    open: true,
                                                    mode: "create",
                                                    taxRule: null,
                                                })
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t("TaxSystem.createTaxRule")}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTaxRules.map((rule) => (
                                    <Card
                                        key={rule.id}
                                        className="hover:shadow-xl transition-shadow duration-200"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg mb-1">
                                                        {rule._translations ? rule._translations.name : rule.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {t("TaxSystem.priority")}: {rule.priority}
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
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setTaxRuleDialog({
                                                                    open: true,
                                                                    mode: "edit",
                                                                    taxRule: rule,
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            {t("TaxSystem.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, type: 'rule', entityId: rule.id }))}
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                            {t("Common.addTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, type: 'rule', entityId: rule.id }))}
                                                        >
                                                            <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                            {t("Common.checkTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserPlus className="w-4 h-4 mr-2" />
                                                                {t("TaxSystem.addToGroup")}
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getAvailableGroupsForRule(rule.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        {t("TaxSystem.noAvailableGroups")}
                                                                    </div>
                                                                ) : (
                                                                    getAvailableGroupsForRule(rule.id).map((group) => (
                                                                        <DropdownMenuItem
                                                                            key={group.id}
                                                                            onClick={() =>
                                                                                setGroupActionDialog({
                                                                                    open: true,
                                                                                    action: "add",
                                                                                    ruleId: rule.id,
                                                                                    selectedGroupId: group.id,
                                                                                })
                                                                            }
                                                                        >
                                                                            {group.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserMinus className="w-4 h-4 mr-2" />
                                                                {t("TaxSystem.removeFromGroup")}
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getGroupsForRule(rule.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        {t("TaxSystem.notInAnyGroup")}
                                                                    </div>
                                                                ) : (
                                                                    getGroupsForRule(rule.id).map((group) => (
                                                                        <DropdownMenuItem
                                                                            key={group.id}
                                                                            onClick={() =>
                                                                                setGroupActionDialog({
                                                                                    open: true,
                                                                                    action: "remove",
                                                                                    ruleId: rule.id,
                                                                                    selectedGroupId: group.id,
                                                                                })
                                                                            }
                                                                        >
                                                                            {group._translations?group._translations.name:group.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleteDialog({
                                                                    open: true,
                                                                    type: "rule",
                                                                    item: rule,
                                                                })
                                                            }
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="default">
                                                        {rule.type === "percentage"
                                                            ? `${rule.value}%`
                                                            : `${rule.value} ${rule.currencyCode}`}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {rule.applicableOn === "room_rate"
                                                            ? "Room Rate"
                                                            : "Total Amount"}
                                                    </Badge>
                                                </div>
                                                {rule.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {rule._translations?rule._translations.description:rule.description}
                                                    </p>
                                                )}
                                                {getGroupsForRule(rule.id).length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-700">Applied to Groups:</p>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {getGroupsForRule(rule.id).map((group) => (
                                                                <Badge
                                                                    key={group.id}
                                                                    variant="outline"
                                                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                                                >
                                                                    <Layers className="w-3 h-3 mr-1" />
                                                                    {group._translations?group._translations.name:group.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tax Groups Tab */}
                    <TabsContent value="groups" className="space-y-6">
                        {/* Search and Create */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder={t("TaxSystem.searchTaxGroups")}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setTaxGroupDialog({
                                                open: true,
                                                mode: "create",
                                                taxGroup: null,
                                            })
                                        }
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t("TaxSystem.createTaxGroup")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tax Groups List */}
                        {filteredTaxGroups.length === 0 ? (
                            <Card className="shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Layers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("TaxSystem.noTaxGroupsFound")}
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchQuery
                                            ? t("TaxSystem.noTaxGroupsMatchCriteria")
                                            : t("TaxSystem.getStartedTaxGroups")}
                                    </p>
                                    {!searchQuery && (
                                        <Button
                                            onClick={() =>
                                                setTaxGroupDialog({
                                                    open: true,
                                                    mode: "create",
                                                    taxGroup: null,
                                                })
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t("TaxSystem.createTaxGroup")}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTaxGroups.map((group) => (
                                    <Card
                                        key={group.id}
                                        className="hover:shadow-xl transition-shadow duration-200"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg mb-1">
                                                        {group._translations?group._translations.name:group.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {group.isActive ? (
                                                            <span className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="w-3 h-3" />
                                                                {t("TaxSystem.active")}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <XCircle className="w-3 h-3" />
                                                                {t("TaxSystem.inactive")}
                                                            </span>
                                                        )}
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
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setTaxGroupDialog({
                                                                    open: true,
                                                                    mode: "edit",
                                                                    taxGroup: group,
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            {t("TaxSystem.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, type: 'group', entityId: group.id }))}
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                            {t("Common.addTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, type: 'group', entityId: group.id }))}
                                                        >
                                                            <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                            {t("Common.checkTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserPlus className="w-4 h-4 mr-2" />
                                                                {t("TaxSystem.addRatePlan")}
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getAvailableRatePlansForGroup(group.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        {t("TaxSystem.noAvailableRatePlans")}
                                                                    </div>
                                                                ) : (
                                                                    getAvailableRatePlansForGroup(group.id).map((ratePlan) => (
                                                                        <DropdownMenuItem
                                                                            key={ratePlan.id}
                                                                            onClick={() =>
                                                                                setRatePlanActionDialog({
                                                                                    open: true,
                                                                                    action: "add",
                                                                                    ratePlanId: ratePlan.ratePlanCode,
                                                                                    selectedGroupId: group.id,
                                                                                })
                                                                            }
                                                                        >
                                                                            {ratePlan._translations?ratePlan._translations.ratePlanName:ratePlan.ratePlanName}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserMinus className="w-4 h-4 mr-2" />
                                                                {t("TaxSystem.removeRatePlan")}
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getRatePlansForGroup(group.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        {t("TaxSystem.noRatePlansAssigned")}
                                                                    </div>
                                                                ) : (
                                                                    getRatePlansForGroup(group.id).map((ratePlan) => (
                                                                        <DropdownMenuItem
                                                                            key={ratePlan.id}
                                                                            onClick={() =>
                                                                                setRatePlanActionDialog({
                                                                                    open: true,
                                                                                    action: "remove",
                                                                                    ratePlanId: ratePlan.ratePlanCode,
                                                                                    selectedGroupId: group.id,
                                                                                })
                                                                            }
                                                                        >
                                                                            {ratePlan._translations?ratePlan._translations.ratePlanName:ratePlan.ratePlanName}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleteDialog({
                                                                    open: true,
                                                                    type: "group",
                                                                    item: group,
                                                                })
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
                                                <Badge
                                                    variant={group.isActive ? "default" : "secondary"}
                                                >
                                                    {group.isActive ? t("TaxSystem.active") : t("TaxSystem.inactive")}
                                                </Badge>
                                                {group.taxGroupRules && group.taxGroupRules.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-700">
                                                            Tax Rules ({group.taxGroupRules.length}):
                                                        </p>
                                                        <div className="flex gap-1 flex-wrap max-h-20 overflow-y-auto">
                                                            {group.taxGroupRules.map((gr) => (
                                                                <Badge
                                                                    key={gr.id}
                                                                    variant="outline"
                                                                    className="text-xs bg-primary/10 text-primary border-primary/20"
                                                                >
                                                                    <Receipt className="w-3 h-3 mr-1" />
                                                                    {gr.taxRule._translations?gr.taxRule._translations.name:gr.taxRule.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {group.ratePlans && group.ratePlans.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-700">
                                                            Rate Plans ({group.ratePlans.length}):
                                                        </p>
                                                        <div className="flex gap-1 flex-wrap max-h-20 overflow-y-auto">
                                                            {group.ratePlans.map((ratePlan) => (
                                                                <Badge
                                                                    key={ratePlan.id}
                                                                    variant="outline"
                                                                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                                                >
                                                                    <Layers className="w-3 h-3 mr-1" />
                                                                    {ratePlan._translations?ratePlan._translations.ratePlanName:ratePlan.ratePlanName}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t text-xs text-gray-500">
                                                    <p>
                                                        Created: {format(new Date(group.createdAt), "PP")}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    {/* Additional Charges Tab */}
                    <TabsContent value="additional-charges" className="space-y-6">
                        {/* Search and Create */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder={t("TaxSystem.searchAdditionalCharges")}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setTouristTaxDialog({
                                                open: true,
                                                mode: "create",
                                                touristTax: null,
                                            })
                                        }
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                    {t("TouristTaxDialog.createTitle")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Charges List */}
                        {touristTaxes.length === 0 ? (
                            <Card className="shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("TaxSystem.noAdditionalChargesFound")}
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchQuery
                                            ? t("TaxSystem.noAdditionalChargesMatchCriteria")
                                            : t("TaxSystem.getStartedAdditionalCharges")}
                                    </p>
                                    {!searchQuery && (
                                        <Button
                                            onClick={() =>
                                                setTouristTaxDialog({
                                                    open: true,
                                                    mode: "create",
                                                    touristTax: null,
                                                })
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t("TaxSystem.addCharges")}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {touristTaxes.map((charge) => (
                                    <Card
                                        key={charge.id}
                                        className="hover:shadow-xl transition-shadow duration-200"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg mb-1">
                                                        {charge._translations?charge._translations.name:charge.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        Room name: {(() => {
                                                            const matchedRoom = allRooms.find((room) => room.id === charge.Room?.id);
                                                            return matchedRoom?._translations?.roomName || matchedRoom?.roomName || charge.Room?.roomName;
                                                        })()}
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
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setTouristTaxDialog({
                                                                    open: true,
                                                                    mode: "edit",
                                                                    touristTax: charge,
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            {t("TaxSystem.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: true, openCheck: false, type: 'charge', entityId: charge.id }))}
                                                        >
                                                            <PlusCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                            {t("Common.addTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setTranslationDialog(prev => ({ ...prev, openAdd: false, openCheck: true, type: 'charge', entityId: charge.id }))}
                                                        >
                                                            <Languages className="w-4 h-4 mr-2 text-green-600" />
                                                            {t("Common.checkTranslation")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleteDialog({
                                                                    open: true,
                                                                    type: "charge",
                                                                    item: charge,
                                                                })
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
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="default">
                                                        {charge.discountType === "percentage"
                                                            ? `${charge.discountValue}%`
                                                            : `${charge.currencyCode} ${charge.discountValue}`}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {charge.discountType === "percentage"
                                                            ? "Percentage Discount"
                                                            : "Flat Discount"}
                                                    </Badge>
                                                </div>
                                                <div className="pt-2 border-t text-xs text-gray-500">
                                                    <p>
                                                        Created: {format(new Date(charge.createdAt), "PP")}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Dialogs */}
                <TaxRuleDialog
                    open={taxRuleDialog.open}
                    onOpenChange={(open) =>
                        setTaxRuleDialog({ open, mode: "create", taxRule: null })
                    }
                    onSave={handleSaveTaxRule}
                    taxRule={taxRuleDialog.taxRule}
                    mode={taxRuleDialog.mode}
                />

                <TaxGroupDialog
                    open={taxGroupDialog.open}
                    onOpenChange={(open) =>
                        setTaxGroupDialog({ open, mode: "create", taxGroup: null })
                    }
                    onSave={handleSaveTaxGroup}
                    taxGroup={taxGroupDialog.taxGroup}
                    mode={taxGroupDialog.mode}
                    availableTaxRules={taxRules}
                    selectedRuleIds={
                        taxGroupDialog.taxGroup && 'taxGroupRules' in taxGroupDialog.taxGroup
                            ? (taxGroupDialog.taxGroup as any).taxGroupRules?.map((rule: any) => rule.taxRuleId) || []
                            : []
                    }
                />
                <TouristTaxDialog
                    open={touristTaxDialog.open}
                    onOpenChange={(open) =>
                        setTouristTaxDialog({ open, mode: "create", touristTax: null })
                    }
                    onSave={handleSaveTouristTax}
                    touristTax={touristTaxDialog.touristTax}
                    mode={touristTaxDialog.mode}
                    roomTypes={allRooms}
                />
                <AlertDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({ open, type: null, item: null })
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("TaxSystem.areYouSure")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the{" "}
                                {deleteDialog.type === "rule"
                                    ? "tax rule"
                                    : deleteDialog.type === "group"
                                        ? "tax group"
                                        : "additional charge"} "
                                {deleteDialog.type === "charge"
                                    ? (deleteDialog.item as ITouristTax)?.Room?.roomName || (deleteDialog.item as ITouristTax)?.roomId
                                    : (deleteDialog.item as ITaxRule | ITaxGroup)?.name}".
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("TaxSystem.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (deleteDialog.type === "rule") {
                                        handleDeleteTaxRule();
                                    } else if (deleteDialog.type === "group") {
                                        handleDeleteTaxGroup();
                                    } else if (deleteDialog.type === "charge") {
                                        handleDeleteTouristTax();
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {t("Common.delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Group Action Confirmation Dialog */}
                <AlertDialog
                    open={groupActionDialog.open}
                    onOpenChange={(open) =>
                        setGroupActionDialog({
                            open,
                            action: null,
                            ruleId: null,
                            selectedGroupId: null,
                        })
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {groupActionDialog.action === "add" ? t("TaxSystem.addToGroup") : t("TaxSystem.removeFromGroup")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {groupActionDialog.action === "add"
                                    ? `Add this tax rule to "${taxGroups.find((g) => g.id === groupActionDialog.selectedGroupId)?.name}"?`
                                    : `Remove this tax rule from "${taxGroups.find((g) => g.id === groupActionDialog.selectedGroupId)?.name}"?`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={
                                    groupActionDialog.action === "add"
                                        ? handleAddRuleToGroup
                                        : handleRemoveRuleFromGroup
                                }
                            >
                                {groupActionDialog.action === "add" ? t("TaxSystem.add") : t("TaxSystem.remove")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Rate Plan Action Confirmation Dialog */}
                <AlertDialog
                    open={ratePlanActionDialog.open}
                    onOpenChange={(open) =>
                        setRatePlanActionDialog({
                            open,
                            action: null,
                            ratePlanId: null,
                            selectedGroupId: null,
                        })
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {ratePlanActionDialog.action === "add"
                                    ? t("TaxSystem.addRatePlanToTaxGroup")
                                    : t("TaxSystem.removeRatePlanFromTaxGroup")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {ratePlanActionDialog.action === "add"
                                    ? `Add "${ratePlans.find((rp) => rp.ratePlanCode === ratePlanActionDialog.ratePlanId)?.ratePlanName || 'Unknown'}" to "${taxGroups.find((g) => g.id === ratePlanActionDialog.selectedGroupId)?.name}"?`
                                    : `Remove "${ratePlans.find((rp) => rp.ratePlanCode === ratePlanActionDialog.ratePlanId)?.ratePlanName || 'Unknown'}" from "${taxGroups.find((g) => g.id === ratePlanActionDialog.selectedGroupId)?.name}"?`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={
                                    ratePlanActionDialog.action === "add"
                                        ? handleAddRatePlanToGroup
                                        : handleRemoveRatePlanFromGroup
                                }
                            >
                                {ratePlanActionDialog.action === "add" ? t("TaxSystem.add") : t("TaxSystem.remove")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Translation Dialogs */}
                {translationDialog.entityId && translationDialog.type === "rule" && (
                    <>
                        <AddTranslationDialog
                            open={translationDialog.openAdd}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                            entityId={translationDialog.entityId}
                            title="Add Tax Rule Translation"
                            fields={[
                                { key: "name", label: "Rule Name", placeholder: "e.g. Impuesto..." },
                                { key: "description", label: "Description", placeholder: "Enter translated description..." }
                            ]}
                            onSave={async (id, locale, data) => {
                                return await upsertTaxRuleTranslation(id, { [locale]: data });
                            }}
                            allowedLanguageCodes={availableLanguages.map((l) => l.code)}
                        />
                        <CheckTranslationsDialog
                            open={translationDialog.openCheck}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                            entityId={translationDialog.entityId}
                            title="Tax Rule Translations"
                            displayFields={[
                                { key: "name", label: "Name" },
                                { key: "description", label: "Description" }
                            ]}
                            onFetch={getAllTaxRuleTranslations}
                            onDelete={deleteTaxRuleTranslationLocale}
                            onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, editingLocale: locale, editingData: data }))}
                        />
                        <EditTranslationDialog
                            open={translationDialog.openEdit && translationDialog.type === "rule"}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                            entityId={translationDialog.entityId!}
                            locale={translationDialog.editingLocale}
                            initialData={translationDialog.editingData}
                            title="Edit Tax Rule Translation"
                            fields={[
                                { key: "name", label: "Rule Name", placeholder: "e.g. Impuesto..." },
                                { key: "description", label: "Description", placeholder: "Enter translated description..." }
                            ]}
                            onSave={async (id, locale, data) => upsertTaxRuleTranslation(id, { [locale]: data })}
                        />
                    </>
                )}
                {translationDialog.entityId && translationDialog.type === "group" && (
                    <>
                        <AddTranslationDialog
                            open={translationDialog.openAdd}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                            entityId={translationDialog.entityId}
                            title="Add Tax Group Translation"
                            fields={[
                                { key: "name", label: "Group Name", placeholder: "e.g. Grupo de Impuestos..." }
                            ]}
                            onSave={async (id, locale, data) => {
                                return await upsertTaxGroupTranslation(id, { [locale]: data });
                            }}
                        />
                        <CheckTranslationsDialog
                            open={translationDialog.openCheck}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                            entityId={translationDialog.entityId}
                            title="Tax Group Translations"
                            displayFields={[
                                { key: "name", label: "Name" }
                            ]}
                            onFetch={getAllTaxGroupTranslations}
                            onDelete={deleteTaxGroupTranslationLocale}
                            onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, editingLocale: locale, editingData: data }))}
                        />
                        <EditTranslationDialog
                            open={translationDialog.openEdit && translationDialog.type === "group"}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                            entityId={translationDialog.entityId!}
                            locale={translationDialog.editingLocale}
                            initialData={translationDialog.editingData}
                            title="Edit Tax Group Translation"
                            fields={[
                                { key: "name", label: "Group Name", placeholder: "e.g. Grupo de Impuestos..." }
                            ]}
                            onSave={async (id, locale, data) => upsertTaxGroupTranslation(id, { [locale]: data })}
                        />
                    </>
                )}
                {translationDialog.entityId && translationDialog.type === "charge" && (
                    <>
                        <AddTranslationDialog
                            open={translationDialog.openAdd}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openAdd: open }))}
                            entityId={translationDialog.entityId}
                            title="Add Additional Charge Translation"
                            fields={[
                                { key: "name", label: "Charge Name", placeholder: "e.g. Cargo Adicional..." }
                            ]}
                            onSave={async (id, locale, data) => {
                                return await upsertTouristTaxTranslation(id, { [locale]: data });
                            }}
                        />
                        <CheckTranslationsDialog
                            open={translationDialog.openCheck}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openCheck: open }))}
                            entityId={translationDialog.entityId}
                            title="Additional Charge Translations"
                            displayFields={[
                                { key: "name", label: "Name" }
                            ]}
                            onFetch={getAllTouristTaxTranslations}
                            onDelete={deleteTouristTaxTranslationLocale}
                            onEdit={(locale, data) => setTranslationDialog(prev => ({ ...prev, openEdit: true, editingLocale: locale, editingData: data }))}
                        />
                        <EditTranslationDialog
                            open={translationDialog.openEdit && translationDialog.type === "charge"}
                            onOpenChange={(open) => setTranslationDialog(prev => ({ ...prev, openEdit: open }))}
                            entityId={translationDialog.entityId!}
                            locale={translationDialog.editingLocale}
                            initialData={translationDialog.editingData}
                            title="Edit Additional Charge Translation"
                            fields={[
                                { key: "name", label: "Charge Name", placeholder: "e.g. Cargo Adicional..." }
                            ]}
                            onSave={async (id, locale, data) => upsertTouristTaxTranslation(id, { [locale]: data })}
                        />
                    </>
                )}
            </div>
        </div>
    );
}