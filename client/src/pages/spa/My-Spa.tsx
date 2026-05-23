import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { ILoader } from "../dashboard/interface";
import Loader from "@/components/Loader/Loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpasForUserService, markSlotAsCompletedService } from "./services";
import type { ISpa, ISpaDates } from "./interfaces";
import { format, startOfDay, endOfDay } from "date-fns";
import { Calendar, Clock, UserX } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ImageSlider from "@/components/shared/ImageSlider";

export default function MySpa() {
    const { t } = useTranslation('MySpa');
    const { propertyId } = useParams();
    const [loader, setLoader] = useState<ILoader>({ isLoading: false, message: "" });
    const [spas, setSpas] = useState<ISpa[]>([]);
    
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfDay(new Date()),
        end: endOfDay(new Date())
    });

    useEffect(() => {
        if (propertyId) {
            fetchUserSpa(propertyId);
        }
    }, [propertyId, dateRange]);
    
    const fetchUserSpa = async (propertyId: string) => {
        setLoader({ isLoading: true, message: t('Spa.loader.loading') });
        try {
            const startISO = format(dateRange.start, "yyyy-MM-dd'T'HH:mm:ss");
            const endISO = format(dateRange.end, "yyyy-MM-dd'T'HH:mm:ss");
            
            const result = await SpasForUserService(propertyId, startISO, endISO);
            if (result.success) {
                setSpas(result.data || []);
            } else {
                toast.error(result.message || t('Spa.toast.fetchError'));
            }
        } catch (error) {
            toast.error(t('Spa.toast.fetchError'));
        } finally {
            setLoader({ isLoading: false, message: "" });
        }
    };

    const handleMarkCompleted = async (slotId: string) => {
        if (!propertyId) return;
        setLoader({ isLoading: true, message: t('Spa.loader.markingCompleted') });
        try {
            const res = await markSlotAsCompletedService(slotId);
            if (res.success) {
                toast.success(t('Spa.toast.markCompletedSuccess'));
                const startISO = format(dateRange.start, "yyyy-MM-dd'T'HH:mm:ss");
                const endISO = format(dateRange.end, "yyyy-MM-dd'T'HH:mm:ss");
                const result = await SpasForUserService(propertyId, startISO, endISO);
                if (result.success) setSpas(result.data || []);
            } else {
                toast.error(res.message || t('Spa.toast.markCompletedFailed'));
            }
        } catch (error) {
            toast.error(t('Spa.toast.markCompletedError'));
        } finally {
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
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('Spa.title')}</h1>
                    <p className="text-gray-500 mt-2">{t('Spa.subtitle')}</p>
                </div>
                
                {/* Filter */}
                <div className="flex flex-col gap-2 bg-white p-4 border rounded-md shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">{t('Spa.filter.startDate')}</span>
                            <input 
                                type="date" 
                                className="text-sm border rounded p-1.5 focus:ring-primary focus:border-primary"
                                value={format(dateRange.start, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setDateRange(prev => ({...prev, start: startOfDay(new Date(e.target.value))}));
                                    }
                                }}
                            />
                        </div>
                        <span className="text-gray-400 mt-5">-</span>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">{t('Spa.filter.endDate')}</span>
                            <input 
                                type="date" 
                                className="text-sm border rounded p-1.5 focus:ring-primary focus:border-primary"
                                value={format(dateRange.end, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setDateRange(prev => ({...prev, end: endOfDay(new Date(e.target.value))}));
                                    }
                                }}
                                min={format(dateRange.start, 'yyyy-MM-dd')}
                            />
                        </div>
                    </div>
                </div>
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
                                                    {spa.isActive ? t('Spa.badge.active') : t('Spa.badge.inactive')}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-2 max-w-md">
                                                {spa.description || t('Spa.card.noDescription')}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="font-mono bg-white">
                                                {t('Spa.card.code')} {spa.itemCode}
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
                                            <span>{spa.serviceTime} {t('Spa.card.minsSession')}</span>
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
                                                                    {spaDate.Slots?.length || 0} {t('Spa.slots.available')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    
                                                    <AccordionContent className="pt-2 pb-4">
                                                        {spaDate.Slots && spaDate.Slots.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {spaDate.Slots.map((slot: any) => (
                                                                    <div key={slot.id} className="border p-3 rounded-lg flex flex-col justify-start gap-2 h-full">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock className="w-4 h-4 text-gray-500" />
                                                                                <span className="font-medium text-sm">
                                                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime || new Date())}
                                                                                </span>
                                                                            </div>
                                                                            {slot.isCompleted ? (
                                                                                <Badge variant="default" className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200">
                                                                                    {t('Spa.badge.completed')}
                                                                                </Badge>
                                                                            ) : slot.isBooked ? (
                                                                                <Badge variant="default" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                                                                                    {t('Spa.badge.booked')}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                                                    {t('Spa.badge.available')}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {slot.isBooked && !slot.isCompleted && (
                                                                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t text-sm flex-grow">
                                                                                <div className="flex flex-col gap-1 text-gray-600">
                                                                                    <span><strong>{t('Spa.slots.guest')}</strong> {slot.userName || t('Spa.table.na')}</span>
                                                                                    {slot.Reservation?.bookingCode && <span><strong>{t('Spa.slots.code')}</strong> {slot.Reservation.bookingCode}</span>}
                                                                                </div>
                                                                                <div className="mt-auto pt-2">
                                                                                    <button 
                                                                                        onClick={() => handleMarkCompleted(slot.id)}
                                                                                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition font-medium text-center w-full"
                                                                                    >
                                                                                        {t('Spa.slots.markCompleted')}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {slot.isCompleted && (
                                                                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t text-sm flex-grow">
                                                                                <div className="flex flex-col gap-1 text-gray-600">
                                                                                    <span><strong>{t('Spa.slots.guest')}</strong> {slot.userName || t('Spa.table.na')}</span>
                                                                                    {slot.Reservation?.bookingCode && <span><strong>{t('Spa.slots.code')}</strong> {slot.Reservation.bookingCode}</span>}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                                                {t('Spa.slots.noSlots')}
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 bg-gray-50 m-4 rounded-lg border border-dashed">
                                            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                                            <p>{t('Spa.slots.noDates')}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center border rounded-xl bg-gray-50">
                            <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">{t('Spa.empty.title')}</h3>
                            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                {t('Spa.empty.subtitle')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}