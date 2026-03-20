import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGroupCreationId,
  getUsersForMapping,
} from "../service/creation-filter.service";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type {
  IGroupCreations,
  ICreation,
  IGroupManagersMapping,
} from "../types/types";
import Loader from "@/components/Loader/Loader";
import { capitalizeFirstLetter } from "@/lib/utils";
import CreateEntityDialog from "@/components/creation/creationDialog";
import BackButton from "@/components/shared/BackButton";
import {
  User2Icon,
  MoreVertical,
  CloudCog,
  Upload,
  Trash2,
  Settings,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { assignUserToProperty } from "../api/api";
import { handleDialogOpenChange } from "../utills/handleDialogOpenChange";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageSlider from "@/components/shared/ImageSlider";
import ImageUploadModal from "@/components/property/ImageUploadModal";
import { updateCreationService } from "../service/creation-filter.service";
import type { IUpdateCreation } from "../types/types";
import DeleteCreationDialog from "@/components/creation/Delete-Creation.dialog";

export default function page() {
  const { creationId } = useParams<{ creationId: string }>();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [creations, setCreations] = useState<IGroupCreations>({
    brands: [],
    properties: [],
    groupData: {
      id: "",
      createdAt: "",
      isActive: true,
      name: "",
      superGroupName: "",
      users: [],
      images: [],
    },
  });
  const [isAssigningUser, setIsAssigningUser] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<"brand" | "property">("brand");
  const [groupManagers, setGroupManagers] = useState<IGroupManagersMapping>({
    groupManagers: [],
  });
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [updateGroupDetails, setUpdateGroupDetails] = useState<IUpdateCreation>(
    {
      id: "",
      name: "",
      images: [],
      isActive: true,
    },
  );
  const getTabDisplayName = (tab: string): string => {
    const pluralMap: { [key: string]: string } = {
      brand: "brands",
      property: "properties",
    };
    return pluralMap[tab] || tab;
  };
  const fetchGroup = async () => {
    try {
      if (!creationId) return;
      const response = await getGroupCreationId(creationId);
      if (response.success) {
        if (response.data.brands.length > 0) {
          setCurrentTab("brand");
        } else {
          setCurrentTab("property");
        }
        setCreations(response.data);
      } else {
        toast.error(response.message || "Failed to fetch");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGroup();
  }, [creationId]);
  const getCurrentData = (): ICreation[] => {
    switch (currentTab) {
      case "brand":
        return creations.brands;
      case "property":
        return creations.properties;
      default:
        return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsersForMapping();
      if (response.success) {
        // console.log("Fetched users for mapping:", response.data);
        const data = response.data;
        setGroupManagers(data);
      } else {
        toast.error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };
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
        role: "group_manager",
      });
      if (response.success) {
        toast.success("User assigned successfully");
        // Reset form
        setSelectedUser("");
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
    setUpdateGroupDetails({
      id: creations.groupData.id || creationId || "",
      name: creations.groupData.name || "",
      images: creations.groupData.images || [],
      isActive: Boolean(creations.groupData.isActive),
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUploadSuccess = (uploadedUrls: string[]) => {
    setUpdateGroupDetails((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
    toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
  };

  const handleRemoveImage = (index: number) => {
    setUpdateGroupDetails((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateGroup = async () => {
    if (!creationId) {
      toast.error("Invalid Group ID");
      return;
    }
    try {
      const response = await updateCreationService(
        creationId,
        updateGroupDetails.name,
        updateGroupDetails.images,
        updateGroupDetails.isActive,
      );
      if (!response.success) {
        toast.error(response.message || "Failed to update group");
        return;
      }
      toast.success("Group updated successfully");
      await fetchGroup();
      setIsUpdateDialogOpen(false);
    } catch (err: any) {
      toast.error("Failed to update group");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={`Loading your Group Details...`} />
      </div>
    );
  }
  const isCreationButtonVisible = (currentTab: string) => {
    switch (currentTab) {
      case "brand":
        return creations.brands.length > 0;
      case "property":
        return creations.properties.length > 0;
      default:
        return [];
    }
  };
  const currentData = getCurrentData();

  return (
    <div className="space-y-6 p-4">
      <BackButton />

      {/* Group Details Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
        {/* Hero Image Slider Section */}
        {creations.groupData.images?.length > 0 && (
          <div className="w-full">
            <ImageSlider
              images={creations.groupData.images}
              alt={creations.groupData.name}
              height="h-80"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {creations.groupData.name}
              </h1>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-600">
                  Parent:{" "}
                  <span className="font-semibold text-gray-800">
                    {creations.groupData.superGroupName}
                  </span>
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${creations.groupData.isActive
                      ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                      : "bg-red-100 text-red-700 ring-1 ring-red-200"
                    }`}
                >
                  {creations.groupData.isActive ? "● Active" : "● Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Brands
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {creations.brands.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Properties
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {creations.properties.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Group Managers
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {creations.groupData.users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User2Icon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Group Managers List */}
          {creations.groupData.users.length > 0 && (
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User2Icon className="h-4 w-4 mr-2 text-gray-500" />
                Assigned Managers
              </h3>
              <div className="flex flex-wrap gap-2">
                {creations.groupData.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full px-4 py-2 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
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
          <h2 className="text-xl font-bold text-gray-900">
            Manage Brands & Properties
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all brands and properties under this group
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 space-y-2">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                openUpdateDialog();
              }}
              className="cursor-pointer"
            >
              <Button variant={"secondary"}>
                <CloudCog className="h-4 w-4 mr-2 text-gray-600" /> Update Group
              </Button>
            </DropdownMenuItem>

            <Dialog
              onOpenChange={() =>
                handleDialogOpenChange(true, fetchUsers, setSelectedUser)
              }
            >
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <Button variant={"secondary"}>
                    <User2Icon className="h-4 w-4 mr-2" /> Assign Manager
                  </Button>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Assign Group Manager</DialogTitle>
                  <DialogDescription>
                    Assign a manager to your Group.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Select
                      value={selectedUser}
                      onValueChange={setSelectedUser}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupManagers?.groupManagers?.length > 0 ? (
                          groupManagers.groupManagers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}{" "}
                              {user.email && `(${user.email})`}
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
                    {isAssigningUser ? "Assigning..." : "Assign User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="px-2">
              <CreateEntityDialog
                creationType={"group"}
                currentTab={currentTab}
                creationId={creationId ? creationId : ""}
                level={3}
                fetchProperties={fetchGroup}
              />
            </div>
            <div className="px-2">
              <DeleteCreationDialog
                type={"group"}
                name={creations.groupData.name}
                id={creations.groupData.id}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Update Group Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Group</DialogTitle>
            <DialogDescription>Update basic group details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={updateGroupDetails.name}
                onChange={(e) =>
                  setUpdateGroupDetails({
                    ...updateGroupDetails,
                    name: e.target.value,
                  })
                }
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
              {/* In the Update Group Dialog - Image Preview Grid */}
              {updateGroupDetails.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {updateGroupDetails.images.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      {" "}
                      {/* Fixed aspect ratio */}
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/150?text=Error";
                          e.currentTarget.className =
                            "w-full h-full object-contain rounded border bg-gray-100 p-2";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                checked={updateGroupDetails.isActive}
                onChange={(e) =>
                  setUpdateGroupDetails({
                    ...updateGroupDetails,
                    isActive: e.target.checked,
                  })
                }
              />
              <Label htmlFor="active" className="text-sm cursor-pointer">
                Active
              </Label>
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
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex space-x-2 border-b">
        {(["brand", "property"] as const).map((tab) => (
          <Button
            key={tab}
            variant={currentTab === tab ? "secondary" : "ghost"}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 rounded-t-lg border-b-2 ${!isCreationButtonVisible(tab) && "hidden"} ${currentTab === tab
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent hover:border-gray-300"
              }`}
          >
            {capitalizeFirstLetter(getTabDisplayName(tab))} (
            {tab === "brand"
              ? creations.brands?.length
              : creations.properties?.length}
            )
          </Button>
        ))}
      </div>

      {/* Content Display */}
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
                className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                {/* Image with fixed aspect ratio container */}
                <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x200?text=No+Image";
                      e.currentTarget.className =
                        "w-full h-full object-contain rounded-lg bg-gray-100 p-4";
                    }}
                  />
                </div>

                <div className="flex-1">
                  {" "}
                  {/* This pushes button to bottom */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                  </div>
                </div>

                {/* Actions */}
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
  );
}
