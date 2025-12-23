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
} from "lucide-react";
import ImageSlider from "@/components/shared/ImageSlider";
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
import { updateRoom, createRoom, deleteRoom, updateRoomAmenity, createRoomAmenity } from "../api/show/room";
import UpdateRoomAmenityUi from "../update/RoomAmenity"
import Room360ViewModal from "../Room360ViewModal";
import { uploadImages } from "../api/create/propertyinfo";
import PanoramaViewer from "../PanoramaViewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PropertyId {
  propertyId: string;
}

export default function Rooms({ propertyId }: PropertyId) {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [roomDetails, setRoomDetails] = useState<IRoomDetails>({
    roomName: "",
    roomType: "",
    totalRoom: 0,
    roomView: "",
    floor: 0,
    roomSize: 0,
    roomUnit: "sqft",
    smokingPolicy: "Non-Smoking",
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
  });
  const [updatedAmenities, setUpdatedAmenities] = useState<Record<string, boolean>>({});
  const [is360ViewModalOpen, setIs360ViewModalOpen] = useState(false);
  const [selected360Room, setSelected360Room] = useState<{ id: string; name: string; view360Link?: string } | null>(null);
  const [isPanoramaViewerOpen, setIsPanoramaViewerOpen] = useState(false);
  const [panoramaUrl, setPanoramaUrl] = useState<string>("");
  const [panoramaRoomName, setPanoramaRoomName] = useState<string>("");

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
      if (response.success && response.data?.propertyRoom) {
        const data = response.data.propertyRoom;
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
    roomDetails: IRoomDetails
  ) => {
    setLoading(true);
    try {
      const res = await updateRoom(propertyId, roomId, roomDetails);
      if (res.success) {
        toast.success("Room Updated Successfully");
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
  const addRoomAmenityQ = async (propertyId: string, roomId: string, payload: Record<string, boolean>) => {
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
  }
  const updateRoomAmenityQ = async (propertyId: string, roomId: string, payload: any) => {
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
  }
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
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl font-semibold text-gray-900">
                        {room.roomName}
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
                        {room.totalRoom} {room.totalRoom === 1 ? 'Room' : 'Rooms'}
                      </span>
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
                        className="gap-2"
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoomDetails({});
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
                              <AlertDialogFooter className="border-t pt-4">
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
                        </DropdownMenuItem>

                        {/* Edit Room */}
                        <DropdownMenuItem
                          className="p-0 focus:bg-transparent"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoomDetails(room);
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
                                  onClick={() => updateRoomQ(propertyId, room.id, roomDetails)}
                                  disabled={loading}
                                >
                                  {loading ? "Updating..." : "Update Room"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                                <AlertDialogTitle>Delete {room.roomName}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete
                                  the room and all its associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(propertyId, room.id)}
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
                  {/* Room Images */}
                  <div className="lg:col-span-4">
                    {room.image && room.image.length > 0 ? (
                      <ImageSlider images={room.image} height="h-64" />
                    ) : (
                      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                        <Bed className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No images uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                        Description
                      </label>
                      <PropertyDetailsDialog description={room.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Max Occupancy
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.maxNumberOfAdults} Adults, {room.maxNumberOfChildren} Children
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Room View
                        </label>
                        <p className="text-sm text-gray-900">{room.roomView || "—"}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Bedrooms & Living
                        </label>
                        <p className="text-sm text-gray-900">
                          {room.numberOfBedrooms} Bedroom{room.numberOfBedrooms !== 1 ? 's' : ''}, {room.numberOfLivingRoom} Living
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Smoking Policy
                        </label>
                        <p className="text-sm text-gray-900">{room.smokingPolicy}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Floor
                        </label>
                        <p className="text-sm text-gray-900">Floor {room.floor}</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                          Extra Beds
                        </label>
                        <p className="text-sm text-gray-900">{room.extraBed} Available</p>
                      </div>
                    </div>
                  </div>

                  {/* Room Amenities */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Room Amenities
                      </label>
                      {room.roomAmenities && room.roomAmenities.length > 0 ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
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
                                  (selection) => selection.amenity.amenityName
                                )}
                                setSelectedAmenities={setUpdatedAmenities}
                              />
                            </AlertDialogHeader>
                            <AlertDialogFooter className="border-t pt-4">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  updateRoomAmenityQ(propertyId, room.id, updatedAmenities)
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
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
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
                                    Select amenities for {room.roomName}
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
                                  addRoomAmenityQ(propertyId, room.id, updatedAmenities)
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
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="capitalize">
                              {selection.amenity.amenityName}
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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bed className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Rooms Configured
            </h3>
            <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
              Start by creating your first room type to showcase your property's accommodations
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Room
            </Button>
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
          uploadImages={uploadImages}
          onSuccess={() => {
            fetchRoom(propertyId);
          }}
        />
      )}

      {/* Panorama Viewer Dialog */}
      <Dialog open={isPanoramaViewerOpen} onOpenChange={setIsPanoramaViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl">360° View - {panoramaRoomName}</DialogTitle>
            <DialogDescription className="text-sm">
              Drag to look around • Scroll to zoom • Click fullscreen for immersive experience
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            {panoramaUrl && <PanoramaViewer imageUrl={panoramaUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
