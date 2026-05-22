import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { addRoomInventoryService, fetchRoomAvailabilityService, fetchRoomTypesService } from "./services";
import type { IRoomDateAvailability, LoaderProps, RoomTypes, SelectedRoom } from "./types";
import Loader from "@/components/Loader/Loader";
import { toast } from "react-hot-toast";
import BackButton from "@/components/shared/BackButton";
import { Calendar, Plus, Package, Bed, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AvailabilityCalendar } from "./components";
import { useTranslation } from "react-i18next";


export default function Inventory() {
    const { t } = useTranslation();

  const { propertyId } = useParams<{ propertyId: string }>();
  const [allRooms, setAllRooms] = useState<RoomTypes[]>([]);
  const [availability, setAvailability] = useState<IRoomDateAvailability[]>([]);

  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom>({
    id: "",
    roomName: "",
    roomType: "",
    totalRoom: 0,
    availableRooms: 0,
    startDate: "",
    endDate: "",
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [loader, setLoader] = useState<LoaderProps>({ isLoading: true, text: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    if (!propertyId) {
      toast.error(t("Inventory.propertyIdRequired"));
      return;
    }
    try {
      setLoader({ isLoading: true, text: t("Inventory.loadingRoomTypes") });
      const response = await fetchRoomTypesService(propertyId);
      if (response.success) {
        setAllRooms(response.data || []);
        toast.success(response?.message || t("Inventory.roomTypesFetchedSuccess"));
      } else {
        toast.error(response?.message || t("Inventory.failedFetchRoomTypes"));
      }
    } catch {
      toast.error(t("Inventory.failedFetchRoomTypes"));
    } finally {
      setLoader({ isLoading: false, text: "" });
    }
  };

  const handleRoomSelect = (roomId: string) => {
    const room = allRooms.find((r) => r.id === roomId);
    if (room) {
      setSelectedRooms({
        ...selectedRooms,
        id: room.id,
        roomName: room.roomName,
        roomType: room.roomType,
        totalRoom: room.totalRoom,
      });
      fetchAvailability(room.roomType);
    }
  };

  const fetchAvailability = async (roomType: string) => {
    if (!propertyId) return;
    try {
      const res = await fetchRoomAvailabilityService(propertyId, roomType);
      if (res.success) setAvailability(res.data || []);
      else toast.error(res.message || t("Inventory.failedFetchAvailability"));
    } catch {
      toast.error(t("Inventory.failedFetchAvailability"));
    }
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    if (range.from) setFromDateOpen(false);
    if (range.to) setToDateOpen(false);
    if (range.from && range.to) {
      setSelectedRooms({
        ...selectedRooms,
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: format(range.to, "yyyy-MM-dd"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRooms.id) return toast.error(t("Inventory.selectRoomTypeError"));
    if (!selectedRooms.startDate || !selectedRooms.endDate) return toast.error(t("Inventory.selectDateRangeError"));
    if (selectedRooms.availableRooms <= 0) return toast.error(t("Inventory.availableRoomsError"));
    if (selectedRooms.availableRooms > selectedRooms.totalRoom) return toast.error(t("Inventory.availableRoomsExceedError"));

    try {
      setIsSaving(true);
      const response = await addRoomInventoryService(propertyId!, selectedRooms);
      if (response.success) {
        toast.success(response?.message || t("Inventory.inventoryAddedSuccess"));
        setSelectedRooms({ id: "", roomName: "", roomType: "", totalRoom: 0, availableRooms: 0, startDate: "", endDate: "" });
        setDateRange({ from: undefined, to: undefined });
      } else {
        toast.error(response?.message || t("Inventory.failedAddInventory"));
      }
    } catch {
      toast.error(t("Inventory.errorAddingInventory"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loader.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loader.text} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("Inventory.title")}</h1>
              <p className="text-gray-600">{t("Inventory.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── LEFT: Form (2 cols) ── */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t("Inventory.addRoomInventory")}
              </CardTitle>
              <CardDescription>
                {t("Inventory.addRoomInventoryDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    {t("Inventory.roomType")}
                  </Label>
                  <Select value={selectedRooms.id} onValueChange={handleRoomSelect}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder={t("Inventory.selectRoomType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {allRooms.length > 0 ? (
                        allRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{room._translations?room._translations.roomName:room.roomName}</span>
                              <span className="text-xs text-gray-500 ml-4">
                                ({room.totalRoom} rooms)
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-rooms" disabled>
                          {t("Inventory.noRoomsAvailable")}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("Inventory.dateRange")}
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Start Date */}
                    <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full h-11 justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : <span>{t("Inventory.startDate")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => handleDateSelect({ from: date, to: dateRange.to })}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="rounded-md border w-full"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* End Date */}
                    <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full h-11 justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : <span>{t("Inventory.endDate")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => handleDateSelect({ from: dateRange.from, to: date })}
                          disabled={(date) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                            if (date < today) return true;
                            if (dateRange.from && date < dateRange.from) return true;
                            return false;
                          }}
                          initialFocus
                          className="rounded-md border w-full"
                          classNames={{
                            day_disabled: "!text-gray-400 !opacity-30 line-through pointer-events-none",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {dateRange.from && dateRange.to && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
                      {t("Inventory.daysSelected", { count: Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) })}
                    </p>
                  )}
                </div>

                {/* Available Rooms */}
                <div className="space-y-2">
                  <Label htmlFor="availableRooms" className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t("Inventory.availableRooms")}
                  </Label>
                  <Input
                    id="availableRooms"
                    type="number"
                    min="0"
                    max={selectedRooms.totalRoom || undefined}
                    placeholder={t("Inventory.availableRoomsPlaceholder")}
                    value={selectedRooms.availableRooms || ""}
                    onChange={(e) =>
                      setSelectedRooms({ ...selectedRooms, availableRooms: parseInt(e.target.value) || 0 })
                    }
                    className="h-12"
                  />
                  {selectedRooms.totalRoom > 0 && (
                    <p className="text-xs text-gray-500">{t("Inventory.maximumRooms", { count: selectedRooms.totalRoom })}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSaving || !selectedRooms.id}
                >
                  {isSaving ? (
                    <><span className="animate-spin mr-2">⏳</span>{t("Inventory.addingInventory")}</>
                  ) : (
                    <><Plus className="w-5 h-5 mr-2" />{t("Inventory.addInventory")}</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ── RIGHT: Stacked column ── */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">


            <AvailabilityCalendar
              availability={availability}
              totalRooms={selectedRooms.totalRoom}
              onDayClick={(date) => {
                setDateRange((prev) => ({ from: date, to: prev.to }));
                setSelectedRooms((prev) => ({
                  ...prev,
                  startDate: format(date, "yyyy-MM-dd"),
                }));
                document.getElementById("availableRooms")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}