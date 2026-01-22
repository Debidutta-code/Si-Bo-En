import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    fetchRatePlansService

} from "./services";
import type { ITaxRule, ICTaxRule, ITaxGroup, ICTaxGroup, RatePlan } from "./interface";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaxRuleDialog, TaxGroupDialog } from "./components";

interface LoadingProps {
    isLoading: boolean;
    message: string;
}

export default function TaxSystem() {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    // State management
    const [taxRules, setTaxRules] = useState<ITaxRule[]>([]);
    const [taxGroups, setTaxGroups] = useState<ITaxGroup[]>([]);
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

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "rule" | "group" | null;
        item: ITaxRule | ITaxGroup | null;
    }>({
        open: false,
        type: null,
        item: null,
    });

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
        setLoader({ isLoading: true, message: "Loading tax system data..." });
        try {
            await Promise.all([fetchTaxRules(), fetchTaxGroups(), fetchRatePlans()]);
        } catch (error) {
            toast.error("Failed to load tax system data");
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
                toast.error(response.message || "Failed to fetch rate plans");
            }
        } catch (error) {
            toast.error("Failed to fetch rate plans");
        }
    }
    console.log("Rate Plans:", ratePlans);
    const fetchTaxRules = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchTaxRulesByPropertyService(propertyId);
            if (response.success) {
                setTaxRules(response.data || []);
            } else {
                toast.error(response.message || "Failed to fetch tax rules");
            }
        } catch (error) {
            toast.error("Failed to fetch tax rules");
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
                toast.error(response.message || "Failed to fetch tax groups");
            }
        } catch (error) {
            toast.error("Failed to fetch tax groups");
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
        setLoader({ isLoading: true, message: "Creating tax rule..." });
        try {
            const response = await createTaxRuleService(propertyId, data);
            if (response.success) {
                toast.success(response.message || "Tax rule created successfully");
                setTaxRuleDialog({ open: false, mode: "create", taxRule: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || "Failed to create tax rule");
            }
        } catch (error) {
            toast.error("Failed to create tax rule");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleUpdateTaxRule = async (data: ICTaxRule) => {
        if (!taxRuleDialog.taxRule) return;
        setLoader({ isLoading: true, message: "Updating tax rule..." });
        try {
            const response = await updateTaxRuleService(
                taxRuleDialog.taxRule.id,
                data
            );
            if (response.success) {
                toast.success(response.message || "Tax rule updated successfully");
                setTaxRuleDialog({ open: false, mode: "create", taxRule: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || "Failed to update tax rule");
            }
        } catch (error) {
            toast.error("Failed to update tax rule");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleDeleteTaxRule = async () => {
        if (!deleteDialog.item) return;
        setLoader({ isLoading: true, message: "Deleting tax rule..." });
        try {
            const response = await deleteTaxRuleService(deleteDialog.item.id);
            if (response.success) {
                toast.success(response.message || "Tax rule deleted successfully");
                setDeleteDialog({ open: false, type: null, item: null });
                fetchTaxRules();
            } else {
                toast.error(response.message || "Failed to delete tax rule");
            }
        } catch (error) {
            toast.error("Failed to delete tax rule");
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
        setLoader({ isLoading: true, message: "Creating tax group..." });
        try {
            const response = await createTaxGroupService(propertyId, data);
            if (response.success) {
                // Add selected tax rules to the newly created group
                if (data.taxRuleIds && data.taxRuleIds.length > 0 && response.data?.id) {
                    await addRulesToTaxGroupService(response.data.id, data.taxRuleIds);
                }

                toast.success(response.message || "Tax group created successfully");
                setTaxGroupDialog({ open: false, mode: "create", taxGroup: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to create tax group");
            }
        } catch (error) {
            toast.error("Failed to create tax group");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleUpdateTaxGroup = async (data: ICTaxGroup) => {
        if (!taxGroupDialog.taxGroup) return;
        setLoader({ isLoading: true, message: "Updating tax group..." });
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

                toast.success(response.message || "Tax group updated successfully");
                setTaxGroupDialog({ open: false, mode: "create", taxGroup: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to update tax group");
            }
        } catch (error) {
            toast.error("Failed to update tax group");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleDeleteTaxGroup = async () => {
        if (!deleteDialog.item) return;
        setLoader({ isLoading: true, message: "Deleting tax group..." });
        try {
            const response = await deleteTaxGroupService(deleteDialog.item.id);
            if (response.success) {
                toast.success(response.message || "Tax group deleted successfully");
                setDeleteDialog({ open: false, type: null, item: null });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to delete tax group");
            }
        } catch (error) {
            toast.error("Failed to delete tax group");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    // Group action handlers
    const handleAddRuleToGroup = async () => {
        if (!groupActionDialog.ruleId || !groupActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: "Adding rule to group..." });
        try {
            const response = await addRulesToTaxGroupService(
                groupActionDialog.selectedGroupId,
                [groupActionDialog.ruleId]
            );
            if (response.success) {
                toast.success("Tax rule added to group successfully");
                setGroupActionDialog({
                    open: false,
                    action: null,
                    ruleId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to add rule to group");
            }
        } catch (error) {
            toast.error("Failed to add rule to group");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleRemoveRuleFromGroup = async () => {
        if (!groupActionDialog.ruleId || !groupActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: "Removing rule from group..." });
        try {
            const response = await removeRulesFromTaxGroupService(
                groupActionDialog.selectedGroupId,
                [groupActionDialog.ruleId]
            );
            if (response.success) {
                toast.success("Tax rule removed from group successfully");
                setGroupActionDialog({
                    open: false,
                    action: null,
                    ruleId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to remove rule from group");
            }
        } catch (error) {
            toast.error("Failed to remove rule from group");
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
        if (!ratePlanActionDialog.ratePlanId || !ratePlanActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: "Adding rate plan to tax group..." });
        try {
            const response = await addRatePlanToTaxGroupService(
                ratePlanActionDialog.selectedGroupId,
                ratePlanActionDialog.ratePlanId
            );
            if (response.success) {
                toast.success("Rate plan added to tax group successfully");
                setRatePlanActionDialog({
                    open: false,
                    action: null,
                    ratePlanId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to add rate plan to tax group");
            }
        } catch (error) {
            toast.error("Failed to add rate plan to tax group");
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleRemoveRatePlanFromGroup = async () => {
        if (!ratePlanActionDialog.ratePlanId || !ratePlanActionDialog.selectedGroupId) return;
        setLoader({ isLoading: true, message: "Removing rate plan from tax group..." });
        try {
            const response = await removeRatePlanFromTaxGroupService(
                ratePlanActionDialog.selectedGroupId,
                ratePlanActionDialog.ratePlanId
            );
            if (response.success) {
                toast.success("Rate plan removed from tax group successfully");
                setRatePlanActionDialog({
                    open: false,
                    action: null,
                    ratePlanId: null,
                    selectedGroupId: null,
                });
                fetchTaxGroups();
            } else {
                toast.error(response.message || "Failed to remove rate plan from tax group");
            }
        } catch (error) {
            toast.error("Failed to remove rate plan from tax group");
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
                                Tax System Management
                            </h1>
                            <p className="text-gray-600">
                                Configure tax rules and groups for your property
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Tax Rules
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
                                        Total Tax Groups
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {taxGroups.length}
                                    </p>
                                </div>
                                <Layers className="w-10 h-10 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="rules" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rules">Tax Rules</TabsTrigger>
                        <TabsTrigger value="groups">Tax Groups</TabsTrigger>
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
                                            placeholder="Search tax rules..."
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
                                        Create Tax Rule
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
                                        No Tax Rules Found
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchQuery
                                            ? "No tax rules match your search criteria."
                                            : "Get started by creating your first tax rule."}
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
                                            Create Tax Rule
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
                                                        {rule.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        Priority: {rule.priority}
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
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserPlus className="w-4 h-4 mr-2" />
                                                                Add to Group
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getAvailableGroupsForRule(rule.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        No available groups
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
                                                                Remove from Group
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getGroupsForRule(rule.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        Not in any group
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
                                                                            {group.name}
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
                                                            : `₹${rule.value}`}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {rule.applicableOn === "room_rate"
                                                            ? "Room Rate"
                                                            : "Total Amount"}
                                                    </Badge>
                                                    {rule.isInclusive && (
                                                        <Badge variant="secondary">
                                                            Inclusive
                                                        </Badge>
                                                    )}
                                                </div>
                                                {rule.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {rule.description}
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
                                                                    {group.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t text-xs text-gray-500">
                                                    <p>
                                                        Valid: {format(new Date(rule.validFrom), "PP")}{" "}
                                                        - {format(new Date(rule.validTo), "PP")}
                                                    </p>
                                                </div>
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
                                            placeholder="Search tax groups..."
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
                                        Create Tax Group
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
                                        No Tax Groups Found
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchQuery
                                            ? "No tax groups match your search criteria."
                                            : "Get started by creating your first tax group."}
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
                                            Create Tax Group
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
                                                        {group.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {group.isActive ? (
                                                            <span className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <XCircle className="w-3 h-3" />
                                                                Inactive
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
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserPlus className="w-4 h-4 mr-2" />
                                                                Add Rate Plan
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getAvailableRatePlansForGroup(group.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        No available rate plans
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
                                                                            {ratePlan.ratePlanName}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <UserMinus className="w-4 h-4 mr-2" />
                                                                Remove Rate Plan
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                {getRatePlansForGroup(group.id).length === 0 ? (
                                                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                        No rate plans assigned
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
                                                                            {ratePlan.ratePlanName}
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
                                                            Delete
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
                                                    {group.isActive ? "Active" : "Inactive"}
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
                                                                    {gr.taxRule.name}
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
                                                                    {ratePlan.ratePlanName}
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

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({ open, type: null, item: null })
                    }
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the{" "}
                                {deleteDialog.type === "rule" ? "tax rule" : "tax group"} "
                                {deleteDialog.item?.name}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={
                                    deleteDialog.type === "rule"
                                        ? handleDeleteTaxRule
                                        : handleDeleteTaxGroup
                                }
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
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
                                {groupActionDialog.action === "add" ? "Add to Group" : "Remove from Group"}
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
                                {groupActionDialog.action === "add" ? "Add" : "Remove"}
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
                    ? "Add Rate Plan to Tax Group" 
                    : "Remove Rate Plan from Tax Group"}
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
                {ratePlanActionDialog.action === "add" ? "Add" : "Remove"}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
            </div>
        </div>
    );
}