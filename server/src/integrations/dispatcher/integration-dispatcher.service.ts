
import { AriManupulationRepo } from '../../reservation/repository';
import { RTIntegrationDao } from '../rate-tiger/dao/rt-integration.dao';
import { RTReservationPushService } from '../rate-tiger/services/rt-reservation-push.service';
import { SiteMinderReservationService } from '../site-minder/services/site-minder-reservation.service';
import { ICReservationS } from '../../reservation/types';
import { ExistingReservation, RTUpdatePayload } from '../rate-tiger/types';
import { SMIntegrationDao } from '../site-minder/dao';


export interface ActiveIntegrationInfo {
    name: string;
    type: 'channel_manager' | 'pms';
    integrationId: string;
}

export class IntegrationDispatcher {

    // ─── Commit (new reservation) ─────────────────────────────────────────────
    public static async pushCommit(
        payload: ICReservationS,
        propertyId: string,
        countryCode: string,
        bookingCode: string,
        activeIntegration: ActiveIntegrationInfo
    ): Promise<{ success: boolean; message: string }> {
        try {
            if (activeIntegration.name === 'Rate Tiger') {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!rtConfig) {
                    return { success: false, message: 'Rate Tiger config not found' };
                }
                return RTReservationPushService.pushCommit(
                    payload,
                    countryCode,
                    bookingCode,
                    rtConfig
                );
            }

            if (activeIntegration.name === 'Site Minder') {

                const smConfig = await SMIntegrationDao.getSiteMinderConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!smConfig) {
                    return { success: false, message: 'Site Minder config not found' };
                }
                return SiteMinderReservationService.pushCommit(
                    payload,
                    bookingCode,
                    smConfig.siteMinderPropertyCode,
                    smConfig.channelCode,
                    smConfig.channelName,
                    smConfig.reservationUrl
                );
            }

            return { success: false, message: `Unsupported integration: ${activeIntegration.name}` };
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Dispatcher commit error' };
        }
    }

    // ─── Modify ───────────────────────────────────────────────────────────────
    public static async pushModify(
        existingReservation: ExistingReservation,
        updatePayload: RTUpdatePayload,
        propertyId: string,
        activeIntegration: ActiveIntegrationInfo
    ): Promise<{ success: boolean; message: string }> {
        try {
            if (activeIntegration.name === 'Rate Tiger') {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!rtConfig) {
                    return { success: false, message: 'Rate Tiger config not found' };
                }
                return RTReservationPushService.pushModify(
                    existingReservation,
                    updatePayload,
                    rtConfig
                );
            }

            if (activeIntegration.name === 'Site Minder') {
                const smConfig = await SMIntegrationDao.getSiteMinderConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!smConfig) {
                    return { success: false, message: 'Site Minder config not found' };
                }
                // Build ICReservationPayload from existingReservation + updatePayload
                const smPayload = IntegrationDispatcher.buildSMPayloadFromUpdate(
                    existingReservation,
                    updatePayload
                );
                return SiteMinderReservationService.pushModify(
                    smPayload,
                    existingReservation.bookingCode,
                    existingReservation.bookedAt.toISOString().replace(/\.\d{3}Z$/, '+00:00'),
                    smConfig.siteMinderPropertyCode,
                    smConfig.channelCode,
                    smConfig.channelName,
                    smConfig.reservationUrl
                );
            }

            return { success: false, message: `Unsupported integration: ${activeIntegration.name}` };
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Dispatcher modify error' };
        }
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────
    public static async pushCancel(
        existingReservation: ExistingReservation,
        propertyId: string,
        roomDescription:string,
        activeIntegration: ActiveIntegrationInfo
    ): Promise<{ success: boolean; message: string }> {
        try {
            if (activeIntegration.name === 'Rate Tiger') {
                const rtConfig = await RTIntegrationDao.getRTConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!rtConfig) {
                    return { success: false, message: 'Rate Tiger config not found' };
                }
                return RTReservationPushService.pushCancel(
                    existingReservation,
                    rtConfig
                );
            }

            if (activeIntegration.name === 'Site Minder') {
                const smConfig = await SMIntegrationDao.getSiteMinderConfig(
                    propertyId,
                    activeIntegration.type
                );
                if (!smConfig) {
                    return { success: false, message: 'Site Minder config not found' };
                }
                const smPayload = IntegrationDispatcher.buildSMPayloadFromExisting(existingReservation , roomDescription);
                return SiteMinderReservationService.pushCancel(
                    smPayload,
                    existingReservation.bookingCode,
                    existingReservation.bookedAt.toISOString().replace(/\.\d{3}Z$/, '+00:00'),
                    smConfig.siteMinderPropertyCode,
                    smConfig.channelCode,
                    smConfig.channelName,
                    smConfig.reservationUrl
                );
            }

            return { success: false, message: `Unsupported integration: ${activeIntegration.name}` };
        } catch (error: any) {
            return { success: false, message: error?.message ?? 'Dispatcher cancel error' };
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static buildSMPayloadFromUpdate(
        existing: ExistingReservation,
        update: RTUpdatePayload
    ): ICReservationS {
        const roomsArray = Array.isArray((update as any).rooms)
            ? (update as any).rooms
            : existing.finalPrice?.guests?.roomsArray ?? [];

        const requestedRooms = (update as any).requestedRooms
            ?? existing.finalPrice?.requestedRooms
            ?? 1;

        // ← ADD THIS LOG
        // console.log('[SM buildSMPayloadFromUpdate]', {
        //     updateRooms: (update as any).rooms,
        //     roomsArray,
        //     requestedRooms,
        //     updateFinalPriceDailyBreakdown: update.finalPrice?.dailyPriceBrakeDown?.length,
        // });

        return {
            propertyCode: existing.propertyCode ?? '',
            roomTypeCode: existing.roomTypeCode ?? '',
            ratePlanCode: existing.ratePlanCode ?? '',
            hotelName: existing.hotelName ?? '',
            roomName: existing.roomName ?? '',
            reservationStartDate: update.checkInDate,
            reservationEndDate: update.checkOutDate,
            bookingUserEmail: existing.bookingUserEmail ?? '',
            bookingUserPhone: existing.bookingUserPhone ?? '',
            currencyCode: existing.currencyCode as any,
            finalPrice: update.finalPrice,
            paymentMethod: existing.paymentMethod,
            roomDescription: update.roomDescription ?? '',
            guestDetails: Array.isArray(existing.guests) ? existing.guests : [],
            guests: {
                adults: (update as any).rooms?.reduce((s: number, r: any) => s + r.adults, 0) ?? existing.finalPrice?.guests?.adults ?? 1,
                children: (update as any).rooms?.reduce((s: number, r: any) => s + r.children, 0) ?? existing.finalPrice?.guests?.children ?? 0,
                rooms: requestedRooms,
                roomsArray,
            },
            numberOfRooms: requestedRooms,
        } as any;
    }
    private static normalizeFinalPriceFromDB(existing: ExistingReservation): any {
        const pb = (existing as any).PricingBrakeDown;

        if (!pb) {
            return {
                totalAmount: existing.amount ?? 0,
                amountBeforeTax: 0,
                taxedAmount: 0,
                totalAddonAmount: 0,
                totalPromotionAmount: 0,
                currentChargeableAmount: existing.amount ?? 0,
                latterpayableAmount: 0,
                promoCodeDiscount: 0,
                loyalityDiscount: 0,
                dailyPriceBrakeDown: [],
                addonBrakeDowns: [],
                promotionBrakeDown: [],
                taxBrakeDown: [],
            };
        }

        return {
            totalAmount: pb.totalAmount,
            amountBeforeTax: pb.amountBeforeTax,
            taxedAmount: pb.taxedAmount,
            totalAddonAmount: pb.totalAddonAmount,
            totalPromotionAmount: pb.totalPromotionAmount,
            currentChargeableAmount: pb.currentChargeableAmount,
            latterpayableAmount: pb.latterpayableAmount,
            promoCodeDiscount: pb.promoCodeDiscount,
            loyalityDiscount: pb.loyalityDiscount,
            currencyCode: pb.currencyCode,

            // DB uses Pascal-case relation names — map to camelCase for service
            dailyPriceBrakeDown: (pb.DailyPriceBrakeDown ?? []).map((d: any) => ({
                roomNumber: d.roomNumber,
                date: d.date,
                baseChargesAmount: d.baseChargesAmount,
                additionalChargesAmount: d.additionalChargesAmount,
                totalAmount: d.totalAmount,
                currencyCode: d.currencyCode,
                guestDistribution: d.guestDistribution,
            })),

            addonBrakeDowns: (pb.AddonBrakeDowns ?? []).map((a: any) => ({
                addonId: a.addonId,
                name: a.name,
                amount: a.amount,
                quantity: a.quantity,
                totalAmount: a.totalAmount,
                currencyCode: a.currencyCode,
                date: a.date,
                type: a.type,
            })),

            promotionBrakeDown: (pb.promotionBrakeDown ?? []).map((p: any) => ({
                id: p.id,
                name: p.name,
                promotionType: p.promotionType,
                discountType: p.discountType,
                discountValue: p.discountValue,
                discountAmount: p.discountAmount,
                currencyCode: p.currencyCode,
                restrictionType: p.restrictionType,
                type: p.type,
            })),

            taxBrakeDown: (pb.taxBrakeDown ?? []).map((t: any) => ({
                name: t.name,
                taxedAmount: t.taxedAmount,
                currencyCode: t.currencyCode,
            })),
        };
    }

    private static buildSMPayloadFromExisting(
        existing: ExistingReservation,
        description?:string,
    ): ICReservationS {
        const finalPrice = IntegrationDispatcher.normalizeFinalPriceFromDB(existing);
        return {
            propertyCode: existing.propertyCode ?? '',
            roomTypeCode: existing.roomTypeCode ?? '',
            ratePlanCode: existing.ratePlanCode ?? '',
            hotelName: existing.hotelName ?? '',
            roomName: existing.roomName ?? '',
            reservationStartDate: existing.reservationStartDate,
            reservationEndDate: existing.reservationEndDate,
            bookingUserEmail: existing.bookingUserEmail ?? '',
            bookingUserPhone: existing.bookingUserPhone ?? '',
            currencyCode: existing.currencyCode as any,
            paymentMethod: existing.paymentMethod,
            roomDescription: description ?? '',
            guestDetails: Array.isArray(existing.guests) ? existing.guests : [],
            guests: { adults: 1, children: 0, rooms: 1, roomsArray: [] },
            numberOfRooms: 1,
            finalPrice,
        } as any;
    }
}