import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ImageSlider from "@/components/shared/ImageSlider";
import type { IPropertyAddress, IPropertyDetails } from "../types/types";
import { MapPin, MoreVertical, CloudCog, Upload, Trash2, Settings, User2Icon } from "lucide-react";
import toast from "react-hot-toast";
import PropertyAddress from "@/components/property/show/Address";
import PropertyDetails from "@/components/property/show/PropertyDetails";
import PropertyAmenities from "@/components/property/show/PropertyAmenities";
import Rooms from "@/components/property/show/Rooms";
import BankDetails from "@/components/property/show/BankDetails";
import Loader from "@/components/Loader/Loader";
import { useParams, useSearchParams } from "react-router-dom";
import { getPropertyDetails } from "@/components/property/api/show/propertyDetails";
import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadModal from "@/components/property/ImageUploadModal";
import { uploadImages } from "@/components/property/api/create/propertyinfo";
import { useAppSelector } from "@/redux/hooks";

export default function PropertyDetailsPage() {
  const { user } = useAppSelector((state) => state.user);
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    propertyEmail: "",
    description: "",
    destinationType: {
      masterDestinationType: {
        id: "",
        description: "",
        destinationTypeName: "",
      }
    },
    propertyCategory: {
      masterCategory: {
        id: "",
        categoryName: "",
        description: "",
      }
    },
    propertyContact: "",
    propertyRoom: [],
    propertyType: {
      masterPropertyType: {
        id: "",
        description: "",
        propertyTypeName: "",
      }
    },
    starRating: "",
    propertyCode: "",
  });

  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    landmark: "",
    latitude: 0,
    location: "",
    longitude: 0,
    propertyId: "",
    state: "",
    zipCode: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("property");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
  const [updatePropertyDetails, setUpdatePropertyDetails] = useState({
    name: "",
    images: [] as string[],
    isActive: false
  });

  const [propertyConfig, setPropertyConfig] = useState({
    channelManagerIntegrationActive: false,
    pmsIntegrationActive: false,
    reservationResetTime: "9.30",
    selfAriActive: false
  });

  const [selectedRole, setSelectedRole] = useState<string>("hotel_manager");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isAssigningUser, setIsAssigningUser] = useState(false);

  const roles = [
    { value: "hotel_manager", label: "Hotel Manager" },
    { value: "staff", label: "Staff" },
    { value: "revenue_manager", label: "Revenue Manager" },
    { value: "front_desk", label: "Front Desk" },
    { value: "housekeeping", label: "Housekeeping" }
  ];

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['property', 'address', 'amenities', 'rooms', 'bank-details'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await getPropertyDetails(propertyId);
      if (response.data) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
          propertyEmail: data.propertyEmail,
          propertyContact: data.propertyContact,
          starRating: data.starRating?.$numberDecimal || data.starRating,
          propertyCategory: data.propertyCategory,
          destinationType: data.destinationType,
          propertyType: data.propertyType,
          propertyRoom: data.propertyRoom,
          description: data.description,
          propertyCode: data.propertyCode,
        });
        setPropertyImages(data.image || []);
        if (data.propertyAddress) {
          setPropertyAddress(data.propertyAddress);
        }
        
        // Initialize update form with current details
        setUpdatePropertyDetails({
          name: data.propertyName,
          images: data.image || [],
          isActive: data.isActive || false
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get Property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error("Go back and try again");
      return;
    }
    fetchPropertyDetails(propertyId);
  }, [propertyId]);

  const getFullAddress = () => {
    const parts = [
      propertyAddress.city,
      propertyAddress.state,
      propertyAddress.country,
      propertyAddress.zipCode?.toString(),
    ].filter(Boolean);

    return parts.join(", ");
  };

  const openUpdateDialog = () => {
    setUpdatePropertyDetails({
      name: propertyDetails.propertyName,
      images: propertyImages,
      isActive: true // You may want to get this from your API
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
    if (!propertyId) {
      toast.error('Invalid Property ID');
      return;
    }
    try {
      // Call your update API here
      toast.success('Property updated successfully');
      setIsUpdateDialogOpen(false);
      fetchPropertyDetails(propertyId);
    } catch (err: any) {
      toast.error('Failed to update property');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    setIsAssigningUser(true);
    try {
      // Call your assign user API here
      toast.success("User assigned successfully");
      setSelectedUser('');
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      console.error("Error assigning user:", error);
      toast.error("Failed to assign user");
    } finally {
      setIsAssigningUser(false);
    }
  };

  const updatePropertyConfigHandler = async () => {
    if (user?.role !== "super_admin") {
      toast.error("Only SuperAdmin can update the config");
      return;
    }
    try {
      // Call your update config API here
      toast.success("Property Config Updated successfully");
      setIsConfigDialogOpen(false);
    } catch (error) {
      toast.error("Failed to Update Property");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Your Properties" />
      </div>
    );
  }

  const isDrafted = true; // You may want to get this from your API
  const isCreationCompleted = true; // You may want to get this from your API

  return (
    <>
      <div className="space-y-4">
        <BackButton />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {propertyDetails.propertyName}
            </h1>
            <p className="text-sm text-gray-600 flex items-center mt-2">
              <MapPin className="h-5 w-5 mr-2" />
              {getFullAddress()}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {propertyImages.length > 0 ? (
              <ImageSlider images={propertyImages} height="h-80" />
            ) : (
              <div className="h-80 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Bar with Dropdown */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Property Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure and manage your property settings
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
                <Button variant="secondary" className="w-full justify-start">
                  <CloudCog className="h-4 w-4 mr-2 text-gray-600" /> Update Property
                </Button>
              </DropdownMenuItem>

              {user?.role === "super_admin" && (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsConfigDialogOpen(true); }} className="cursor-pointer">
                  <Button variant="secondary" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" /> Property Config
                  </Button>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsAddMemberDialogOpen(true); }} className="cursor-pointer">
                <Button variant="secondary" className="w-full justify-start">
                  <User2Icon className="h-4 w-4 mr-2" /> Add Members
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              uploadImages={uploadImages}
              onUploadSuccess={handleUploadSuccess}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProperty}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Property Config Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Property Configuration</DialogTitle>
              <DialogDescription>
                Update property settings and integrations. Only Super Admin can modify these settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="channelManager">Channel Manager Integration</Label>
                  <p className="text-xs text-muted-foreground">Enable channel manager integration</p>
                </div>
                <Switch
                  id="channelManager"
                  checked={propertyConfig.channelManagerIntegrationActive}
                  onCheckedChange={(checked) =>
                    setPropertyConfig({ ...propertyConfig, channelManagerIntegrationActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="pmsIntegration">PMS Integration</Label>
                  <p className="text-xs text-muted-foreground">Enable PMS integration</p>
                </div>
                <Switch
                  id="pmsIntegration"
                  checked={propertyConfig.pmsIntegrationActive}
                  onCheckedChange={(checked) =>
                    setPropertyConfig({ ...propertyConfig, pmsIntegrationActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="selfAri">Self ARI</Label>
                  <p className="text-xs text-muted-foreground">Enable self availability, rates, and inventory</p>
                </div>
                <Switch
                  id="selfAri"
                  checked={propertyConfig.selfAriActive}
                  onCheckedChange={(checked) =>
                    setPropertyConfig({ ...propertyConfig, selfAriActive: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resetTime">Reservation Reset Time</Label>
                <Input
                  id="resetTime"
                  type="text"
                  placeholder="e.g., 9.30"
                  value={propertyConfig.reservationResetTime}
                  onChange={(e) =>
                    setPropertyConfig({ ...propertyConfig, reservationResetTime: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">Format: HH.MM (24-hour format)</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={updatePropertyConfigHandler}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Members Dialog */}
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Members</DialogTitle>
              <DialogDescription>
                Assign a user to your property with a specific role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
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

              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">User 1</SelectItem>
                    <SelectItem value="user2">User 2</SelectItem>
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

        {/* Content Display - Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="property" className="space-y-6">
            <PropertyDetails propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="address">
            <PropertyAddress propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="amenities">
            <PropertyAmenities propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="rooms" className="space-y-6">
            <Rooms propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="bank-details">
            <BankDetails propertyId={propertyId!} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}