import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { SpasForUserService } from "./services";
import toast from "react-hot-toast";
import type { ILoader } from "../dashboard/interface";
import Loader from "@/components/Loader/Loader";
import type { ISpa, ISpaDates, ISpaSlotsWReservation } from "./interfaces";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, Calendar, User, UserX } from "lucide-react";
import ImageSlider from "@/components/shared/ImageSlider";

export default function MySpa() {
    const { propertyId } = useParams();
    const [loader, setLoader] = useState<ILoader>({ isLoading: false, message: "" });
  const [spas, setSpas] = useState<ISpa[]>([]);

    useEffect(() => {
        if(propertyId) {
            fetchUserSpa(propertyId);
        }
    }, [propertyId]);
    const fetchUserSpa = async (propertyId:string) => {
        setLoader({ isLoading: true, message: "Loading assigned spa information..." });
        try {
            const result = await SpasForUserService(propertyId);
            if(result.success){
                setSpas(result.data || []);
            }else{
                toast.error(result.message||"An error occurred while fetching spa information");
            }
        } catch (error) {
            toast.error("An error occurred while fetching spa information");
        }finally{
            setLoader({ isLoading: false, message: "" });
        }
    };

    const formatTime = (dateObj: Date | string) => {
        return format(new Date(dateObj), "hh:mm a");
    };

    const formatDate = (dateObj: Date | string) => {
        return format(new Date(dateObj), "EEE, MMM do yyyy");
    };

  return (
    <div className="container mx-auto py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Assigned Spas & Activities</h1>
            <p className="text-gray-500 mt-2">Manage and view the schedule for the spas assigned to you.</p>
        </div>

      {loader.isLoading ? (
        <Loader text={loader.message} />
      ) : (
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
            {spas.length > 0 ? (
                spas.map((spa) => (
                    <Card key={spa.id} className="shadow-md border-t-4 border-t-primary overflow-hidden">
                        <CardHeader className="bg-gray-50/50 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-xl">{spa.name}</CardTitle>
                                        <Badge variant={spa.isActive ? "default" : "secondary"}>
                                            {spa.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 max-w-md">
                                        {spa.description || "No description available."}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="font-mono bg-white">
                                        CODE: {spa.itemCode}
                                    </Badge>
                                </div>
                            </div>
                            
                            {(spa.images && spa.images.length > 0) && (
                                <div className="mt-4">
                                    <ImageSlider images={spa.images} height="h-48" alt={spa.name} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-primary/70" />
                                    <span>{spa.serviceTime} mins session</span>
                                </div>
                                {spa.location && (
                                    <div className="flex items-center gap-1.5">
                                        <span>📍 {spa.location}</span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            {/* @ts-ignore - SpaDates mapping assuming API sends dates aligned in this structure */}
                            {spa.SpaDates && spa.SpaDates.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {/* @ts-ignore */}
                                    {spa.SpaDates.map((spaDate: ISpaDates) => (
                                        <AccordionItem value={spaDate.id} key={spaDate.id} className="border-b-0 border-t px-4">
                                            <AccordionTrigger className="hover:no-underline py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-base">{formatDate(spaDate.date)}</p>
                                                        <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                                            {spaDate.Slots?.length || 0} slots available
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            
                                            <AccordionContent className="pt-2 pb-4">
                                                {spaDate.Slots && spaDate.Slots.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {spaDate.Slots.map((slot: ISpaSlotsWReservation) => (
                                                            <div 
                                                                key={slot.id} 
                                                                className={`p-3 rounded-lg border transition-colors flex flex-col justify-between
                                                                    ${slot.isBooked 
                                                                        ? "bg-red-50/50 border-red-100" 
                                                                        : "bg-green-50/50 border-green-100 hover:border-green-300"
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="font-medium flex items-center gap-1.5">
                                                                        <Clock className={`w-3.5 h-3.5 ${slot.isBooked ? "text-red-500" : "text-green-600"}`} />
                                                                        {formatTime(slot.startTime)}
                                                                        {slot.endTime && ` - ${formatTime(slot.endTime)}`}
                                                                    </div>
                                                                    <Badge 
                                                                        variant={slot.isBooked ? "destructive" : "outline"}
                                                                        className={!slot.isBooked ? "text-green-700 bg-green-50 border-green-200" : ""}
                                                                    >
                                                                        {slot.isBooked ? "Reserved" : "Available"}
                                                                    </Badge>
                                                                </div>
                                                                
                                                                {slot.isBooked ? (
                                                                    <div className="mt-1 pt-2 border-t border-red-100/50 space-y-1">
                                                                        {/* @ts-ignore - Assuming userName and reservationId exists from schema */}
                                                                        {slot.userName && (
                                                                            <div className="flex items-center gap-1.5 text-sm text-red-900/80">
                                                                                <User className="w-3.5 h-3.5" />
                                                                                <span className="font-medium truncate">{slot.userName}</span>
                                                                            </div>
                                                                        )}
                                                                        {/* @ts-ignore */}
                                                                        {slot.reservationId && (
                                                                            <div className="text-xs text-red-700/60 font-mono ml-5">
                                                                                {/* @ts-ignore */}
                                                                                Booking Code: {slot.Reservation.bookingCode.split("-")[1]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-1 pt-2 border-t border-green-100/50 flex flex-col justify-center items-center h-full min-h-[40px]">
                                                                        <span className="text-xs text-green-700/70 font-medium">Slot is open for booking</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                                        No time slots configured for this date.
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 m-4 rounded-lg border border-dashed">
                                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                                    <p>No dates or schedule configured for this spa.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="col-span-full py-16 text-center border rounded-xl bg-gray-50">
                    <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Spas Assigned</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                        You do not currently have any spas or activities assigned to your account.
                    </p>
                </div>
            )}
        </div>
      )}
    </div>
  )
}