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
import { languages } from "@/components/language/language";
import { upsertPolicyTranslationService, getAllPolicyTranslationsService, deletePolicyTranslationLocaleService } from "./services/policy-multilang.services";
import { EditTranslationDialog } from "@/pages/management/components/multilang/ManagementTranslationDialogs";
import { usePropertyContext } from "@/contexts/PropertyContext";
import { useTranslation } from "react-i18next";

interface GroupedPolicy {
    id: string;
    policyName: string;
    type: PolicyTypes;
    description?: string;
    propertyId: string;
    ratePlans: { code: string; name: string,_translations?:{ratePlanName:string} }[];
    _translations?: {
        policyName: string;
        description: string;
    }
}

export default function PoliciesPage() {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();

    const { languages: propertyLanguages } = usePropertyContext();
    const availableLanguages = propertyLanguages && propertyLanguages.length > 0
        ? languages.filter((l) => propertyLanguages.some((pl) => pl.language === l.code))
        : languages;
    const [policies, setPolicies] = useState<IPolicy[]>([]);
    const [loading, setLoading] = useState<{
        isLoading: boolean;
        text: string;
    }>({ isLoading: false, text: t("Policies.loadingPolicies") });
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

    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
    const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
    const [isCheckLanguagesOpen, setIsCheckLanguagesOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("");
    const [langForm, setLangForm] = useState({ policyName: "", description: "" });
    const [langTranslations, setLangTranslations] = useState<Record<string, any>>({});
    const [langLoading, setLangLoading] = useState(false);
    const [langSubmitting, setLangSubmitting] = useState(false);
    const [editLangDialog, setEditLangDialog] = useState<{ open: boolean; locale: string; data: Record<string, any> }>({ open: false, locale: "", data: {} });

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
                            _translations: ratePlans.find((singleRatePlan: RatePlan) => singleRatePlan.ratePlanCode === policy.ratePlanCode)?._translations
                        });
                    }
                }
            } else {
                let initialTranslations;
                if (policy.ratePlanName && policy.ratePlanCode) {
                    initialTranslations = ratePlans.find((singleRatePlan: RatePlan) => singleRatePlan.ratePlanCode === policy.ratePlanCode)?._translations;
                }

                map.set(policy.id, {
                    id: policy.id,
                    policyName: policy.policyName,
                    type: policy.type,
                    description: policy.description,
                    propertyId: policy.propertyId,
                    ratePlans:
                        policy.ratePlanName && policy.ratePlanCode
                            ? [{ code: policy.ratePlanCode, name: policy.ratePlanName, _translations: initialTranslations }]
                            : [],
                    _translations: policy._translations
                });
            }
        });
        return Array.from(map.values());
    }, [policies, ratePlans]);

    const fetchPolicies = async () => {
        if (!propertyId) return;
        setLoading({ isLoading: true, text: t("Policies.loadingPolicies") });
        try {
            const response = await getPoliciesService(propertyId);
            if (response.success && response.data) {
                setPolicies(response.data.allPolicies || []);
            } else {
                toast.error(t("Policies.") + (response.message || t("Policies.failedToFetchPolicies")));
            }
        } catch (error) {
            toast.error(t("Policies.errorFetchingPolicies"));
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
                console.error(t("Policies.") + (ratePlans.message || t("Policies.failedToFetchRatePlans")));
            }
        } catch (error) {
            console.error(t("Policies.errorFetchingRatePlans"));
        }
    };

    useEffect(() => {
        if (!propertyId) {
            toast.error(t("Policies.propertyIdMissing"));
            return;
        }
        fetchPolicies();
        fetchRatePlans(propertyId);
    }, [propertyId]);

    const handleCreatePolicy = async () => {
        if (!propertyId) return;
        if (!newPolicy.policyName.trim()) {
            toast.error(t("Policies.policyNameRequired"));
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
                toast.success(t("Policies.policyCreated"));
                setNewPolicy({ policyName: "", type: "cancellation", description: "" });
                setIsDialogOpen(false);
                fetchPolicies();
            } else {
                toast.error(t("Policies.") + (response.message || t("Policies.failedToCreatePolicy")));
            }
        } catch (error) {
            toast.error(t("Policies.errorCreatingPolicy"));
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
                toast.success(t("Policies.policyDeleted"));
                fetchPolicies();
            } else {
                toast.error(t("Policies.") + (response.message || t("Policies.failedToDeletePolicy")));
            }
        } catch (error) {
            toast.error(t("Policies.errorDeletingPolicy"));
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
            if (!selectedRatePlanId) toast.error(t("Policies.selectRatePlanError"));
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await addPolicyToRatePlanService(policyToAssign.id, selectedRatePlanId);
            if (response.success) {
                toast.success(t("Policies.policyAssigned"));
                setPolicyToAssign(null);
                fetchPolicies();
            } else {
                toast.error(t("Policies.") + (response.message || t("Policies.failedToAssignPolicy")));
            }
        } catch (error) {
            toast.error(t("Policies.errorAssigningPolicy"));
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
            toast.error(t("Policies.policyNameRequired"));
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
                toast.success(t("Policies.policyUpdated"));
                setPolicyToEdit(null);
                fetchPolicies();
            } else {
                toast.error(t("Policies.") + (response.message || t("Policies.failedToUpdatePolicy")));
            }
        } catch (error) {
            toast.error(t("Policies.errorUpdatingPolicy"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveLanguage = async () => {
        if (!selectedPolicyId || !selectedLang) {
            toast.error(t("Policies.pleaseSelectLanguage", "Please select a language"));
            return;
        }
        if (!langForm.policyName && !langForm.description) {
            toast.error(t("Policies.fillTranslatedField", "Fill at least one translated field"));
            return;
        }
        setLangSubmitting(true);
        const payload = { [selectedLang]: { policyName: langForm.policyName, description: langForm.description } };
        const res = await upsertPolicyTranslationService(selectedPolicyId, payload);
        if (res.success) {
            toast.success(t("Policies.translationSaved", "Translation saved"));
            setIsAddLanguageOpen(false);
            setLangForm({ policyName: "", description: "" });
            setSelectedLang("");
        } else {
            toast.error(res.message || t("Policies.failedToSaveTranslation", "Failed to save translation"));
        }
        setLangSubmitting(false);
    };

    const fetchPolicyTranslations = async (id: string) => {
        setLangLoading(true);
        const res = await getAllPolicyTranslationsService(id);
        if (res.success && res.data) {
            setLangTranslations(res.data);
        } else {
            setLangTranslations({});
        }
        setLangLoading(false);
    };

    const handleDeleteLocale = async (locale: string) => {
        if (!selectedPolicyId) return;
        const res = await deletePolicyTranslationLocaleService(selectedPolicyId, locale);
        if (res.success) {
            toast.success(t("Policies.translationDeleted", "Translation deleted"));
            const updated = { ...langTranslations };
            delete updated[locale];
            setLangTranslations(updated);
        } else {
            toast.error(res.message || t("Policies.failedToDeleteTranslation", "Failed to delete translation"));
        }
    };

    const getLangName = (code: string) => languages.find((l) => l.code === code)?.name || code;

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
                <Loader text={t("Policies.loadingPolicies")} />
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
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a]">
                                {t("Policies.title")}
                            </h1>
                            <p className="text-sm text-[#64748b]">
                                {t("Policies.managePolicies")}
                            </p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-white hover:bg-primary/80">
                                <Plus className="mr-2 h-4 w-4" /> {t("Policies.addPolicy")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{t("Policies.createNewPolicy")}</DialogTitle>
                                <DialogDescription>
                                    {t("Policies.defineTerms")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t("Policies.policyName")}</Label>
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
                                    <Label htmlFor="type">{t("Policies.policyType")}</Label>
                                    <Select
                                        value={newPolicy.type}
                                        onValueChange={(value: PolicyTypes) =>
                                            setNewPolicy({ ...newPolicy, type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("Policies.selectType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cancellation">{t("Policies.cancellation")}</SelectItem>
                                            <SelectItem value="deposit">{t("Policies.deposit")}</SelectItem>
                                            <SelectItem value="guarantee">{t("Policies.guarantee")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">{t("Policies.description")}</Label>
                                    <Textarea
                                        id="description"
                                        placeholder={t("Policies.enterPolicyDetails")}
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
                                    {t("Policies.cancel")}
                                </Button>
                                <Button onClick={handleCreatePolicy} disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                                    {isSubmitting ? t("Policies.saving") : t("Policies.savePolicy")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: t("Policies.total"), count: groupedPolicies.length, icon: <FileText className="h-5 w-5" /> },
                        { label: t("Policies.cancellation"), count: groupedPolicies.filter((p) => p.type === "cancellation").length, icon: <AlertCircle className="h-5 w-5" /> },
                        { label: t("Policies.deposit"), count: groupedPolicies.filter((p) => p.type === "deposit").length, icon: <CreditCard className="h-5 w-5" /> },
                        { label: t("Policies.guarantee"), count: groupedPolicies.filter((p) => p.type === "guarantee").length, icon: <Shield className="h-5 w-5" /> },
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
                        <TabsTrigger value="all" className="flex-1 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-white">{t("Policies.all")}</TabsTrigger>
                        <TabsTrigger value="cancellation" className="flex-1 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-white">{t("Policies.cancellation")}</TabsTrigger>
                        <TabsTrigger value="deposit" className="flex-1 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-white">{t("Policies.deposit")}</TabsTrigger>
                        <TabsTrigger value="guarantee" className="flex-1 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-white">{t("Policies.guarantee")}</TabsTrigger>
                    </TabsList>

                    <div className="mt-5">
                        {["all", "cancellation", "deposit", "guarantee"].map((tabValue) => (
                            <TabsContent key={tabValue} value={tabValue} className="mt-0">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {groupedPolicies
                                        .filter((p) => tabValue === "all" || p.type === tabValue)
                                        .map((policy) => {
                                            const displayName = policy._translations?policy._translations?.policyName:policy.policyName;
                                            
                                            return (
                                                <div
                                                    key={policy.id}
                                                    className="group rounded-xl bg-white border border-[#e2e8f0] overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#cbd5e1]"
                                                >
                                                    {/* Card header with dark strip */}
                                                    <div className="bg-primary px-5 py-3 flex items-center justify-between">
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
                                                                <DropdownMenuLabel className="text-xs text-[#94a3b8]">{t("Policies.actions")}</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleEditClick(policy)} className="cursor-pointer text-sm">
                                                                    <Pencil className="mr-2 h-3.5 w-3.5 text-[#64748b]" />
                                                                    {t("Policies.editPolicy")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleAssignClick(policy)} className="cursor-pointer text-sm">
                                                                    <Link2 className="mr-2 h-3.5 w-3.5 text-[#64748b]" />
                                                                    {t("Policies.addToRatePlan")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedPolicyId(policy.id);
                                                                        setLangForm({ policyName: "", description: "" });
                                                                        setSelectedLang("");
                                                                        setIsAddLanguageOpen(true);
                                                                    }}
                                                                    className="cursor-pointer text-sm"
                                                                >
                                                                    {t("Policies.addLanguage", "Add Language")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedPolicyId(policy.id);
                                                                        fetchPolicyTranslations(policy.id);
                                                                        setIsCheckLanguagesOpen(true);
                                                                    }}
                                                                    className="cursor-pointer text-sm"
                                                                >
                                                                    {t("Policies.checkLanguages", "Check Languages")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteClick(policy)}
                                                                    className="text-red-600 focus:text-red-600 cursor-pointer text-sm"
                                                                >
                                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                    {t("Policies.delete")}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="p-5 space-y-4">
                                                        <div>
                                                            <h3 className="text-base font-semibold text-[#0f172a] leading-tight">
                                                                {displayName}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                                {policy._translations?.description ?? policy.description ?? "No description provided."}
                                                            </p>
                                                        </div>

                                                        {/* Rate Plans */}
                                                        <div className="bg-Primary rounded-lg p-3 border border-[#f1f5f9]">
                                                            <div className="flex items-center gap-1.5 mb-2">
                                                                <Tag className="h-3 w-3 text-gray-500" />
                                                                <span className="text-[10px] font-semibold text-gray-500 ">
                                                                    {t("Policies.linkedRatePlans")}
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
                                                                            {rp._translations?rp._translations.ratePlanName:rp.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-[#cbd5e1]">
                                                                    {t("Policies.noRatePlansLinked")}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Status */}
                                                        <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${policy.ratePlans.length > 0 ? "text-[#22c55e]" : "text-[#cbd5e1]"}`}>
                                                                <span className={`h-1.5 w-1.5 rounded-full ${policy.ratePlans.length > 0 ? "bg-[#22c55e]" : "bg-[#cbd5e1]"}`} />
                                                                {policy.ratePlans.length > 0 ? t("Policies.active") : t("Policies.inactive")}
                                                            </div>
                                                            {policy.ratePlans.length > 0 && (
                                                                <span className="text-[11px] text-[#94a3b8]">
                                                                    {policy.ratePlans.length} {policy.ratePlans.length > 1 ? t("Policies.plans") : t("Policies.plan")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {groupedPolicies.filter((p) => tabValue === "all" || p.type === tabValue)
                                        .length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-white py-16 text-center">
                                                <div className="rounded-xl bg-[#f1f5f9] p-4">
                                                    <FileText className="h-8 w-8 text-[#94a3b8]" />
                                                </div>
                                                <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">
                                                    {t("Policies.noPoliciesFound", "No policies found")}
                                                </h3>
                                                <p className="mt-1.5 text-sm text-[#94a3b8] max-w-xs">
                                                    {tabValue === "all"
                                                        ? t("Policies.getStartedCreating", "Get started by creating your first policy.")
                                                        : t("Policies.noPoliciesYet", { type: tabValue, defaultValue: `No ${tabValue} policies yet.` })}
                                                </p>
                                                {tabValue === "all" && (
                                                    <Button
                                                        onClick={() => setIsDialogOpen(true)}
                                                        className="mt-4 bg-[#1e293b] text-white hover:bg-[#334155]"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> {t("Policies.createPolicy", "Create Policy")}
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
                            <AlertDialogTitle>{t("Policies.deleteConfirmTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("Policies.deleteConfirmDescription", { name: policyToDelete?.policyName })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>{t("Policies.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t("Policies.deleting") : t("Policies.delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Assign to Rate Plan Dialog */}
                <Dialog open={!!policyToAssign} onOpenChange={(open) => !open && setPolicyToAssign(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t("Policies.addToRatePlanDialog")}</DialogTitle>
                            <DialogDescription>
                                {t("Policies.assignToRatePlan", { name: policyToAssign?.policyName })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>{t("Policies.selectRatePlan")}</Label>
                                <Select value={selectedRatePlanId} onValueChange={setSelectedRatePlanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("Policies.selectRatePlanPlaceholder")} />
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
                                {t("Policies.cancel")}
                            </Button>
                            <Button onClick={handleConfirmAssign} disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                                {isSubmitting ? t("Policies.assigning") : t("Policies.addToRatePlan")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Policy Dialog */}
                <Dialog open={!!policyToEdit} onOpenChange={(open) => !open && setPolicyToEdit(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{t("Policies.editPolicyDialog")}</DialogTitle>
                            <DialogDescription>
                                {t("Policies.updatePolicyName", { name: policyToEdit?.policyName })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">{t("Policies.policyName")}</Label>
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
                                <Label htmlFor="edit-description">{t("Policies.description")}</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder={t("Policies.enterPolicyDetails", "Enter policy details...")}
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
                                {t("Policies.cancel")}
                            </Button>
                            <Button onClick={handleConfirmEdit} disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/80">
                                {isSubmitting ? t("Policies.updating", "Updating...") : t("Policies.updatePolicy")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Add Language Dialog */}
                <Dialog open={isAddLanguageOpen} onOpenChange={(open) => { setIsAddLanguageOpen(open); if (!open) { setSelectedLang(""); setLangForm({ policyName: "", description: "" }); } }}>
                    <DialogContent className="sm:max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>{t("Policies.addTranslation", "Add Translation")}</DialogTitle>
                            <DialogDescription>{t("Policies.addTranslationDesc", "Add a translation for this policy.")}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>{t("Policies.language", "Language")}</Label>
                                <Select value={selectedLang} onValueChange={setSelectedLang}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("Policies.selectLanguage", "Select Language")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLanguages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>{t("Policies.policyName")}</Label>
                                <Input
                                    placeholder={t("Policies.translatedPolicyName", "Translated policy name")}
                                    value={langForm.policyName}
                                    onChange={(e) => setLangForm({ ...langForm, policyName: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>{t("Policies.description")}</Label>
                                <Textarea
                                    placeholder={t("Policies.translatedDescription", "Translated description")}
                                    className="min-h-[90px]"
                                    value={langForm.description}
                                    onChange={(e) => setLangForm({ ...langForm, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddLanguageOpen(false)} disabled={langSubmitting}>{t("Policies.cancel")}</Button>
                            <Button onClick={handleSaveLanguage} disabled={langSubmitting} className="bg-primary text-white hover:bg-primary/80">
                                {langSubmitting ? t("Policies.saving") : t("Policies.saveTranslation", "Save Translation")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Check Languages Dialog */}
                <Dialog open={isCheckLanguagesOpen} onOpenChange={setIsCheckLanguagesOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>{t("Policies.availableTranslations", "Available Translations")}</DialogTitle>
                            <DialogDescription>{t("Policies.allSavedTranslations", "All saved translations for this policy.")}</DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-3 max-h-[360px] overflow-y-auto">
                            {langLoading ? (
                                <p className="text-sm text-[#94a3b8] text-center py-6">{t("Policies.loadingTranslations", "Loading translations...")}</p>
                            ) : Object.keys(langTranslations).length === 0 ? (
                                <p className="text-sm text-[#94a3b8] text-center py-6">{t("Policies.noTranslationsFound", "No translations found.")}</p>
                            ) : (
                                Object.entries(langTranslations).map(([locale, data]) => (
                                    <div key={locale} className="flex items-start justify-between border border-[#e2e8f0] rounded-lg p-3 gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-[#0f172a]">{getLangName(locale)}</p>
                                            {data.policyName && <p className="text-xs text-[#475569]">{t("Policies.name", "Name")}: {data.policyName}</p>}
                                            {data.description && <p className="text-xs text-[#94a3b8] line-clamp-2">{t("Policies.desc", "Desc")}: {data.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100"
                                                title={t("Policies.editTranslation", "Edit translation")}
                                                onClick={() => setEditLangDialog({ open: true, locale, data })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="shrink-0"
                                                onClick={() => handleDeleteLocale(locale)}
                                            >
                                                {t("Policies.delete")}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Policy Translation Dialog */}
                {selectedPolicyId && (
                    <EditTranslationDialog
                        open={editLangDialog.open}
                        onOpenChange={(open) => setEditLangDialog(prev => ({ ...prev, open }))}
                        entityId={selectedPolicyId}
                        locale={editLangDialog.locale}
                        initialData={editLangDialog.data}
                        title={t("Policies.editPolicyTranslation", "Edit Policy Translation")}
                        fields={[
                            { key: "policyName", label: t("Policies.policyName"), placeholder: t("Policies.translatedPolicyName", "Translated policy name") },
                            { key: "description", label: t("Policies.description"), placeholder: t("Policies.translatedDescription", "Translated description") },
                        ]}
                        onSave={async (id, locale, data) => upsertPolicyTranslationService(id, { [locale]: data })}
                    />
                )}
            </div>
        </div>
    );
}