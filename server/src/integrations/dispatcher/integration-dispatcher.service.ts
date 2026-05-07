
import { AriManupulationRepo } from '../../reservation/repository';
import { RTIntegrationDao } from '../rate-tiger/dao/rt-integration.dao';
import { RTReservationPushService } from '../rate-tiger/services/rt-reservation-push.service';
import { SiteMinderReservationService } from '../site-minder/services/site-minder-reservation.service';
import { ICReservationPayload } from '../../reservation/types';
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
        payload: ICReservationPayload,
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
                    existingReservation.bookedAt.toISOString(),
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
                const smPayload = IntegrationDispatcher.buildSMPayloadFromExisting(existingReservation);
                return SiteMinderReservationService.pushCancel(
                    smPayload,
                    existingReservation.bookingCode,
                    existingReservation.bookedAt.toISOString(),
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
    ): ICReservationPayload {
        return {
            ...existing.finalPrice,
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
            guestDetails: Array.isArray(existing.guests) ? existing.guests : [],
            guests: existing.finalPrice?.guests ?? { adults: 1, children: 0, rooms: 1, roomsArray: [] },
            numberOfRooms: existing.finalPrice?.requestedRooms ?? 1,
        } as any;
    }

    private static buildSMPayloadFromExisting(
        existing: ExistingReservation
    ): ICReservationPayload {
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
            finalPrice: existing.finalPrice,
            paymentMethod: existing.paymentMethod,
            guestDetails: Array.isArray(existing.guests) ? existing.guests : [],
            guests: existing.finalPrice?.guests ?? { adults: 1, children: 0, rooms: 1, roomsArray: [] },
            numberOfRooms: existing.finalPrice?.requestedRooms ?? 1,
        } as any;
    }
}