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
import { User2Icon, Settings, MoreVertical, CloudCog, Upload, Trash2 } from "lucide-react"
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
} from "./types";
import DeleteCreationDialog from '@/components/Delete-Creation.dialog';
import IntegrationDialog from './components/IntegrationDialog';
import PropertyConfigDialog from './components/PropertyConfigDialog';
import ViewIntegrationDetailsDialog from './components/ViewIntegrationDetailsDialog';
import ManageIntegrationFieldsDialog from './components/ManageIntegrationFieldsDialog';

export default function PropertyPage() {
    const { user } = useAppSelector((state) => state.user);

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
    const [isLoading, setIsLoading] = useState(true);
    const [creationDetails, setCreationDetails] = useState<IpropertyCDetails>({
        id: '',
        name: "",
        images: [],
        isActive: false,
        createdAt: "",
        under: "",
        users: []
    });
    // const [propertyCreationDetails,setPropertyCreationDetails] = useState<IpropertyCDetails | null>(null);
    const [propertyDetails, setPropertyDetails] = useState<IPropertyCreations | null>(null);
    const [isCreationCompleted, setIsCreationCompleted] = useState<boolean>(false);
    const [isDrafted, setIsDrafted] = useState<boolean>(false);
    const roles = [{ value: "hotel_manager", label: "Hotel Manager" }, { value: "staff", label: "Staff" },];
    const [selectedRole, setSelectedRole] = useState<string>(roles[0].value);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [users, setUsers] = useState<HotelManagerMapping>({
        hotelManagers: [],
        staffs: [],
        revenueManagers: [],
        frontDesks: [],
        housekeeping: []
    });

    // Add loading state for user assignment
    const [isAssigningUser, setIsAssigningUser] = useState<boolean>(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    
    // Integration dialog state
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

    useEffect(() => {

        initialFetch();
    }, [creationId, navigate]);
    const initialFetch = async () => {
        await Promise.all([
            fetchProperty(),
            fetchUsers()

        ]);
    }
    const fetchProperty = async () => {
        try {
            if (!creationId) {
                toast.error("Property ID is required");
                navigate('/app/property');
                return;
            }

            const response = await getPropertyCreationId(creationId);
            if (response.success) {
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
            return
        }
        if (!propertyDetails?.id) {
            toast.error("Property Not Selected");
            return
        }
        try {
            setIsLoading(true)
            const response = await updatePropertyConfigService(propertyDetails.id, propertyConfig)
            if (response.success) {
                toast.success("property Config Updated successfully")
                fetchPropertyConfig(propertyDetails.id)
            } else {
                toast.error(response.message || "Failed to update Property config")
            }
        } catch (error) {
            toast.error("Failed to Update Property")
        } finally {
            setIsLoading(false)
        }
    }
    const fetchPropertyConfig = async (creationId: string) => {
        if (user?.role != "super_admin") {
            return
        }
        if (!creationId) {
            toast.error("Property Not Selected");
            return
        }
        try {
            setIsLoading(true)
            const response = await fetchPropertyConfigService(creationId)
            if (response.success) {
                setPropertyConfig(response.data);
                // toast.success("Property Config fetched successfully")
            } else {
                toast.error(response.message || "Failed to fetch Property config")
            }
        } catch (error) {
            toast.error("Failed to fetch Property config")
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        // console.log(propertyDetails)
        if (propertyDetails?.id) {
            fetchPropertyConfig(propertyDetails.id)
        }
    }, [propertyDetails])

    const handleCreateProperty = () => {
        if (!propertyDetails?.id) {
            navigate(`/property/create?creationId=${creationId}`);
        } else {
            navigate(`/property/create?propertyId=${propertyDetails?.id}`);
        }
    };

    const handleEditProperty = () => {
        navigate(`/property/${propertyDetails?.id}`);
    };

    // Reset dialog state when dialog closes
    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedRole(roles[0].value);
            setSelectedUser('');
        }
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
                // Reset form
                setSelectedUser('');
                // You might want to refresh the property data or user list here
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
        })
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
            // Refresh property data
            window.location.reload();
        } catch (err: any) {
            toast.error('Failed to update property');
        }
    };

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
                // Refresh partners to show updated status
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

    const handleIntegrationSuccess = () => {
        // This is called after successful integration
        // Could add analytics or additional UI updates here
    };

    const handleToggleIntegrationStatus = async (integrationId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            const response = await updatePropertyIntegrationStatusService(integrationId, newStatus);
            
            if (response.success) {
                toast.success(`Integration ${newStatus ? 'activated' : 'deactivated'} successfully`);
                // Refresh partners to show updated status
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
            } else {
                toast.error(response.message || 'Failed to update integration status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update integration status');
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
                // Refresh partners
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
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
                // Refresh partners
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
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
                // Refresh partners
                if (propertyDetails?.id) {
                    await fetchPartners(propertyDetails.id);
                }
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
                {/* Hero Image Slider Section */}
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
                                {creationDetails?.name}
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

                            {user?.role === "super_admin" && propertyDetails?.id && (
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

                            <Dialog onOpenChange={handleDialogOpenChange}>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                        <Button variant={"secondary"}>
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
                                                    ) : selectedRole === "housekeeping" && users?.housekeeping?.length > 0 ? (
                                                        users.housekeeping.map((user) => (
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

                        {/* Images Section */}
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

                            {/* Image Preview Grid */}
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

                    {/* Image Upload Modal */}
                    <ImageUploadModal
                        isOpen={isImageUploadModalOpen}
                        onClose={() => setIsImageUploadModalOpen(false)}
                        // uploadImages={uploadImages}
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
                        <p className={`text-sm font-medium ${isCreationCompleted && isDrafted ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                            {isCreationCompleted && isDrafted ? 'Property Setup Complete' : 'Property Setup Incomplete'}
                        </p>
                        <p className={`text-sm ${isCreationCompleted && isDrafted ? 'text-green-700' : 'text-yellow-700'
                            }`}>
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
        </div>
    );
}