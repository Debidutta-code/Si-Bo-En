import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Plus, Shield, FileText, CreditCard, AlertCircle, MoreVertical, Trash2, Link2, Pencil, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import BackButton from "@/components/shared/BackButton";
import Loader from "@/components/Loader/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { createPolicyService, getPoliciesService, fetchRatePlansService, addPolicyToRatePlanService, deletePolicyService, updatePolicyDetailsService } from "./services";
import type { IPolicy, PolicyTypes, ICPolicy, RatePlan } from "./interfaces";

interface GroupedPolicy {
    id: string;
    policyName: string;
    type: PolicyTypes;
    description?: string;
    propertyId: string;
    ratePlans: { code: string; name: string }[];
}

export default function PoliciesPage() {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [policies, setPolicies] = useState<IPolicy[]>([]);
    const [loading, setLoading] = useState<{
        isLoading: boolean;
        text: string;
    }>({ isLoading: false, text: "Loading policies..." });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newPolicy, setNewPolicy] = useState<ICPolicy>({
        policyName: "",
        type: "cancellation",
        description: "",
    });
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

    const [policyToDelete, setPolicyToDelete] = useState<GroupedPolicy | null>(null);
    const [policyToAssign, setPolicyToAssign] = useState<GroupedPolicy | null>(null);
    const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>("");

    const [policyToEdit, setPolicyToEdit] = useState<GroupedPolicy | null>(null);
    const [editForm, setEditForm] = useState<{ policyName: string; description: string }>({
        policyName: "",
        description: "",
    });

    const groupedPolicies = useMemo(() => {
        const map = new Map<string, GroupedPolicy>();
        policies.forEach((policy) => {
            if (map.has(policy.id)) {
                const existing = map.get(policy.id)!;
                if (policy.ratePlanName && policy.ratePlanCode) {
                    const alreadyExists = existing.ratePlans.some(
                        (rp) => rp.code === policy.ratePlanCode
                    );
                    if (!alreadyExists) {
                        existing.ratePlans.push({
                            code: policy.ratePlanCode,
                            name: policy.ratePlanName,
                        });
                    }
                }
            } else {
                map.set(policy.id, {
                    id: policy.id,
                    policyName: policy.policyName,
                    type: policy.type,
                    description: policy.description,
                    propertyId: policy.propertyId,
                    ratePlans:
                        policy.ratePlanName && policy.ratePlanCode
                            ? [{ code: policy.ratePlanCode, name: policy.ratePlanName }]
                            : [],
                });
            }
        });
        return Array.from(map.values());
    }, [policies]);

    const fetchPolicies = async () => {
        if (!propertyId) return;
        setLoading({ isLoading: true, text: "Loading policies..." });
        try {
            const response = await getPoliciesService(propertyId);
            if (response.success && response.data) {
                setPolicies(response.data.allPolicies || []);
            } else {
                toast.error(response.message || "Failed to fetch policies");
            }
        } catch (error) {
            toast.error("An error occurred while fetching policies");
        } finally {
            setLoading({ isLoading: false, text: "" });
        }
    };

    const fetchRatePlans = async (propertyId: string) => {
        try {
            const ratePlans = await fetchRatePlansService(propertyId);
            if (ratePlans.success) {
                setRatePlans(ratePlans.data || []);
            } else {
                console.error(ratePlans.message || "Failed to fetch rate plans");
            }
        } catch (error) {
            console.error("An error occurred while fetching rate plans");
        }
    };

    useEffect(() => {
        if (!propertyId) {
            toast.error("Property ID is missing in the URL");
            return;
        }
        fetchPolicies();
        fetchRatePlans(propertyId);
    }, [propertyId]);

    const handleCreatePolicy = async () => {
        if (!propertyId) return;
        if (!newPolicy.policyName.trim()) {
            toast.error("Policy name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await createPolicyService(
                newPolicy.policyName,
                newPolicy.type,
                propertyId,
                newPolicy.description
            );
            if (response.success) {
                toast.success("Policy created successfully");
                setNewPolicy({ policyName: "", type: "cancellation", description: "" });
                setIsDialogOpen(false);
                fetchPolicies();
            } else {
                toast.error(response.message || "Failed to create policy");
            }
        } catch (error) {
            toast.error("An error occurred while creating the policy");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (policy: GroupedPolicy) => setPolicyToDelete(policy);

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        setIsSubmitting(true);
        try {
            const response = await deletePolicyService(policyToDelete.id);
            if (response.success) {
                toast.success("Policy deleted successfully");
                fetchPolicies();
            } else {
                toast.error(response.message || "Failed to delete policy");
            }
        } catch (error) {
            toast.error("Error deleting policy");
        } finally {
            setIsSubmitting(false);
            setPolicyToDelete(null);
        }
    };

    const handleAssignClick = (policy: GroupedPolicy) => {
        setPolicyToAssign(policy);
        setSelectedRatePlanId("");
    };

    const handleConfirmAssign = async () => {
        if (!policyToAssign || !selectedRatePlanId) {
            if (!selectedRatePlanId) toast.error("Please select a rate plan");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await addPolicyToRatePlanService(policyToAssign.id, selectedRatePlanId);
            if (response.success) {
                toast.success("Policy assigned to rate plan successfully");
                setPolicyToAssign(null);
                fetchPolicies();
            } else {
                toast.error(response.message || "Failed to assign policy");
            }
        } catch (error) {
            toast.error("Error assigning policy");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (policy: GroupedPolicy) => {
        setPolicyToEdit(policy);
        setEditForm({
            policyName: policy.policyName,
            description: policy.description || "",
        });
    };

    const handleConfirmEdit = async () => {
        if (!policyToEdit) return;
        if (!editForm.policyName.trim()) {
            toast.error("Policy name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await updatePolicyDetailsService(
                policyToEdit.id,
                editForm.policyName,
                editForm.description
            );
            if (response.success) {
                toast.success("Policy updated successfully");
                setPolicyToEdit(null);
                fetchPolicies();
            } else {
                toast.error(response.message || "Failed to update policy");
            }
        } catch (error) {
            toast.error("Error updating policy");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPolicyIcon = (type: PolicyTypes) => {
        switch (type) {
            case "cancellation": return <AlertCircle className="h-4 w-4" />;
            case "deposit": return <CreditCard className="h-4 w-4" />;
            case "guarantee": return <Shield className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: PolicyTypes) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    if (loading.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader text="Loading policies..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-Primary px-4 sm:px-6 lg:px-10 pb-12">
            <div className="mx-auto max-w-7xl space-y-6">
                <BackButton />

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#1e293b] flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a]">
                                Property Policies
                            </h1>
                            <p className="text-sm text-[#64748b]">
                                Manage cancellation, deposit, and guarantee policies
                            </p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#1e293b] text-white hover:bg-[#334155]">
                                <Plus className="mr-2 h-4 w-4" /> Add Policy
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Policy</DialogTitle>
                                <DialogDescription>
                                    Define the terms for your new policy.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Policy Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Standard Cancellation"
                                        value={newPolicy.policyName}
                                        onChange={(e) =>
                                            setNewPolicy({ ...newPolicy, policyName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Policy Type</Label>
                                    <Select
                                        value={newPolicy.type}
                                        onValueChange={(value: PolicyTypes) =>
                                            setNewPolicy({ ...newPolicy, type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cancellation">Cancellation</SelectItem>
                                            <SelectItem value="deposit">Deposit</SelectItem>
                                            <SelectItem value="guarantee">Guarantee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter policy details..."
                                        className="min-h-[100px]"
                                        value={newPolicy.description}
                                        onChange={(e) =>
                                            setNewPolicy({ ...newPolicy, description: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePolicy} disabled={isSubmitting} className="bg-[#1e293b] text-white hover:bg-[#334155]">
                                    {isSubmitting ? "Saving..." : "Save Policy"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Total", count: groupedPolicies.length, icon: <FileText className="h-5 w-5" /> },
                        { label: "Cancellation", count: groupedPolicies.filter((p) => p.type === "cancellation").length, icon: <AlertCircle className="h-5 w-5" /> },
                        { label: "Deposit", count: groupedPolicies.filter((p) => p.type === "deposit").length, icon: <CreditCard className="h-5 w-5" /> },
                        { label: "Guarantee", count: groupedPolicies.filter((p) => p.type === "guarantee").length, icon: <Shield className="h-5 w-5" /> },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-[#0f172a]">{stat.count}</p>
                                    <p className="text-xs font-medium text-[#94a3b8] mt-0.5">{stat.label}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#475569]">
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full max-w-md bg-white border border-[#e2e8f0] p-1 rounded-lg">
                        <TabsTrigger value="all" className="flex-1 rounded-md text-sm data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="cancellation" className="flex-1 rounded-md text-sm data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">Cancellation</TabsTrigger>
                        <TabsTrigger value="deposit" className="flex-1 rounded-md text-sm data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">Deposit</TabsTrigger>
                        <TabsTrigger value="guarantee" className="flex-1 rounded-md text-sm data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">Guarantee</TabsTrigger>
                    </TabsList>

                    <div className="mt-5">
                        {["all", "cancellation", "deposit", "guarantee"].map((tabValue) => (
                            <TabsContent key={tabValue} value={tabValue} className="mt-0">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {groupedPolicies
                                        .filter((p) => tabValue === "all" || p.type === tabValue)
                                        .map((policy) => (
                                            <div
                                                key={policy.id}
                                                className="group rounded-xl bg-white border border-[#e2e8f0] overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#cbd5e1]"
                                            >
                                                {/* Card header with dark strip */}
                                                <div className="bg-[#1e293b] px-5 py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center text-white">
                                                            {getPolicyIcon(policy.type)}
                                                        </div>
                                                        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                                                            {getTypeLabel(policy.type)}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuLabel className="text-xs text-[#94a3b8]">Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEditClick(policy)} className="cursor-pointer text-sm">
                                                                <Pencil className="mr-2 h-3.5 w-3.5 text-[#64748b]" />
                                                                Edit Policy
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAssignClick(policy)} className="cursor-pointer text-sm">
                                                                <Link2 className="mr-2 h-3.5 w-3.5 text-[#64748b]" />
                                                                Add to Rate Plan
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(policy)}
                                                                className="text-red-600 focus:text-red-600 cursor-pointer text-sm"
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* Card body */}
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-[#0f172a] leading-tight">
                                                            {policy.policyName}
                                                        </h3>
                                                        <p className="text-sm text-[#94a3b8] mt-1 line-clamp-2 leading-relaxed">
                                                            {policy.description || "No description provided."}
                                                        </p>
                                                    </div>

                                                    {/* Rate Plans */}
                                                    <div className="bg-Primary rounded-lg p-3 border border-[#f1f5f9]">
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <Tag className="h-3 w-3 text-[#94a3b8]" />
                                                            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">
                                                                Linked Rate Plans
                                                            </span>
                                                        </div>
                                                        {policy.ratePlans.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {policy.ratePlans.map((rp) => (
                                                                    <span
                                                                        key={rp.code}
                                                                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-medium text-[#475569] border border-[#e2e8f0]"
                                                                    >
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                                                                        {rp.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-[#cbd5e1] italic">
                                                                No rate plans linked
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Status */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${policy.ratePlans.length > 0 ? "text-[#22c55e]" : "text-[#cbd5e1]"}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${policy.ratePlans.length > 0 ? "bg-[#22c55e]" : "bg-[#cbd5e1]"}`} />
                                                            {policy.ratePlans.length > 0 ? "Active" : "Inactive"}
                                                        </div>
                                                        {policy.ratePlans.length > 0 && (
                                                            <span className="text-[11px] text-[#94a3b8]">
                                                                {policy.ratePlans.length} plan{policy.ratePlans.length > 1 ? "s" : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {groupedPolicies.filter((p) => tabValue === "all" || p.type === tabValue)
                                        .length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-white py-16 text-center">
                                                <div className="rounded-xl bg-[#f1f5f9] p-4">
                                                    <FileText className="h-8 w-8 text-[#94a3b8]" />
                                                </div>
                                                <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">
                                                    No policies found
                                                </h3>
                                                <p className="mt-1.5 text-sm text-[#94a3b8] max-w-xs">
                                                    {tabValue === "all"
                                                        ? "Get started by creating your first policy."
                                                        : `No ${tabValue} policies yet.`}
                                                </p>
                                                {tabValue === "all" && (
                                                    <Button
                                                        onClick={() => setIsDialogOpen(true)}
                                                        className="mt-4 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> Create Policy
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>

                {/* Delete Dialog */}
                <AlertDialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete "{policyToDelete?.policyName}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Assign to Rate Plan Dialog */}
                <Dialog open={!!policyToAssign} onOpenChange={(open) => !open && setPolicyToAssign(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add to Rate Plan</DialogTitle>
                            <DialogDescription>
                                Assign "{policyToAssign?.policyName}" to a rate plan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Select Rate Plan</Label>
                                <Select value={selectedRatePlanId} onValueChange={setSelectedRatePlanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a rate plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ratePlans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.ratePlanName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPolicyToAssign(null)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmAssign} disabled={isSubmitting} className="bg-[#1e293b] text-white hover:bg-[#334155]">
                                {isSubmitting ? "Assigning..." : "Add to Rate Plan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Policy Dialog */}
                <Dialog open={!!policyToEdit} onOpenChange={(open) => !open && setPolicyToEdit(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Policy</DialogTitle>
                            <DialogDescription>
                                Update the name and description for "{policyToEdit?.policyName}".
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Policy Name</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="e.g., Standard Cancellation"
                                    value={editForm.policyName}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, policyName: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Enter policy details..."
                                    className="min-h-[100px]"
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, description: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPolicyToEdit(null)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmEdit} disabled={isSubmitting} className="bg-[#1e293b] text-white hover:bg-[#334155]">
                                {isSubmitting ? "Updating..." : "Update Policy"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}