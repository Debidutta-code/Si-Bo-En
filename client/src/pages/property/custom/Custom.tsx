import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomCreationId, getUsersForMapping, updateCreationService } from "../service/creation-filter.service"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { IBrandDetails, ICcreations, ICreation, ICustomManagersMapping, IUpdateCreation } from '../types/types';
import Loader from '@/components/Loader/Loader';
import CreateEntityDialog from '@/components/creation/creationDialog';
import BackButton from '@/components/shared/BackButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { handleDialogOpenChange } from '../utills/handleDialogOpenChange';
import { User2Icon, MoreVertical, CloudCog, Upload, Trash2, Settings } from 'lucide-react';
import { assignUserToProperty } from '../api/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ImageUploadModal from '@/components/property/ImageUploadModal';
import DeleteCreationDialog from "@/components/creation/Delete-Creation.dialog";
import type { ILoader } from '@/pages/dashboard/interface';
import { capitalizeFirstLetter } from '@/lib/utils';


export default function Custom() {
    const { creationId } = useParams<{ creationId: string }>();
    const [customAdmins, setCustomAdmins] = useState<ICustomManagersMapping>({
        customAdmins: []
    })
    const [selectedUser, setSelectedUser] = useState<string>("")
    const navigate = useNavigate();
    const [loader, setLoader] = useState<ILoader>({
        isLoading: true,
        message: "Loading your Groups/Brands/Properties ..."
    })
    const [creations, setCreations] = useState<ICcreations>({
        brands: [],
        groups: [],
        properties: [],
    })
    const [customDetails, setCustomDetails] = useState<IBrandDetails>({
        createdAt: "",
        id: "",
        isActive: false,
        name: "",
        under: "",
        users: [],
        images: []
    })
    const [currentTab, setCurrentTab] = useState<"group" | "brand" | "property" | "regional">("property")

    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState<boolean>(false);
    const [updateCustomDetails, setUpdateCustomDetails] = useState<IUpdateCreation>({
        id: "",
        name: "",
        images: [],
        isActive: true
    });
    const getTabDisplayName = (tab: string): string => {
        const pluralMap: { [key: string]: string } = {
            property: "properties"
        };
        return pluralMap[tab] || tab;
    };
    const fetchGroup = async () => {
        setLoader({
            isLoading: true,
            message: "Loading your Groups/Brands/Properties ..."
        });
        try {

            if (!creationId) return;
            const response = await getCustomCreationId(creationId);
            if (response.success) {
                setCreations(response.data)
                setCustomDetails(response.data.customDetails)
            } else {
                toast.error(response.message || "Failed to fetch")
            }
        } catch (error) {
        } finally {
            setLoader({
                isLoading: false,
                message: ""
            });
        }
    };
    useEffect(() => {
        fetchGroup();
    }, [creationId])
    if (loader.isLoading) {
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
                const data = response.data;
                setCustomAdmins(data);
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
        setLoader({
            isLoading: true,
            message: "Assigning user..."
        });
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
            } else {
                toast.error(response.message || "Failed to assign user");
            }
        } catch (error) {
            console.error("Error assigning user:", error);
            toast.error("Failed to assign user");
        } finally {
            setLoader({
                isLoading: false,
                message: ""
            });
        }
    }

    const openUpdateDialog = () => {
        setUpdateCustomDetails({
            id: customDetails.id,
            name: customDetails.name || '',
            images: customDetails.images || [],
            isActive: customDetails.isActive
        });
        setIsUpdateDialogOpen(true);
    };

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setUpdateCustomDetails(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    };

    const handleRemoveImage = (index: number) => {
        setUpdateCustomDetails(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };
    const getCurrentData = (): ICreation[] => {
        switch (currentTab) {
            case "group":
                return creations.groups;
            case "brand":
                return creations.brands;
            case "property":
                return creations.properties;
            default:
                return [];
        }
    };
    const handleUpdateCustom = async () => {
        if (!creationId) {
            toast.error('Invalid Custom Details');
            return;
        }
        try {
            const response = await updateCreationService(creationId, updateCustomDetails.name, updateCustomDetails.images, updateCustomDetails.isActive);
            if (!response.success) {
                toast.error(response.message || 'Failed to update regionalal');
                return;
            }
            toast.success('Custom updated successfully');
            await fetchGroup();
            setIsUpdateDialogOpen(false);
        } catch (err: any) {
            toast.error('Failed to update brand');
        }
    };
    const currentData = getCurrentData();

    return (
        <div className="space-y-6 p-4">
            <BackButton />
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hotels & Properties</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Manage all your hotel properties and their performance
                </p>
            </div>

            {/* Actions Bar with Dropdown */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-2 border-b">
                    {(["group", "brand", "property"] as const).map((tab) => (

                        <Button
                            key={tab}
                            variant={currentTab === tab ? "secondary" : "ghost"}
                            onClick={() => setCurrentTab(tab)}
                            className={`px-4 py-2 rounded-t-lg border-b-2 ${currentTab === tab
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-transparent hover:border-gray-300"
                                }`}
                        >
                            {capitalizeFirstLetter(getTabDisplayName(tab))} ({
                                tab === "group" ? creations.groups?.length :
                                    tab === "brand" ? creations.brands?.length :
                                        creations.properties?.length
                            })
                        </Button>
                    ))}
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
                                                {customAdmins?.customAdmins?.length > 0 ? (
                                                    customAdmins.customAdmins.map((user) => (
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
                                        disabled={!selectedUser || loader.isLoading}
                                    >
                                        {loader.isLoading ? 'Assigning...' : 'Assign User'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="px-2">
                            <CreateEntityDialog creationType={"brand"} currentTab={currentTab} creationId={creationId ? creationId : ""} level={2} fetchProperties={fetchGroup} />
                        </div>
                        <div className="px-2">
                            <DeleteCreationDialog type={"brand"} name={customDetails.name} id={creationId ? creationId : ""} />
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
                                value={updateCustomDetails.name}
                                onChange={(e) => setUpdateCustomDetails({ ...updateCustomDetails, name: e.target.value })}
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
                            {updateCustomDetails.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {updateCustomDetails.images.map((url, index) => (
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
                                checked={updateCustomDetails.isActive}
                                onChange={(e) => setUpdateCustomDetails({ ...updateCustomDetails, isActive: e.target.checked })}
                            />
                            <Label htmlFor="active" className="text-sm cursor-pointer">Active</Label>
                        </div>
                    </div>

                    {/* Image Upload Modal */}
                    <ImageUploadModal
                        isOpen={isImageUploadModalOpen}
                        onClose={() => setIsImageUploadModalOpen(false)}
                        onUploadSuccess={handleUploadSuccess}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateCustom}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="bg-white p-6 rounded-lg shadow">

                {/* Data Grid */}
                {currentData?.length === 0 ? (
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
                        {currentData?.map((item: ICreation) => (
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
                                        className={`${item.type === "property" ? item.property?.isDraft ? "flex-1" : "hidden" : "flex-1"}`}
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
                                                {!item.property?.isDraft &&

                                                    <span className="ml-2">{!item.property?.isDraft && "Complete Setup"}</span>
                                                }

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
