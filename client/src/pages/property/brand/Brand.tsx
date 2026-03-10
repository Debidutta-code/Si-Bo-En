import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBrandCreationId, getUsersForMapping, updateCreationService } from "../service/creation-filter.service"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { IBrandDetails, IBrandManagersMapping, ICreation, IUpdateCreation } from '../types/types';
import Loader from '@/components/Loader/Loader';
import CreateEntityDialog from '@/components/creationDialog';
import BackButton from '@/components/shared/BackButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { handleDialogOpenChange } from '../utills/handleDialogOpenChange';
import { User2Icon, MoreVertical, CloudCog, Upload, Trash2, Settings } from 'lucide-react';
import { assignUserToProperty } from '../api/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageSlider from '@/components/shared/ImageSlider';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import DeleteCreationDialog from '@/components/Delete-Creation.dialog';


export default function page() {
    const { creationId } = useParams<{ creationId: string }>();
    const [brandManagers, setBrandManagers] = useState<IBrandManagersMapping>({
        brandManagers: []
    })
    const [isAssigningUser, setIsAssigningUser] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<string>("")
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true)
    const [creations, setCreations] = useState<ICreation[]>([])
    const [brandDetails, setBrandDetails] = useState<IBrandDetails>({
        createdAt: "",
        id: "",
        isActive: false,
        name: "",
        under: "",
        users: [],
        images: []
    })
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
    const [updateBrandDetails, setUpdateBrandDetails] = useState<IUpdateCreation>({
        id: "",
        name: "",
        images: [],
        isActive: true
    });
    const currentTab = "property"
    const getTabDisplayName = (tab: string): string => {
        const pluralMap: { [key: string]: string } = {
            property: "properties"
        };
        return pluralMap[tab] || tab;
    };
    const fetchGroup = async () => {
        try {

            if (!creationId) return;
            const response = await getBrandCreationId(creationId);
            if (response.success) {
                setCreations(response.data.properties)
                setBrandDetails(response.data.brandData)
                // toast.success("Brand/Property fetched successfully")
            } else {
                toast.error(response.message || "Failed to fetch")
            }
        } catch (error) {
            // console.log(error)
        } finally {
            setIsLoading(false)
        }
    };
    useEffect(() => {
        fetchGroup();
    }, [creationId])
    if (isLoading) {
        return (
            <div className='min-h-screen w-full flex justify-center items-center'>
                <Loader text={`Loading your Brands/Properties ...`} />
            </div>
        );
    }
    const fetchUsers = async () => {
        try {
            const response = await getUsersForMapping();
            if (response.success) {
                // console.log("Fetched users for mapping:", response.data);
                const data = response.data;
                setBrandManagers(data);
            } else {
                toast.error(response.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        }
    }
    const handleAddMember = async () => {
        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        if (!creationId) {
            toast.error("Invalid Creation");
            return;
        }
        setIsAssigningUser(true);
        try {
            const response = await assignUserToProperty({
                creationId: creationId,
                userId: selectedUser,
                role: "group_manager"
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
    }

    const openUpdateDialog = () => {
        setUpdateBrandDetails({
            id: brandDetails.id,
            name: brandDetails.name || '',
            images: brandDetails.images || [],
            isActive: brandDetails.isActive
        });
        setIsUpdateDialogOpen(true);
    };

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setUpdateBrandDetails(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    };

    const handleRemoveImage = (index: number) => {
        setUpdateBrandDetails(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateBrand = async () => {
        if (!creationId) {
            toast.error('Invalid Brand ID');
            return;
        }
        try {
            const response = await updateCreationService(creationId, updateBrandDetails.name, updateBrandDetails.images, updateBrandDetails.isActive);
            if (!response.success) {
                toast.error(response.message || 'Failed to update brand');
                return;
            }
            toast.success('Brand updated successfully');
            await fetchGroup();
            setIsUpdateDialogOpen(false);
        } catch (err: any) {
            toast.error('Failed to update brand');
        }
    };
    return (
        <div className="space-y-6 p-4">
            <BackButton />

            {/* Brand Details Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
                {/* Hero Image Slider Section */}
                {brandDetails.images?.length > 0 && (
                    <div className="w-full">
                        <ImageSlider
                            images={brandDetails.images}
                            alt={brandDetails.name}
                            height="h-80"
                        />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{brandDetails.name}</h1>
                            <div className="flex items-center space-x-3">
                                <p className="text-sm text-gray-600">
                                    Parent: <span className="font-semibold text-gray-800">{brandDetails.under}</span>
                                </p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${brandDetails.isActive
                                    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                    : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                    }`}>
                                    {brandDetails.isActive ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{creations?.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Brand Managers</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{brandDetails.users?.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <User2Icon className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Managers List */}
                    {brandDetails.users?.length > 0 && (
                        <div className="border-t border-gray-200 pt-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <User2Icon className="h-4 w-4 mr-2 text-gray-500" />
                                Assigned Managers
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {brandDetails.users.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full px-4 py-2 border border-gray-200 hover:shadow-sm transition-shadow">
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-gray-600">
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.firstName} {user.lastName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Bar with Dropdown */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Manage Properties</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        View and manage all properties under this brand
                    </p>
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

                                <CloudCog className="h-4 w-4 mr-2 text-gray-600" /> Update Brand
                            </Button>
                        </DropdownMenuItem>

                        <Dialog onOpenChange={() => handleDialogOpenChange(true, fetchUsers, setSelectedUser)}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                    <Button variant={"secondary"}>

                                        <User2Icon className='h-4 w-4 mr-2' /> Assign Brand Manager
                                    </Button>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-[425px]'>
                                <DialogHeader>
                                    <DialogTitle>Assign Brand Manager</DialogTitle>
                                    <DialogDescription>
                                        Assign a manager to your Brand.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4 py-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='user'>User</Label>
                                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select a user' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brandManagers?.brandManagers?.length > 0 ? (
                                                    brandManagers.brandManagers.map((user) => (
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

                        <div className="px-2">
                            <CreateEntityDialog creationType={"brand"} currentTab={currentTab} creationId={creationId ? creationId : ""} level={2} fetchProperties={fetchGroup} />
                        </div>
                        <div className="px-2">
                            <DeleteCreationDialog type={"brand"} name={updateBrandDetails.name} id={creationId ? creationId : ""} />
                        </div>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>

            {/* Update Brand Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Brand</DialogTitle>
                        <DialogDescription>Update basic brand details.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-sm font-medium">Name</Label>
                            <Input
                                value={updateBrandDetails.name}
                                onChange={(e) => setUpdateBrandDetails({ ...updateBrandDetails, name: e.target.value })}
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
                            {updateBrandDetails.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {updateBrandDetails.images.map((url, index) => (
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
                                checked={updateBrandDetails.isActive}
                                onChange={(e) => setUpdateBrandDetails({ ...updateBrandDetails, isActive: e.target.checked })}
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
                        <Button onClick={handleUpdateBrand}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Content Display */}
            <div className="bg-white p-6 rounded-lg shadow">

                {/* Data Grid */}
                {creations?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M9 21h4"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No {getTabDisplayName(currentTab)} found
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Get started by creating your first {currentTab}.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {creations?.map((item: ICreation) => (
                            <div
                                key={item.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <img src={item.images[0]} alt={item.name} width={400} height={200} className="rounded-lg mb-3" />

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                                        {item.name}
                                    </h3>
                                </div>

                                <div className="mt-4 flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`${item.type === "property" ? item.property?.isDraft && "flex-1" : "flex-1"}`}
                                        onClick={() => {
                                            item.type != "property" ?
                                                navigate(`/app/property/${currentTab}/${item.id}`) :
                                                navigate(`/property/${item.propertyId}`)
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    {
                                        item.type == "property" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`${item.type === "property" && !item.property?.isDraft && "flex-1"}`}

                                                onClick={() => navigate(`/app/property/${currentTab}/${item.id}`)}
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        )
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
