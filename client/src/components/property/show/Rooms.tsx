import { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getPropertyDetails } from "../api/show/propertyDetails";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreVertical,
  Bed,
  PenTool,
  Trash,
  X,
  Plus,
  Rotate3d,
  Video,
} from "lucide-react";
import PropertyMediaGallery from "@/components/property/PropertyMediaGallery";
import { type IRoom } from "../types/types";
import { Button } from "../../ui/button";
import PropertyDetailsDialog from "@/components/ExplandableDescription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import UpdateRoom from "../update/Rooms";
import type { IRoomDetails } from "../update/types/types";
import {
  updateRoom,
  createRoom,
  deleteRoom,
  updateRoomAmenity,
  createRoomAmenity,
  addVideoToRoom,
  deleteRoomVideo,
} from "../api/show/room";
import UpdateRoomAmenityUi from "../update/RoomAmenity";
import Room360ViewModal from "../Room360ViewModal";
import PanoramaViewer from "../PanoramaViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoUploadModal from "../VedioUpload.modal";
import { capitalizeFirstLetter } from "@/lib/utils";
import AddRoomLangDialog from "../multilang/components/AddRoomLangDialog";
import CheckRoomLangDialog from "../multilang/components/CheckRoomLangDialog";
import {  Languages } from "lucide-react";

interface PropertyId {
  propertyId: string;
}

export default function Rooms({ propertyId }: PropertyId) {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const emptyRoomDetails: IRoomDetails = {
    roomName: "",
    roomType: "",
    totalRoom: 0,
    floor: 0,
    roomSize: 0,
    roomUnit: "sqft",
    smokingPolicy: "designated_area",
    maxOccupancy: 0,
    maxNumberOfAdults: 0,
    maxNumberOfChildren: 0,
    numberOfBedrooms: 0,
    numberOfLivingRoom: 0,
    extraBed: 0,
    description: "",
    image: [],
    available: true,
    view360Link: "",
    roomVideos: { url: "", thumbnail: "" },
    priority: 0,
    RoomViews: { MasterRoomView: { id: "", viewName: "",_translations:{viewName:""} } },
    _translations:{
      description:"",
      roomName:""
    }
  };

  const [roomDetails, setRoomDetails] = useState<IRoomDetails>(emptyRoomDetails);

  const [isDeletingVideo, setIsDeletingVideo] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<"create" | "edit" | null>(null);

  const [updatedAmenities, setUpdatedAmenities] = useState<
    Record<string, boolean>
  >({});
  const [is360ViewModalOpen, setIs360ViewModalOpen] = useState(false);
  const [selected360Room, setSelected360Room] = useState<{
    id: string;
    name: string;
    view360Link?: string;
  } | null>(null);
  const [isPanoramaViewerOpen, setIsPanoramaViewerOpen] = useState(false);
  const [panoramaUrl, setPanoramaUrl] = useState<string>("");
  const [panoramaRoomName, setPanoramaRoomName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [translationRoomId, setTranslationRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchRoom(propertyId);
  }, [propertyId]);
  const fetchRoom = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getPropertyDetails(propertyId);
      if (response.success && response.data?.propertyRooms) {
        const data = response.data.propertyRooms;
        setRooms(data);
      } else {
        toast.error(response.message);
        setRooms([]);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch room details");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader text="Loading Rooms..." />;
  }
  const updateRoomQ = async (
    propertyId: string,
    roomId: string,
    roomDetails: IRoomDetails,
  ) => {
    setLoading(true);
    try {
      const res = await updateRoom(propertyId, roomId, roomDetails);
      if (res.success) {
        toast.success("Room Updated Successfully");
        setOpenDialog(null);
      } else {
        toast.error(res.message || "Failed to Update Room Details");
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error("Falied to Update Room Details");
    } finally {
      setLoading(false);
    }
  };
  const createRoomQ = async (propertyId: string, payload: IRoomDetails) => {
    setLoading(true);
    try {
      const res = await createRoom(propertyId, payload);
      if (res.success) {
        toast.success("Room Created Successfully");
        setOpenDialog(null);
      } else {
        toast.error(res.message || "Failed to Create Room Details");
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error("Falied to Create Room Details");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (propertyId: string, roomId: string) => {
    try {
      const res = await deleteRoom(propertyId, roomId);
      if (res.success) {
        toast.success("Room Created Successfully");
      } else {
        toast.error(res.message || "Failed to Create Room Details");
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error("Failed to Delete Room Details");
    } finally {
      setLoading(false);
    }
  };
  const addRoomAmenityQ = async (
    propertyId: string,
    roomId: string,
    payload: Record<string, boolean>,
  ) => {
    try {
      const res = await createRoomAmenity(propertyId, roomId, payload);
      if (res.success) {
        toast.success(`Room Amenity Added Successfully`);
      } else {
        toast.error(res.message || "Failed to Add Room Amenity");
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error("Failed to Add Room Amenity");
    } finally {
      setLoading(false);
    }
  };
  const updateRoomAmenityQ = async (
    propertyId: string,
    roomId: string,
    payload: any,
  ) => {
    try {
      const res = await updateRoomAmenity(propertyId, roomId, payload);
      if (res.success) {
        toast.success(`Room Amenity Updated Successfully`);
      } else {
        toast.error(res.message || "Failed to update Room Amenity");
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error("Failed to update Room Amenity");
    } finally {
      setLoading(false);
    }
  };
  const handleVideoUploadSuccess = async (
    videoUrl: string,
    thumbnailUrl: string,
  ) => {
    if (!propertyId || !selectedRoomId) {
      toast.error("Property ID or Room ID is missing");
      return;
    }

    try {
      const response = await addVideoToRoom(
        selectedRoomId,
        videoUrl,
        thumbnailUrl,
      );

      if (response.success) {
        // console.log('Video uploaded successfully:', { videoUrl, thumbnailUrl });
        toast.success("Video uploaded and saved successfully!");
        await fetchRoom(propertyId);
      } else {
        toast.error(response.message || "Failed to save video");
      }
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("Failed to save video");
    }
  };

  const handleDeleteVideo = async () => {
    // Remove parameter
    if (!propertyId || !selectedRoomId) {
      toast.error("Property ID or Room ID is missing");
      return;
    }

    setIsDeleteDialogOpen(false); // Close dialog first

    try {
      setIsDeletingVideo(true);
      const response = await deleteRoomVideo(selectedRoomId); // Use selectedRoomId

      if (response.success) {
        toast.success("Video deleted successfully!");
        await fetchRoom(propertyId);
        setSelectedRoomId(""); // Clear selected room ID after deletion
      } else {
        toast.error(response.message || "Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeletingVideo(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {rooms.length > 0 ? (
        <div className="space-y-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className={`overflow-hidden transition-all ${!room.available ? "border-l-4 border-l-red-500" : ""
                }`}
            >
              <CardHeader className="border-b bg-primary/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl font-semibold text-gray-900">
                        {room._translations?room._translations.roomName:room.roomName}
                      </CardTitle>
                      {!room.available && (
                        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{room.roomType}</span>
                      <span className="text-gray-400">•</span>
                      <span>
                        {room.roomSize} {room.roomUnit}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" />
                        {room.totalRoom}{" "}
                        {room.totalRoom === 1 ? "Room" : "Rooms"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">Priority: {room.priority}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.view360Link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPanoramaUrl(room.view360Link!);
                          setPanoramaRoomName(room.roomName);
                          setIsPanoramaViewerOpen(true);
                        }}
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Rotate3d className="w-4 h-4" />
                        360° View
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Room Actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        {/* Create Room */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <AlertDialog
                            open={openDialog === "create"}
                            onOpenChange={(open) => {
                              if (!open) {
                                setOpenDialog(null);
                                setRoomDetails(emptyRoomDetails);
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDialog("create");
                                  setRoomDetails(emptyRoomDetails);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Room
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                              <AlertDialogHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <AlertDialogTitle className="text-xl">
                                      Create New Room
                                    </AlertDialogTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Add a new room type to your property
                                    </p>
                                  </div>
                                  <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                                    <X className="h-4 w-4" />
                                  </AlertDialogCancel>
                                </div>
                                <UpdateRoom
                                  roomDetails={roomDetails}
                                  isLoading={loading}
                                  updateRoomDetails={setRoomDetails}
                                />
                              </AlertDialogHeader>
                              <AlertDialogFooter className="border-t ">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    createRoomQ(propertyId, roomDetails)
                                  }
                                  disabled={loading}
                                >
                                  {loading ? "Creating..." : "Create Room"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>

                        {/* Edit Room */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <AlertDialog
                            open={openDialog === "edit"}
                            onOpenChange={(open) => {
                              if (!open) {
                                setOpenDialog(null);
                                setRoomDetails(emptyRoomDetails);
                              }
                            }}                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDialog("edit");
                                  setRoomDetails({
                                    roomName: room.roomName,
                                    roomType: room.roomType,
                                    totalRoom: room.totalRoom,
                                    floor: room.floor,
                                    roomSize: room.roomSize,
                                    roomUnit: room.roomUnit,
                                    smokingPolicy: room.smokingPolicy,
                                    maxOccupancy: room.maxOccupancy,
                                    maxNumberOfAdults: room.maxNumberOfAdults,
                                    maxNumberOfChildren: room.maxNumberOfChildren,
                                    numberOfBedrooms: room.numberOfBedrooms,
                                    numberOfLivingRoom: room.numberOfLivingRoom,
                                    extraBed: room.extraBed,
                                    description: room.description,
                                    image: room.image,
                                    available: room.available,
                                    view360Link: room.view360Link,
                                    roomVideos: room.roomVideos,
                                    priority: room.priority,
                                    RoomViews: room.RoomViews,
                                    _translations:room._translations
                                  });
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Edit Details
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                              <AlertDialogHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <AlertDialogTitle className="text-xl">
                                      Update {room.roomName}
                                    </AlertDialogTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Modify room details and specifications
                                    </p>
                                  </div>
                                  <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                                    <X className="h-4 w-4" />
                                  </AlertDialogCancel>
                                </div>
                                <UpdateRoom
                                  roomDetails={roomDetails}
                                  isLoading={loading}
                                  updateRoomDetails={setRoomDetails}
                                />
                              </AlertDialogHeader>
                              <AlertDialogFooter className="border-t pt-4">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    updateRoomQ(
                                      propertyId,
                                      room.id,
                                      roomDetails,
                                    )
                                  }
                                  disabled={loading}
                                >
                                  {loading ? "Updating..." : "Update Room"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>

                        {/* Translations */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => {
                            e.preventDefault();
                            setTranslationRoomId(room.roomType);
                            setAddTranslationOpen(true);
                          }}
                        >
                          <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto font-normal">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Translation
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => {
                            e.preventDefault();
                            setTranslationRoomId(room.roomType);
                            setCheckTranslationsOpen(true);
                          }}
                        >
                          <Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto font-normal">
                            <Languages className="h-4 w-4 mr-2" />
                            Check Translations
                          </Button>
                        </DropdownMenuItem>

                        {/* Add 360° View */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected360Room({
                                id: room.id,
                                name: room.roomName,
                                view360Link: room.view360Link || "",
                              });
                              setIs360ViewModalOpen(true);
                            }}
                          >
                            <Rotate3d className="h-4 w-4 mr-2" />
                            {room.view360Link ? "Update" : "Add"} 360° View
                          </Button>
                        </DropdownMenuItem>
                        {/* Add/Update Video */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoomId(room.id);
                              setSelectedRoomName(room.roomName);
                              setIsVideoModalOpen(true);
                            }}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {room.roomVideos?.url ? "Update" : "Add"} Video
                          </Button>
                        </DropdownMenuItem>

                        {/* Delete Video */}

                        {room.roomVideos?.url && (
                          <DropdownMenuItem
                            className="p-0 focus:bg-transparent"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start px-2 py-1.5 h-auto font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoomId(room.id); // Store room ID for deletion
                                setIsDeleteDialogOpen(true); // Open confirmation dialog
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remove Video
                            </Button>
                          </DropdownMenuItem>
                        )}
                        {/* Delete Room */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 h-auto font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Room
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete {room.roomName}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the room and all its
                                  associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(propertyId, room.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Room
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <PropertyMediaGallery
                      propertyVideo={
                        room.roomVideos?.url ? room.roomVideos : undefined
                      }
                      propertyImages={room.image || []}
                      type="room"
                    />
                  </div>

                  {/* Room Details */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <label className="text-xs font-medium text-gray-500  tracking-wide mb-2 block">
                        Description
                      </label>
                      <PropertyDetailsDialog description={room.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Max Occupancy
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.maxNumberOfAdults} Adults,{" "}
                          {room.maxNumberOfChildren} Children
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Room View
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.RoomViews?.MasterRoomView?._translations?room.RoomViews.MasterRoomView._translations.viewName:room.RoomViews?.MasterRoomView?.viewName || "—"}
                        </p>
                      </div>


                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Smoking Policy
                        </label>
                        <p className="text-sm text-gray-900">
                          {capitalizeFirstLetter(room.smokingPolicy.replace(/_/g, " ")) || "—"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Floor
                        </label>
                        <p className="text-sm text-gray-900">
                          Floor {room.floor}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Available Rooms
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.totalRoom}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          No. of Living Rooms
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.numberOfLivingRoom}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Bedrooms
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.numberOfBedrooms}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          Extra Beds
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.extraBed}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room Amenities */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-3 border-b border-primary/20 pb-2">
                      <label className="text-xs font-medium text-gray-500  tracking-wide">
                        Room Amenities
                      </label>
                      {room.roomAmenities && room.roomAmenities.length > 0 ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-primary-600 hover:text-primary-700"
                              onClick={() => {
                                const initial: Record<string, boolean> = {};
                                (room.roomAmenities ?? []).forEach((selection) => {
                                  initial[selection.amenity.amenityName] = true;
                                });
                                setUpdatedAmenities(initial);
                              }}
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-4xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <AlertDialogTitle className="text-xl">
                                    Update Room Amenities
                                  </AlertDialogTitle>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Modify amenities for {room.roomName}
                                  </p>
                                </div>
                                <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                                  <X className="h-4 w-4" />
                                </AlertDialogCancel>
                              </div>
                              <UpdateRoomAmenityUi
                                availableAmenities={room.roomAmenities.map(
                                  (selection) => selection.amenity.amenityName,
                                )}
                                setSelectedAmenities={setUpdatedAmenities}
                              />
                            </AlertDialogHeader>
                            <AlertDialogFooter className="border-t pt-4">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  updateRoomAmenityQ(
                                    propertyId,
                                    room.id,
                                    updatedAmenities,
                                  )
                                }
                                disabled={loading}
                              >
                                {loading ? "Updating..." : "Update Amenities"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-primary-600 hover:text-primary-700"
                              onClick={() => {
                                setUpdatedAmenities({});
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-4xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <AlertDialogTitle className="text-xl">
                                    Add Room Amenities
                                  </AlertDialogTitle>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Select amenities for {room._translations?room._translations.roomName:room.roomName}
                                  </p>
                                </div>
                                <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                                  <X className="h-4 w-4" />
                                </AlertDialogCancel>
                              </div>
                              <UpdateRoomAmenityUi
                                availableAmenities={[]}
                                setSelectedAmenities={setUpdatedAmenities}
                              />
                            </AlertDialogHeader>
                            <AlertDialogFooter className="border-t pt-4">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  addRoomAmenityQ(
                                    propertyId,
                                    room.id,
                                    updatedAmenities,
                                  )
                                }
                                disabled={loading}
                              >
                                {loading ? "Adding..." : "Add Amenities"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    {room?.roomAmenities && room.roomAmenities.length > 0 ? (
                      <div className="space-y-2">
                        {room.roomAmenities.map((selection) => (
                          <div
                            key={selection.id}
                            className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                            <span className="capitalize">
                              {selection.amenity._translations?selection.amenity._translations.amenityName:selection.amenity.amenityName}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                          <Plus className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-1">
                          No amenities added
                        </p>
                        <p className="text-xs text-gray-400">
                          Click "Add" to include amenities
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-primary/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bed className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-1">
              No Rooms Configured
            </h3>
            <p className="text-sm text-primary-600 mb-4 text-center max-w-sm">
              Start by creating your first room type to showcase your property's
              accommodations
            </p>
            <AlertDialog
              open={openDialog === "create"}
              onOpenChange={(open) => {
                if (!open) {
                  setOpenDialog(null);
                  setRoomDetails(emptyRoomDetails);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDialog("create");
                    setRoomDetails(emptyRoomDetails);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <AlertDialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <AlertDialogTitle className="text-xl">
                        Create New Room
                      </AlertDialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Add a new room type to your property
                      </p>
                    </div>
                    <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </AlertDialogCancel>
                  </div>
                  <UpdateRoom
                    roomDetails={roomDetails}
                    isLoading={loading}
                    updateRoomDetails={setRoomDetails}
                  />
                </AlertDialogHeader>
                <AlertDialogFooter className="border-t ">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => createRoomQ(propertyId, roomDetails)}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Room"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* 360° View Modal */}
      {selected360Room && (
        <Room360ViewModal
          isOpen={is360ViewModalOpen}
          propertyId={propertyId}
          onClose={() => {
            setIs360ViewModalOpen(false);
            setSelected360Room(null);
          }}
          roomId={selected360Room.id}
          roomName={selected360Room.name}
          currentView360Link={selected360Room.view360Link}
          onSuccess={() => {
            fetchRoom(propertyId);
          }}
        />
      )}

      {/* Panorama Viewer Dialog */}
      <Dialog
        open={isPanoramaViewerOpen}
        onOpenChange={setIsPanoramaViewerOpen}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl">
              360° View - {panoramaRoomName}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Drag to look around • Scroll to zoom • Click fullscreen for
              immersive experience
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            {panoramaUrl && <PanoramaViewer imageUrl={panoramaUrl} />}
          </div>
        </DialogContent>
      </Dialog>
      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedRoomId("");
          setSelectedRoomName("");
        }}
        onUploadSuccess={handleVideoUploadSuccess}
        title={`Upload Video for ${selectedRoomName}`}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this video?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              room video from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo} // Now calls without parameter
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeletingVideo} // Added disabled state
            >
              {isDeletingVideo ? "Deleting..." : "Delete Video"}{" "}
              {/* Added loading text */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {translationRoomId && (
        <>
          <AddRoomLangDialog open={addTranslationOpen} onOpenChange={setAddTranslationOpen} roomId={translationRoomId} />
          <CheckRoomLangDialog open={checkTranslationsOpen} onOpenChange={setCheckTranslationsOpen} roomId={translationRoomId} />
        </>
      )}
    </div>
  );
}
