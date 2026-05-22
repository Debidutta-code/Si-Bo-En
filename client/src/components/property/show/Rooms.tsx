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
import { EditTranslationDialog } from "@/pages/management/components/multilang/ManagementTranslationDialogs";
import { upsertRoomTranslationService } from "../multilang/services/room.services";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PropertyId {
  propertyId: string;
}

export default function Rooms({ propertyId }: PropertyId) {
  const { t } = useTranslation();

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
    RoomViews: { MasterRoomView: { id: "", viewName: "", _translations: { viewName: "" } } },
    _translations: {
      description: "",
      roomName: ""
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
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const [editTranslationRoomId, setEditTranslationRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      toast.error(t("Rooms.propertyIdNotFound"));
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
        toast.error(t("Rooms." + response.message));
        setRooms([]);
      }
    } catch (error: any) {
      toast.error(t("Rooms.failedToFetchRoomDetails"));
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader text={t("Rooms.loadingRooms")} />;
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
        toast.success(t("Rooms.roomUpdatedSuccessfully"));
        setOpenDialog(null);
      } else {
        toast.error(res.message || t("Rooms.failedToUpdateRoomDetails"));
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error(t("Rooms.failedToUpdateRoom"));
    } finally {
      setLoading(false);
    }
  };
  const createRoomQ = async (propertyId: string, payload: IRoomDetails) => {
    setLoading(true);
    try {
      const res = await createRoom(propertyId, payload);
      if (res.success) {
        toast.success(t("Rooms.roomCreatedSuccessfully"));
        setOpenDialog(null);
      } else {
        toast.error(res.message || t("Rooms.failedToCreateRoomDetails"));
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error(t("Rooms.failedToCreateRoom"));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (propertyId: string, roomId: string) => {
    try {
      const res = await deleteRoom(propertyId, roomId);
      if (res.success) {
        toast.success(t("Rooms.roomCreatedSuccessfully"));
      } else {
        toast.error(res.message || t("Rooms.failedToDeleteRoomDetails"));
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error(t("Rooms.failedToDeleteRoom"));
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
        toast.success(t("Rooms.roomAmenityAddedSuccessfully"));
      } else {
        toast.error(res.message || t("Rooms.failedToAddRoomAmenity"));
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error(t("Rooms.failedToAddRoomAmenity"));
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
        toast.success(t("Rooms.roomAmenityUpdatedSuccessfully"));
      } else {
        toast.error(res.message || t("Rooms.failedToUpdateRoomAmenity"));
      }
      fetchRoom(propertyId);
    } catch (error) {
      toast.error(t("Rooms.failedToUpdateRoomAmenity"));
    } finally {
      setLoading(false);
    }
  };
  const handleVideoUploadSuccess = async (
    videoUrl: string,
    thumbnailUrl: string,
  ) => {
    if (!propertyId || !selectedRoomId) {
      toast.error(t("Rooms.propertyIdOrRoomIdMissing"));
      return;
    }

    try {
      const response = await addVideoToRoom(
        selectedRoomId,
        videoUrl,
        thumbnailUrl,
      );

      if (response.success) {
        toast.success(t("Rooms.videoSavedSuccessfully"));
        await fetchRoom(propertyId);
      } else {
        toast.error(response.message || t("Rooms.failedToSaveVideo"));
      }
    } catch (error) {
      toast.error(t("Rooms.failedToSaveVideo"));
    }
  };

  const handleDeleteVideo = async () => {
    // Remove parameter
    if (!propertyId || !selectedRoomId) {
      toast.error(t("Rooms.propertyIdOrRoomIdMissing"));
      return;
    }

    setIsDeleteDialogOpen(false); // Close dialog first

    try {
      setIsDeletingVideo(true);
      const response = await deleteRoomVideo(selectedRoomId); // Use selectedRoomId

      if (response.success) {
        toast.success(t("Rooms.videoDeletedSuccessfully"));
        await fetchRoom(propertyId);
        setSelectedRoomId(""); // Clear selected room ID after deletion
      } else {
        toast.error(response.message || t("Rooms.failedToDeleteVideo"));
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(t("Rooms.failedToDeleteVideo"));
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
                        {room._translations ? room._translations.roomName : room.roomName}
                      </CardTitle>
                      {!room.available && (
                        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                          {t("Rooms.unavailable")}
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
                        {room.totalRoom === 1 ? t("Rooms.room") : t("Rooms.rooms")}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{t("Rooms.priority")}: {room.priority}</span>
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
                        {t("Rooms.view360")}
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
                                {t("Rooms.createNewRoom")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                              <AlertDialogHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <AlertDialogTitle className="text-xl">
                                      {t("Rooms.createNewRoom")}
                                    </AlertDialogTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {t("Rooms.addNewRoomType")}
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
                                <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    createRoomQ(propertyId, roomDetails)
                                  }
                                  disabled={loading}
                                >
                                  {loading ? t("Rooms.creating") : t("Rooms.create")}
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
                                    _translations: room._translations
                                  });
                                }}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                {t("Common.edit")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                              <AlertDialogHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <AlertDialogTitle className="text-xl">
                                      {t("Rooms.updateRoomTitle", { name: room.roomName })}
                                    </AlertDialogTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {t("Rooms.modifyRoomDetails")}
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
                                <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
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
                                  {loading ? t("Rooms.updating") : t("Rooms.update")}
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
                            setTranslationRoomId(room.id);
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
                            setTranslationRoomId(room.id);
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
                            {room.view360Link ? t("Rooms.update360View") : t("Rooms.add360View")}
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
                            {room.roomVideos?.url ? t("Rooms.updateVideo") : t("Rooms.addVideo")}
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
                              {t("Rooms.removeVideo")}
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
                                {t("Rooms.deleteRoom")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("Rooms.deleteRoomTitle", { name: room.roomName })}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("Rooms.deleteRoomDescription")}

                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(propertyId, room.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t("Rooms.deleteRoom")}
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
                        {t("Rooms.description")}
                      </label>
                      <PropertyDetailsDialog description={room.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.maxOccupancy")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.maxNumberOfAdults} {t("Rooms.adults")}, {" "}
                          {room.maxNumberOfChildren} {t("Rooms.children")}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.roomView")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.RoomViews?.MasterRoomView?._translations ? room.RoomViews.MasterRoomView._translations.viewName : room.RoomViews?.MasterRoomView?.viewName || "—"}
                        </p>
                      </div>


                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.smokingPolicy")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {capitalizeFirstLetter(room.smokingPolicy.replace(/_/g, " ")) || "—"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.floor")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {t("Rooms.floor")} {room.floor}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.availableRooms")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.totalRoom}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.livingRooms")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.numberOfLivingRoom}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.bedrooms")}
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.numberOfBedrooms}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500  tracking-wide block">
                          {t("Rooms.extraBeds")}
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
                        {t("Rooms.roomAmenities")}
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
                              {t("Rooms.editAmenities")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-4xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <AlertDialogTitle className="text-xl">
                                    {t("Rooms.updateRoomAmenities")}
                                  </AlertDialogTitle>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {t("Rooms.modifyAmenitiesFor", { name: room.roomName })}
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
                              <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
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
                                {loading ? t("Rooms.updating") : t("Rooms.updateRoomAmenities")}
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
                              {t("Rooms.addAmenities")}

                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-4xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <AlertDialogTitle className="text-xl">
                                    {t("Rooms.addRoomAmenities")}
                                  </AlertDialogTitle>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {t("Rooms.selectAmenitiesFor", { name: room.roomName })}
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
                              <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
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
                                {loading ? t("Rooms.loading") : t("Rooms.addRoomAmenities")}
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
                              {selection.amenity._translations ? selection.amenity._translations.amenityName : selection.amenity.amenityName}
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
                          {t("Rooms.noAmenitiesAdded")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t("Rooms.clickAddToInclude")}
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
              {t("Rooms.noRoomsConfigured")}
            </h3>
            <p className="text-sm text-primary-600 mb-4 text-center max-w-sm">
              {t("Rooms.startByCreating")}

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
                  {t("Rooms.createFirstRoom")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <AlertDialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <AlertDialogTitle className="text-xl">
                        {t("Rooms.createNewRoom")}
                      </AlertDialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("Rooms.addNewRoomType")}
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
                  <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => createRoomQ(propertyId, roomDetails)}
                    disabled={loading}
                  >
                    {loading ? t("Rooms.creating") : t("Rooms.create")}
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
              {t("Rooms.panoramaViewer", { name: panoramaRoomName })}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("Rooms.dragToLookAround")}
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
        title={t("Rooms.uploadVideoFor", { name: selectedRoomName })}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Rooms.deleteVideoTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("Rooms.deleteVideoDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Rooms.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo} // Now calls without parameter
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeletingVideo} // Added disabled state
            >
              {isDeletingVideo ? t("Rooms.deleting") : t("Rooms.deleteVideo")}
              {/* Added loading text */}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {translationRoomId && (
        <>
          <AddRoomLangDialog open={addTranslationOpen} onOpenChange={setAddTranslationOpen} roomId={translationRoomId} />
          <CheckRoomLangDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            roomId={translationRoomId}
            onEdit={(locale, data) => {
              setEditingLocale(locale);
              setEditingData(data);
              setEditTranslationRoomId(translationRoomId);
              setEditTranslationOpen(true);
            }}
          />
        </>
      )}
      {editTranslationRoomId && (
        <EditTranslationDialog
          open={editTranslationOpen}
          onOpenChange={setEditTranslationOpen}
          entityId={editTranslationRoomId}
          locale={editingLocale}
          initialData={editingData}
          title="Edit Room Translation"
          fields={[
            { key: "roomName", label: "Room Name", placeholder: "e.g. Habitación Deluxe" },
            { key: "description", label: "Description", placeholder: "Enter translated description..." },
          ]}
          onSave={async (id, locale, data) => upsertRoomTranslationService(id, { [locale]: data })}
        />
      )}
    </div>
  );
}
