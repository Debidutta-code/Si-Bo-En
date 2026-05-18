import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPropertyCreationId, getUsersForMapping } from "../service/creation-filter.service"
import { assignUserToProperty } from "../api/api"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { IPropertyCreations, HotelManagerMapping, IpropertyCDetails } from '../types/types';
import Loader from '@/components/Loader/Loader';
import BackButton from '@/components/shared/BackButton';
import { User2Icon, Settings, MoreVertical, CloudCog, Upload, Trash2, Languages, X, Check, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/redux/hooks';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageSlider from '@/components/shared/ImageSlider';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import { updateCreationService } from '../service/creation-filter.service';
import type { IUpdateCreation } from '../types/types';
import {
    fetchPropertyConfigService,
    updatePropertyConfigService,
    createPropertyIntegrationService,
    updatePropertyIntegrationStatusService,
    getAllPartnerIntegrationsService,
    addPropertyIntegrationFieldService,
    updatePropertyIntegrationFieldService,
    deletePropertyIntegrationFieldService,
} from "./services";
import type {
    IUPropertyConfig,
    IMasterPartnersWProperty,
    IPropertyActiveLanguage
} from "./types";
import DeleteCreationDialog from '@/components/creation/Delete-Creation.dialog';
import IntegrationDialog from './components/IntegrationDialog';
import PropertyConfigDialog from './components/PropertyConfigDialog';
import ViewIntegrationDetailsDialog from './components/ViewIntegrationDetailsDialog';
import ManageIntegrationFieldsDialog from './components/ManageIntegrationFieldsDialog';
import { Award, FileText, LayoutDashboard, Shield, Users as UsersIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { capitalizeFirstLetter } from '@/lib/utils';
import {
    addPropertyLanguageService,
    deletePropertyLanguageService,
    getPropertyLanguagesService,
} from "./services/property-language.services"
import { languages, type LanguageCode } from '@/components/language/language';
import { Plus, Globe } from "lucide-react";
import AddCreationLanguageDialog from "@/components/creation/AddCreationLanguageDialog";
import CheckCreationLanguagesDialog from "@/components/creation/CheckCreationLanguagesDialog";


export default function PropertyPage() {
    const { user } = useAppSelector((state) => state.user);
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState<boolean>(false)
    const { creationId } = useParams<{ creationId: string }>();
    const [propertyConfig, setPropertyConfig] = useState<IUPropertyConfig>({
        channelManagerIntegrationActive: false,
        pmsIntegrationActive: false,
        reservationResetMinutes: 570,
        selfAriActive: false,
        isB2bAvailable: false,
        isB2cAvailable: false,
        commission: false,
        showVideo: true,
        timezone: "Asia/Kolkata",
        baseCurrency: "INR"
    })
    const [masterPartners, setMasterPartners] = useState<IMasterPartnersWProperty[]>([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isIntegrating, setIsIntegrating] = useState<{ [key: string]: boolean }>({});
    const [creationDetails, setCreationDetails] = useState<IpropertyCDetails>({
        id: '',
        name: "",
        images: [],
        isActive: false,
        createdAt: "",
        under: "",
        users: [],
        _translations: {
            name:""
      }

    });
    const [propertyDetails, setPropertyDetails] = useState<IPropertyCreations | null>(null);
    const [isCreationCompleted, setIsCreationCompleted] = useState<boolean>(false);
    const [isDrafted, setIsDrafted] = useState<boolean>(false);
    const roles = [
        { value: "hotel_manager", label: "Hotel Manager" },
        { value: "staff", label: "Staff" },
        { value: "spa_manager", label: "Spa Manager" },
    ];
    const [selectedRole, setSelectedRole] = useState<string>(roles[0].value);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [users, setUsers] = useState<HotelManagerMapping>({
        hotelManagers: [],
        staffs: [],
        revenueManagers: [],
        spaManagers: []
    });
    const [isAssigningUser, setIsAssigningUser] = useState<boolean>(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<IMasterPartnersWProperty | null>(null);
    const [isPropertyConfigDialogOpen, setIsPropertyConfigDialogOpen] = useState(false);
    const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
    const [isManageFieldsDialogOpen, setIsManageFieldsDialogOpen] = useState(false);
    const [updatePropertyDetails, setUpdatePropertyDetails] = useState<IUpdateCreation>({
        id: creationDetails.id,
        name: creationDetails.name,
        images: creationDetails.images,
        isActive: creationDetails.isActive
    });

    const [propertyLanguages, setPropertyLanguages] = useState<IPropertyActiveLanguage[]>([]);

    const refreshLanguages = async () => {
        if (!propertyDetails?.id) return;
        const response = await getPropertyLanguagesService(propertyDetails.id);
        if (response.success && response.data) {
            setPropertyLanguages(response.data);
        }
    };

    const [isLangPanelOpen, setIsLangPanelOpen] = useState(false);
    const [isDeletingLang, setIsDeletingLang] = useState<string | null>(null);
    const [isAddingLang, setIsAddingLang] = useState<string | null>(null);

    const [addTranslationDialogOpen, setAddTranslationDialogOpen] = useState(false);
    const [checkTranslationsDialogOpen, setCheckTranslationsDialogOpen] = useState(false);

    useEffect(() => {
        initialFetch();
    }, [creationId, navigate]);

    const initialFetch = async () => {
        await Promise.all([
            fetchProperty(),
            fetchUsers()
        ]);
    };

    const fetchProperty = async () => {
        try {
            if (!creationId) {
                navigate('/app/property');
                return;
            }
            const response = await getPropertyCreationId(creationId);
            if (response.success) {
                console.log(response.data)
                setIsCreationCompleted(response.isPropertyCreated);
                setCreationDetails(response.data.creationData);
                setPropertyDetails(response.data.propertyDetails);
                setIsDrafted(response.data.propertyDetails.isDrafted);
                fetchPartners(response.data.propertyDetails.id);
            } else {
                toast.error(response.message || "Failed to fetch property");
            }
        } catch (error) {
            console.error("Error fetching property:", error);
            toast.error("Failed to fetch property");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPartners = async (propertyId: string) => {
        try {
            if (!user || user.role != "super_admin") return;
            if (!propertyId) return;
            const response = await getAllPartnerIntegrationsService(propertyId);
            if (response.success) {
                setMasterPartners(response.data);
            } else {
                toast.error(response.message || "Failed to fetch partners");
            }
        } catch (error) {
            console.error("Error fetching partners:", error);
            toast.error("Failed to fetch partners");
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await getUsersForMapping();
            if (response.success) {
                setUsers(response.data);
            } else {
                toast.error(response.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        }
    }

    const updatePropertyConfig = async () => {
        if (user?.role != "super_admin") {
            toast.error("Only SuperAdmin can update the config");
            return;
        }
        if (!propertyDetails?.id) {
            toast.error("Property Not Selected");
            return;
        }
        try {
            setIsLoading(true);
            const response = await updatePropertyConfigService(propertyDetails.id, propertyConfig);
            if (response.success) {
                toast.success("property Config Updated successfully");
                fetchPropertyConfig(propertyDetails.id);
            } else {
                toast.error(response.message || "Failed to update Property config");
            }
        } catch (error) {
            toast.error("Failed to Update Property");
        } finally {
            setIsLoading(false);
        }
    }

    const fetchPropertyConfig = async (creationId: string) => {
        if (user?.role != "super_admin") return;
        if (!creationId) {
            toast.error("Property Not Selected");
            return;
        }
        try {
            setIsLoading(true);
            const response = await fetchPropertyConfigService(creationId);
            if (response.success) {
                setPropertyConfig(response.data);
            } else {
                toast.error(response.message || "Failed to fetch Property config");
            }
        } catch (error) {
            toast.error("Failed to fetch Property config");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (propertyDetails?.id) {
            fetchPropertyConfig(propertyDetails.id);
            refreshLanguages();
        }
    }, [propertyDetails]);


    const handleCreateProperty = () => {
        if (!propertyDetails?.id) {
            navigate(`/property/create?creationId=${creationId}`);
        } else {
            navigate(`/property/create?propertyId=${propertyDetails?.id}`);
        }
    };

    const handleEditProperty = () => {
        navigate(`/property/${propertyDetails?.id}?creationId=${creationId}`);
    };

    const handleAddMember = async () => {
        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        setIsAssigningUser(true);
        try {
            if (!creationDetails?.id) {
                toast.error("Creation ID is missing");
                setIsAssigningUser(false);
                return;
            }
            const response = await assignUserToProperty({
                creationId: creationDetails?.id,
                userId: selectedUser,
                role: selectedRole
            });
            if (response.success) {
                toast.success("User assigned successfully");
                setSelectedUser('');
                setAddMemberDialogOpen(false);
                initialFetch();
            } else {
                toast.error(response.message || "Failed to assign user");
            }
        } catch (error) {
            console.error("Error assigning user:", error);
            toast.error("Failed to assign user");
        } finally {
            setIsAssigningUser(false);
        }
    };

    const openUpdateDialog = () => {
        setUpdatePropertyDetails({
            id: creationDetails.id,
            name: creationDetails.name,
            images: creationDetails.images,
            isActive: creationDetails.isActive
        });
        setIsUpdateDialogOpen(true);
    };

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setUpdatePropertyDetails(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    };

    const handleRemoveImage = (index: number) => {
        setUpdatePropertyDetails(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateProperty = async () => {
        if (!creationId) {
            toast.error('Invalid Property ID');
            return;
        }
        try {
            const response = await updateCreationService(creationId, updatePropertyDetails.name, updatePropertyDetails.images, updatePropertyDetails.isActive);
            if (!response.success) {
                toast.error(response.message || 'Failed to update property');
                return;
            }
            toast.success('Property updated successfully');
            window.location.reload();
        } catch (err: any) {
            toast.error('Failed to update property');
        }
    };

    // ── Language handlers ────────────────────────────────────────────
    const handleAddLanguage = async (languageCode: LanguageCode) => {
        if (!propertyDetails?.id) return;
        setIsAddingLang(languageCode);
        try {
            const response = await addPropertyLanguageService({
                propertyId: propertyDetails.id,
                language: languageCode,
            });
            if (response.success) {
                toast.success("Language added");
                refreshLanguages();
            } else {
                toast.error(response.message || "Failed to add language");
            }
        } catch {
            toast.error("Failed to add language");
        } finally {
            setIsAddingLang(null);
        }
    };

    const handleDeleteLanguage = async (propertyLanguageId: string) => {
        setIsDeletingLang(propertyLanguageId);
        try {
            const response = await deletePropertyLanguageService(propertyLanguageId);
            if (response.success) {
                toast.success("Language removed");
                refreshLanguages();
            } else {
                toast.error(response.message || "Failed to remove language");
            }
        } catch {
            toast.error("Failed to remove language");
        } finally {
            setIsDeletingLang(null);
        }
    };
    // ────────────────────────────────────────────────────────────────

    // Integration handlers
    const handleIntegrateClick = (partner: IMasterPartnersWProperty) => {
        setSelectedPartner(partner);
        setIsIntegrationDialogOpen(true);
    };

    const handleIntegrationSubmit = async (data: {
        propertyId: string;
        masterIntegrationId: string;
        fields: Array<{ requiredFieldId: string; value: string }>;
    }) => {
        try {
            const response = await createPropertyIntegrationService(data);
            if (response.success) {
                toast.success(`Successfully integrated with ${selectedPartner?.name}`);
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
            } else {
                toast.error(response.message || 'Failed to integrate');
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to integrate');
            throw error;
        }
    };

    const handleIntegrationSuccess = () => { };

    const handleToggleIntegrationStatus = async (integrationId: string, currentStatus: boolean) => {
        setIsIntegrating(prev => ({ ...prev, [integrationId]: true }));
        try {
            const newStatus = !currentStatus;
            const response = await updatePropertyIntegrationStatusService(integrationId, newStatus);
            if (response.success) {
                toast.success(`Integration ${newStatus ? 'activated' : 'deactivated'} successfully`);
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
            } else {
                toast.error(response.message || 'Failed to update integration status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update integration status');
        } finally {
            setIsIntegrating(prev => ({ ...prev, [integrationId]: false }));
        }
    };

    const handleViewIntegrationDetails = (partner: IMasterPartnersWProperty) => {
        setSelectedPartner(partner);
        setIsViewDetailsDialogOpen(true);
    };

    const handleManageIntegrationFields = (partner: IMasterPartnersWProperty) => {
        setSelectedPartner(partner);
        setIsManageFieldsDialogOpen(true);
    };

    const handleAddIntegrationField = async (integrationId: string, data: { requiredFieldId: string; value: string }) => {
        try {
            const response = await addPropertyIntegrationFieldService(integrationId, data);
            if (response.success) {
                toast.success('Field added successfully');
                if (propertyDetails?.id) await fetchPartners(propertyDetails.id);
            } else {
                toast.error(response.message || 'Failed to add field');
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to add field');
            throw error;
        }
    };

    const handleUpdateIntegrationField = async (fieldId: string, value: string) => {
        try {
            const response = await updatePropertyIntegrationFieldService(fieldId, { value });
            if (response.success) {
                toast.success('Field updated successfully');
                if (propertyDetails?.id) await fetchPartners(propertyDetails.id);
            } else {
                toast.error(response.message || 'Failed to update field');
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update field');
            throw error;
        }
    };

    const handleDeleteIntegrationField = async (fieldId: string) => {
        try {
            const response = await deletePropertyIntegrationFieldService(fieldId);
            if (response.success) {
                toast.success('Field deleted successfully');
                if (propertyDetails?.id) await fetchPartners(propertyDetails.id);
            } else {
                toast.error(response.message || 'Failed to delete field');
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete field');
            throw error;
        }
    };

    if (isLoading) {
        return (
            <div className='min-h-screen w-full flex justify-center items-center'>
                <Loader text={`Loading your Property ...`} />
            </div>
        );
    }

    if (!creationDetails) {
        return (
            <div className="space-y-6 p-4">
                <BackButton />
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-red-300">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Property Not Found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        The property you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => navigate('/app/property')} className="mt-4">
                        Go Back to Properties
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <BackButton />

            {/* Property Details Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
                {creationDetails?.images && creationDetails.images.length > 0 && (
                    <div className="w-full">
                        <ImageSlider
                            images={creationDetails.images}
                            alt={creationDetails.name}
                            height="h-80"
                        />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {creationDetails?._translations?creationDetails._translations.name:creationDetails.name}
                            </h1>
                            <div className="flex items-center space-x-3">
                                <p className="text-sm text-gray-600">
                                    {isDrafted
                                        ? "Manage your hotel property and its performance"
                                        : "Complete your property setup to start managing"}
                                </p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDrafted
                                    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                    : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
                                    }`}>
                                    {isDrafted ? '● Active' : '● Setup Required'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar with Dropdown */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Property Management</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure and manage your property settings
                    </p>
                </div>
                <div className='flex'>
                    <div className="px-2">
                        {isCreationCompleted ? (
                            <Button onClick={handleEditProperty} className="w-full">
                                View Property
                            </Button>
                        ) : (
                            <Button onClick={handleCreateProperty} className="w-full">
                                Complete Property Setup
                            </Button>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 space-y-2">
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openUpdateDialog(); }} className="cursor-pointer">
                                <Button variant={"secondary"}>
                                    <CloudCog className="h-4 w-4 mr-2 text-gray-600" /> Update Property
                                </Button>
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAddTranslationDialogOpen(true); }} className="cursor-pointer">
                                <Button variant={"secondary"}>
                                    <Plus className="h-4 w-4 mr-2 text-gray-600" /> Add Translation
                                </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCheckTranslationsDialogOpen(true); }} className="cursor-pointer">
                                <Button variant={"secondary"}>
                                    <Globe className="h-4 w-4 mr-2 text-gray-600" /> Check Translations
                                </Button>
                            </DropdownMenuItem>

                            {(user?.role === "super_admin" || user?.role === "regional_admin") && propertyDetails?.id && (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsPropertyConfigDialogOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Button variant={"secondary"}>
                                        <Settings className='h-4 w-4 mr-2' /> Property Config
                                    </Button>
                                </DropdownMenuItem>
                            )}

                            <Dialog onOpenChange={setAddMemberDialogOpen} open={addMemberDialogOpen}>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                        <Button
                                            variant={"secondary"}
                                            onClick={() => { setAddMemberDialogOpen(true) }}
                                        >
                                            <User2Icon className='h-4 w-4 mr-2' /> Add Members
                                        </Button>
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className='sm:max-w-[425px]'>
                                    <DialogHeader>
                                        <DialogTitle>Add Members</DialogTitle>
                                        <DialogDescription>
                                            Assign a user to your property with a specific role.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className='space-y-4 py-4'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='role'>Role</Label>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a role' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role, index) => (
                                                        <SelectItem key={index} value={role.value}>
                                                            {role.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label htmlFor='user'>User</Label>
                                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a user' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedRole === "hotel_manager" && users?.hotelManagers?.length > 0 ? (
                                                        users.hotelManagers.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.firstName} {user.lastName} {user.email && `(${user.email})`}
                                                            </SelectItem>
                                                        ))
                                                    ) : selectedRole === "staff" && users?.staffs?.length > 0 ? (
                                                        users.staffs.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.firstName} {user.lastName} {user.email && `(${user.email})`}
                                                            </SelectItem>
                                                        ))
                                                    ) : selectedRole === "revenue_manager" && users?.revenueManagers?.length > 0 ? (
                                                        users.revenueManagers.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.firstName} {user.lastName} {user.email && `(${user.email})`}
                                                            </SelectItem>
                                                        ))
                                                    ) : selectedRole === "spa_manager" && users?.spaManagers?.length > 0 ? (
                                                        users.spaManagers.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.firstName} {user.lastName} {user.email && `(${user.email})`}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="qq" disabled>
                                                            No users available for this role
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleAddMember}
                                            disabled={!selectedUser || isAssigningUser}
                                        >
                                            {isAssigningUser ? 'Assigning...' : 'Assign User'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* ── Add Language — only when property is live ── */}
                            {isCreationCompleted && isDrafted && (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsLangPanelOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Button variant={"secondary"}>
                                        <Languages className='h-4 w-4 mr-2' /> Add Language
                                    </Button>
                                </DropdownMenuItem>
                            )}

                            <div className='ml-5'>
                                <DeleteCreationDialog type={"property"} name={creationDetails.name} id={creationDetails.id} />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Update Property Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Property</DialogTitle>
                        <DialogDescription>Update basic property details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-sm font-medium">Name</Label>
                            <Input
                                value={updatePropertyDetails.name}
                                onChange={(e) => setUpdatePropertyDetails({ ...updatePropertyDetails, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Images</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImageUploadModalOpen(true)}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Images
                            </Button>
                            {updatePropertyDetails.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {updatePropertyDetails.images.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="active"
                                type="checkbox"
                                checked={updatePropertyDetails.isActive}
                                onChange={(e) => setUpdatePropertyDetails({ ...updatePropertyDetails, isActive: e.target.checked })}
                            />
                            <Label htmlFor="active" className="text-sm cursor-pointer">Active</Label>
                        </div>
                    </div>
                    <ImageUploadModal
                        isOpen={isImageUploadModalOpen}
                        onClose={() => setIsImageUploadModalOpen(false)}
                        onUploadSuccess={handleUploadSuccess}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateProperty}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Property Status Card */}
            <div className={`p-4 rounded-lg border-l-4 ${isCreationCompleted && isDrafted
                ? 'bg-green-50 border-green-400'
                : 'bg-yellow-50 border-yellow-400'
                }`}>
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {isCreationCompleted && isDrafted ? (
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3">
                        <p className={`text-sm font-medium ${isCreationCompleted && isDrafted ? 'text-green-800' : 'text-yellow-800'}`}>
                            {isCreationCompleted && isDrafted ? 'Property Setup Complete' : 'Property Setup Incomplete'}
                        </p>
                        <p className={`text-sm ${isCreationCompleted && isDrafted ? 'text-green-700' : 'text-yellow-700'}`}>
                            {isCreationCompleted && isDrafted
                                ? 'Your property is ready for bookings and management.'
                                : 'Please complete the property setup to start accepting bookings.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            <div className="bg-white p-6 rounded-lg shadow">
                {!(isCreationCompleted && isDrafted && propertyDetails) && (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M9 21h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Property Setup Required
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                            Your property creation "{creationDetails.name}" exists, but the hotel property details
                            need to be completed before you can start managing bookings and inventory.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={handleCreateProperty} className="mr-3">
                                Complete Property Setup
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Assigned Members Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Members</h3>
                {creationDetails?.users && creationDetails.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {creationDetails.users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap ml-2">
                                    {capitalizeFirstLetter(user.role.replaceAll("_", " "))}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50 border-dashed">
                        No users assigned to this property yet.
                    </div>
                )}
            </div>

            {/* ── Property Languages Section ────────────────────────────── */}
            {isCreationCompleted && isDrafted && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Property Languages</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Languages available to guests on this property's portal
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsLangPanelOpen(prev => !prev)}
                            className="gap-2"
                        >
                            <Languages className="h-4 w-4" />
                            {isLangPanelOpen ? 'Close' : 'Add language'}
                        </Button>
                    </div>

                    {/* Language picker panel */}
                    {isLangPanelOpen && (
                        <div className="mb-5 border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                Select languages to add
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {languages.map((lang) => {
                                    const isEn = lang.code === 'en';
                                    const isAdded = isEn || propertyLanguages.some(l => l.language === lang.code);
                                    const isCurrentlyAdding = isAddingLang === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            disabled={isAdded || isCurrentlyAdding}
                                            onClick={() => handleAddLanguage(lang.code)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm font-medium transition-all
                                                ${isAdded
                                                    ? 'bg-white border-gray-100 text-gray-300 cursor-not-allowed'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 cursor-pointer active:scale-95'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0
                                                    ${isEn
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : isAdded
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {lang.code.toUpperCase()}
                                                </span>
                                                <span className="truncate">{lang.name}</span>
                                            </span>
                                            {isCurrentlyAdding ? (
                                                <div className="h-3.5 w-3.5 border border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            ) : isAdded ? (
                                                <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Active language chips */}
                    <div className="flex flex-wrap gap-2">
                        {/* EN chip — always present, locked */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-blue-50 border-blue-200 text-blue-800 select-none">
                            <Lock className="h-3 w-3" />
                            English
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono leading-none">
                                EN
                            </span>
                        </span>

                        {propertyLanguages
                            .filter(l => l.language !== 'en')
                            .map(pl => {
                                const lang = languages.find(l => l.code === pl.language);
                                const isDeleting = isDeletingLang === pl.id;
                                return (
                                    <span
                                        key={pl.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-700"
                                    >
                                        {lang?.name ?? pl.language}
                                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono leading-none">
                                            {pl.language.toUpperCase()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteLanguage(pl.id)}
                                            disabled={isDeleting}
                                            className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center"
                                            aria-label={`Remove ${lang?.name}`}
                                        >
                                            {isDeleting
                                                ? <div className="h-3.5 w-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                : <X className="h-3.5 w-3.5" />
                                            }
                                        </button>
                                    </span>
                                );
                            })}

                        {propertyLanguages.filter(l => l.language !== 'en').length === 0 && (
                            <span className="text-sm text-gray-400 italic py-1.5">
                                No additional languages added yet.
                            </span>
                        )}
                    </div>
                </div>
            )}
            {/* ──────────────────────────────────────────────────────────── */}

            {/* Loyalty Configuration Section */}
            {(user?.role === 'super_admin' || user?.role === 'regional_admin' || user?.role === 'group_manager' || user?.role === 'brand_manager' || user?.role === 'hotel_manager' || user?.role === 'staff') && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Loyalty Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link to={`/app/loyalty/${creationId}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <LayoutDashboard className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Configuration</h4>
                                <p className="text-xs text-gray-500">Manage general loyalty settings</p>
                            </div>
                        </Link>
                        <Link to={`/app/loyalty/register-form/${creationId}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Register Form</h4>
                                <p className="text-xs text-gray-500">Configure member registration</p>
                            </div>
                        </Link>
                        <Link to={`/app/loyalty/content-config/${creationId}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                <UsersIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Content Config</h4>
                                <p className="text-xs text-gray-500">Manage loyalty content</p>
                            </div>
                        </Link>
                        {user?.role === 'super_admin' && (
                            <Link to={`/app/loyalty/loyalty-guests/${creationId}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="bg-red-100 p-2 rounded-full text-red-600">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Loyalty Guests</h4>
                                    <p className="text-xs text-gray-500">View and manage guests</p>
                                </div>
                            </Link>
                        )}
                        <Link to={`/app/loyalty/levels/${creationId}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Loyalty Levels</h4>
                                <p className="text-xs text-gray-500">Configure tier levels</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Integration Dialog */}
            <IntegrationDialog
                isOpen={isIntegrationDialogOpen}
                onClose={() => {
                    setIsIntegrationDialogOpen(false);
                    setSelectedPartner(null);
                }}
                partner={selectedPartner}
                propertyId={propertyDetails?.id || ''}
                onIntegrationSuccess={handleIntegrationSuccess}
                onSubmit={handleIntegrationSubmit}
            />

            {/* Property Config Dialog */}
            <PropertyConfigDialog
                isOpen={isPropertyConfigDialogOpen}
                onClose={() => setIsPropertyConfigDialogOpen(false)}
                propertyConfig={propertyConfig}
                setPropertyConfig={setPropertyConfig}
                masterPartners={masterPartners}
                onIntegrate={handleIntegrateClick}
                onToggleStatus={handleToggleIntegrationStatus}
                onViewDetails={handleViewIntegrationDetails}
                onManageFields={handleManageIntegrationFields}
                onSave={updatePropertyConfig}
                userLevel={user?.userLevel}
                isLoading={isIntegrating}
            />

            {/* View Integration Details Dialog */}
            <ViewIntegrationDetailsDialog
                isOpen={isViewDetailsDialogOpen}
                onClose={() => {
                    setIsViewDetailsDialogOpen(false);
                    setSelectedPartner(null);
                }}
                partner={selectedPartner}
            />

            {/* Manage Integration Fields Dialog */}
            <ManageIntegrationFieldsDialog
                isOpen={isManageFieldsDialogOpen}
                onClose={() => {
                    setIsManageFieldsDialogOpen(false);
                    setSelectedPartner(null);
                }}
                partner={selectedPartner}
                onAddField={handleAddIntegrationField}
                onUpdateField={handleUpdateIntegrationField}
                onDeleteField={handleDeleteIntegrationField}
            />

            {creationDetails.id && (
                <>
                    <AddCreationLanguageDialog
                        open={addTranslationDialogOpen}
                        onOpenChange={setAddTranslationDialogOpen}
                        creationId={creationDetails.id}
                    />
                    <CheckCreationLanguagesDialog
                        open={checkTranslationsDialogOpen}
                        onOpenChange={setCheckTranslationsDialogOpen}
                        creationId={creationDetails.id}
                    />
                </>
            )}
        </div>
    );
}