import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Shield, FileText, CreditCard, AlertCircle, Check, MoreVertical, Trash2, Link2 } from "lucide-react";
import { toast } from "react-hot-toast";
import BackButton from "@/components/shared/BackButton";
import Loader from "@/components/Loader/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createPolicyService, getPoliciesService, fetchRatePlansService, addPolicyToRatePlanService, deletePolicyService } from "./services";
import type { IPolicy, PolicyTypes, ICPolicy, RatePlan } from "./interfaces";

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

    // New state for actions
    const [policyToDelete, setPolicyToDelete] = useState<IPolicy | null>(null);
    const [policyToAssign, setPolicyToAssign] = useState<IPolicy | null>(null);
    const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>("");

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
        // setLoading({ isLoading: true, text: "Loading rate plans..." }); // Don't block UI for this
        try {
            const ratePlans = await fetchRatePlansService(propertyId);
            if (ratePlans.success) {
                // toast.success("Rate plans fetched successfully"); // Too noisy
                setRatePlans(ratePlans.data || []);
            }
            else {
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
                setNewPolicy({
                    policyName: "",
                    type: "cancellation",
                    description: "",
                });
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

    const handleDeleteClick = (policy: IPolicy) => {
        setPolicyToDelete(policy);
    };

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

    const handleAssignClick = (policy: IPolicy) => {
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
            } else {
                toast.error(response.message || "Failed to assign policy");
            }
        } catch (error) {
            toast.error("Error assigning policy");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPolicyIcon = (type: PolicyTypes) => {
        switch (type) {
            case "cancellation":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "deposit":
                return <CreditCard className="h-5 w-5 text-blue-500" />;
            case "guarantee":
                return <Shield className="h-5 w-5 text-green-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPolicyColor = (type: PolicyTypes) => {
        switch (type) {
            case "cancellation":
                return "bg-red-100 text-red-800 hover:bg-red-200";
            case "deposit":
                return "bg-blue-100 text-blue-800 hover:bg-blue-200";
            case "guarantee":
                return "bg-green-100 text-green-800 hover:bg-green-200";
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
    };

    if (loading.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader text="Loading policies..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 px-6 lg:px-10">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header Section */}
                <BackButton />
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Property Policies
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Manage cancellation, deposit, and guarantee policies for your property.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-black text-white hover:bg-gray-800">
                                <Plus className="mr-2 h-4 w-4" /> Add New Policy
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Policy</DialogTitle>
                                <DialogDescription>
                                    Define the terms for your new policy. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
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
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreatePolicy}
                                    disabled={isSubmitting}
                                    className="bg-black text-white hover:bg-gray-800"
                                >
                                    {isSubmitting ? "Saving..." : "Save Policy"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Content Section */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-4 bg-white p-1 shadow-sm">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="guarantee">Guarantee</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {["all", "cancellation", "deposit", "guarantee"].map((tabValue) => (
                            <TabsContent key={tabValue} value={tabValue} className="mt-0">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {policies
                                        .filter(
                                            (p) => tabValue === "all" || p.type === tabValue
                                        )
                                        .map((policy) => (
                                            <Card
                                                key={policy.id}
                                                className="group relative overflow-hidden transition-all hover:shadow-md"
                                            >
                                                <div className={`absolute left-0 top-0 h-full w-1 ${getPolicyColor(policy.type).split(" ")[0].replace("bg-", "bg-opacity-100 bg-")}`} />
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {getPolicyIcon(policy.type)}
                                                            <Badge
                                                                variant="secondary"
                                                                className={`capitalize ${getPolicyColor(policy.type)}`}
                                                            >
                                                                {policy.type}
                                                            </Badge>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleAssignClick(policy)}>
                                                                    <Link2 className="mr-2 h-4 w-4" />
                                                                    Add to Rate Plan
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteClick(policy)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <CardTitle className="mt-3 text-lg font-semibold flex items-center gap-2">
                                                        {policy.policyName}
                                                        {policy.ratePlanName && (
                                                            <Badge variant="outline" className="text-xs font-normal text-gray-500">
                                                                {policy.ratePlanName}
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
                                                        {policy.description || "No description provided."}
                                                    </p>
                                                    <div className={`mt-4 flex items-center gap-2 text-xs ${policy.ratePlanName ? "text-green-600" : "text-gray-400"}`}>
                                                        {policy.ratePlanName ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                        <span>{policy.ratePlanName ? "Active" : "Inactive"}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    {policies.filter((p) => tabValue === "all" || p.type === tabValue)
                                        .length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white py-12 text-center">
                                                <div className="rounded-full bg-gray-50 p-4">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                                    No policies found
                                                </h3>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {tabValue === "all"
                                                        ? "Get started by creating your first policy."
                                                        : `No ${tabValue} policies found.`}
                                                </p>
                                                {tabValue === "all" && (
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setIsDialogOpen(true)}
                                                        className="mt-2 text-black"
                                                    >
                                                        Create one now
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the policy
                                "{policyToDelete?.policyName}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleConfirmDelete();
                                }}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Add to Rate Plan Dialog */}
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
                                <Label htmlFor="ratePlan">Select Rate Plan</Label>
                                <Select
                                    value={selectedRatePlanId}
                                    onValueChange={setSelectedRatePlanId}
                                >
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
                            <Button
                                variant="outline"
                                onClick={() => setPolicyToAssign(null)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAssign}
                                disabled={isSubmitting}
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                {isSubmitting ? "Assigning..." : "Add to Rate Plan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}