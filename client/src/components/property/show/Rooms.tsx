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
    <div className="bg-white text-black font-sans p-8  mx-auto">
      {rooms.length > 0 ? (
        <div className="space-y-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className={`shadow-none border-t-0 border-l-0 border-r-0 rounded-none md:border-t md:border-l md:border-r  md:rounded-lg ${!room.available && "border-red-400"
                }`}
            >
              <CardHeader>
                <div className="flex w-full justify-between items-center">
                  {" "}
                  {/* Added items-center for vertical alignment */}
                  <CardTitle>{room.roomName}</CardTitle>
                  <div className="flex items-center gap-2">
                    {room.view360Link && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPanoramaUrl(room.view360Link!);
                          setPanoramaRoomName(room.roomName);
                          setIsPanoramaViewerOpen(true);
                        }}
                        className="h-8"
                      >
                        <Rotate3d className="w-4 h-4 mr-1" />
                        360° View
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Room Actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-48 p-2 space-y-1"
                    >
                      {/* Edit Action */}
                      <DropdownMenuItem
                        className="p-0 focus:bg-transparent"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-start px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomDetails({});
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2 text-gray-700" />
                              <span>Create Room</span>
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-center">
                                <AlertDialogTitle>Create Room</AlertDialogTitle>
                                <AlertDialogCancel className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                                  <X className="h-4 w-4" />
                                </AlertDialogCancel>
                              </div>
                              <UpdateRoom
                                roomDetails={roomDetails}
                                isLoading={loading}
                                updateRoomDetails={setRoomDetails}
                              />
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  createRoomQ(propertyId, roomDetails);
                                }}
                              >
                                {loading ? "Updating..." : "Update Changes"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="p-0 focus:bg-transparent"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-start px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomDetails(room);
                              }}
                            >
                              <PenTool className="h-4 w-4 mr-2 text-gray-700" />
                              <span>Edit</span>
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                            <AlertDialogHeader>
                              <div className="flex justify-between items-center">
                                <AlertDialogTitle>
                                  Update {room.roomName} Room
                                </AlertDialogTitle>
                                <AlertDialogCancel className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                                  <X className="h-4 w-4" />
                                </AlertDialogCancel>
                              </div>
                              <UpdateRoom
                                roomDetails={roomDetails}
                                isLoading={loading}
                                updateRoomDetails={setRoomDetails}
                              />
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  updateRoomQ(
                                    propertyId,
                                    room.id,
                                    roomDetails
                                  );
                                }}
                              >
                                {loading ? "Updating..." : "Update Changes"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>

                      {/* Delete Action */}
                      <DropdownMenuItem
                        className="p-0 focus:bg-transparent"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-start px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              <span>Delete</span>
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the {room.roomName} Room.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(propertyId, room.id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                      {/*  */}
                      <DropdownMenuItem
                        className="p-0 focus:bg-transparent"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Button
                          variant="ghost"
                          className="w-full flex items-center justify-start px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected360Room({
                              id: room.id,
                              name: room.roomName,
                              view360Link: room.view360Link || '',
                            });
                            setIs360ViewModalOpen(true);
                          }}
                        >
                          <Rotate3d className="h-4 w-4 mr-2 text-gray-700" />
                          <span>Add 360° View</span>
                        </Button>
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2 text-gray-500">
                  <span>{room.roomType}</span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {room.roomSize} {room.roomUnit}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{room.totalRoom} Rooms</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Room Images */}
                  <div className="md:col-span-1 lg:col-span-1 space-y-3">
                    {room.image && room.image.length > 0 ? (
                      <ImageSlider images={room.image} height="h-60" />
                    ) : (
                      <div className="h-60 bg-gray-200 flex items-center justify-center rounded-lg">
                        <p className="text-gray-500">No room images</p>
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="space-y-4 md:col-span-1 lg:col-span-1">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Description
                      </h4>
                      <PropertyDetailsDialog description={room.description} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                          Occupancy
                        </h5>
                        <p className="text-sm text-gray-700">
                          {room.maxNumberOfAdults} adults,{" "}
                          {room.maxNumberOfChildren} children
                        </p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                          View
                        </h5>
                        <p className="text-sm text-gray-700">{room.roomView}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                          Beds & Rooms
                        </h5>
                        <p className="text-sm text-gray-700">
                          {room.numberOfBedrooms} bedrooms,{" "}
                          {room.numberOfLivingRoom} living rooms
                        </p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                          Smoking Policy
                        </h5>
                        <p className="text-sm text-gray-700">
                          {room.smokingPolicy}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1 lg:col-span-1">
                    <div className="w-full">
                      <div className="w-full flex justify-between">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Room Amenities
                        </h4>
                        {room.roomAmenities && room.roomAmenities.length > 0 ? (
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Button className="h-8 w-12">
                                <PenTool className="h-6" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-4xl">
                              <AlertDialogHeader>
                                <div className="flex justify-between items-center">
                                  <AlertDialogTitle>Add or Remove {room.roomName} Amenities</AlertDialogTitle>
                                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                  </AlertDialogCancel>
                                </div>
                                <UpdateRoomAmenityUi
                                  availableAmenities={room.roomAmenities.map(selection => selection.amenity.amenityName)}
                                  setSelectedAmenities={setUpdatedAmenities}
                                />
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    updateRoomAmenityQ(propertyId, room.id, updatedAmenities);
                                  }}
                                >
                                  {loading ? "Updating..." : "Update Changes"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Button className="h-8 w-12">
                                <Plus className="h-6" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <div className="flex justify-between items-center">
                                  <AlertDialogTitle>Add {room.roomName} Amenities</AlertDialogTitle>
                                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                  </AlertDialogCancel>
                                </div>
                                <UpdateRoomAmenityUi
                                  availableAmenities={[]}
                                  setSelectedAmenities={
                                    setUpdatedAmenities
                                  }
                                />
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    addRoomAmenityQ(propertyId, room.id, updatedAmenities);
                                  }}
                                >
                                  {loading ? "Creating..." : "Create Amenities"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    {room?.roomAmenities && room.roomAmenities.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        {room.roomAmenities.map(
                          (selection) =>
                            <li
                              key={selection.id}
                              className="flex items-center capitalize"
                            >
                              <span className="ml-2">
                                {selection.amenity.amenityName}
                              </span>
                            </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">
                        No amenities available for this room. Add some
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No room types configured</p>
        </div>
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
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-3 flex-shrink-0">
            <DialogTitle>360° View - {panoramaRoomName}</DialogTitle>
            <DialogDescription>
              Drag to look around • Scroll to zoom • Click fullscreen for immersive experience
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full px-6 pb-6 min-h-0">
            {panoramaUrl && <PanoramaViewer imageUrl={panoramaUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
