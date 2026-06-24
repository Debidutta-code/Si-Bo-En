// src/integrations/channex/controllers/channex-webhook.controller.ts

import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../../../config';
import { ChannexDao } from '../dao/channex.dao';
import { ChannexBookingRevision, ChannexBookingRevisionResponse } from '../types/channex.types';
import { AriManupulationRepo } from '../../../reservation/repository';
import { ServiceLogger } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('ChannexWebhookController');
const ariRepo = new AriManupulationRepo();

function getDatesBetween(startDate: Date | string, endDate: Date | string): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

export class ChannexWebhookController {
    private static async validateApiKey(req: Request, hotelCode: string): Promise<boolean> {
        const incomingApiKey = req.headers['api-key'] as string;

        const property = await prisma.property.findUnique({
            where: { propertyCode: hotelCode },
            select: { id: true },
        });
        if (!property) return false;

        const config = await ChannexDao.getChannexConfig(property.id, 'channel_manager');
        if (!config) return false;

        if (config.apiKey && incomingApiKey !== config.apiKey) {
            return false;
        }
        return true;
    }

    public static async handleWebhook(req: Request, res: Response) {
        const log = logger.start('handleWebhook');
        const body = req.body;

        log.setIncoming({ headers: req.headers, body });

        try {
            // 1. Filter events
            if (body.event !== 'booking' || !body.payload?.revision_id || !body.payload?.property_id) {
                log.pushMessage('Ignored non-booking or incomplete webhook event', 'info').save();
                return res.status(200).json({ success: true, message: 'Event ignored' });
            }

            const channexPropertyId = body.payload.property_id;
            const revisionId = body.payload.revision_id;

            // 2. Resolve property details
            const propertyInfo = await ChannexDao.getPropertyByChannexPropertyId(channexPropertyId);
            if (!propertyInfo) {
                log.pushMessage(`Property not found for Channex property_id: ${channexPropertyId}`, 'error').save();
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            // 3. Retrieve Channex configuration
            const config = await ChannexDao.getChannexConfig(propertyInfo.propertyId, 'channel_manager');
            if (!config) {
                log.pushMessage(`Channex integration not configured/active for property: ${propertyInfo.propertyId}`, 'error').save();
                return res.status(404).json({ success: false, message: 'Channex config not found' });
            }

            // 4. Validate custom webhook secret header (if configured)
            if (config.webhookSecret) {
                const headerSecret = req.headers['x-channex-webhook-secret'] || req.headers['x-webhook-secret'];
                if (headerSecret !== config.webhookSecret) {
                    log.pushMessage('Unauthorized webhook call - secret mismatch', 'error').save();
                    return res.status(401).json({ success: false, message: 'Unauthorized' });
                }
            }

            // 5. Fetch full booking revision from Channex API
            const getUrl = `${config.baseUrl}/api/v1/booking_revisions/${revisionId}`;
            const revisionResponse = await axios.get(getUrl, {
                headers: {
                    'user-api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            const revision: ChannexBookingRevision = revisionResponse.data?.data?.attributes;
            if (!revision) {
                log.pushMessage('Failed to parse revision data from Channex response', 'error').save();
                return res.status(500).json({ success: false, message: 'Invalid revision payload' });
            }

            log.pushMessage(`Processing revision ${revisionId} with status ${revision.status}`, 'info');

            // 6. Ingest the reservation inside a database transaction
            await prisma.$transaction(async (tx) => {
                // Resolve or create guest
                let guest = await tx.guests.findFirst({
                    where: {
                        propertyId: propertyInfo.propertyId,
                        email: revision.customer?.mail || undefined,
                    },
                });

                if (!guest && revision.customer) {
                    guest = await tx.guests.create({
                        data: {
                            firstName: revision.customer.first_name || revision.customer.name || 'Guest',
                            lastName: revision.customer.last_name || revision.customer.surname || 'User',
                            email: revision.customer.mail || null,
                            phoneNumber: revision.customer.phone || null,
                            propertyId: propertyInfo.propertyId,
                            userType: 'adult',
                        },
                    });
                }

                const primaryGuestId = guest?.id ?? '';

                // Handle cancellation status
                if (revision.status === 'cancelled') {
                    // Find all rooms in the reservation and mark them cancelled
                    const otaCode = revision.ota_reservation_code;
                    const bookings = await tx.reservation.findMany({
                        where: {
                            propertyId: propertyInfo.propertyId,
                            bookingCode: {
                                startsWith: otaCode,
                            },
                            bookingStatus: { not: 'cancelled' },
                        },
                    });

                    for (const booking of bookings) {
                        await tx.reservation.update({
                            where: { id: booking.id },
                            data: {
                                bookingStatus: 'cancelled',
                                cancelledAt: new Date(),
                            },
                        });

                        // Increase available rooms
                        const dates = getDatesBetween(booking.reservationStartDate, booking.reservationEndDate);
                        await ariRepo.increaseAvailableRooms({
                            propertyCode: propertyInfo.propertyCode,
                            roomTypeCode: booking.roomTypeCode,
                            numberOfRooms: 1,
                            dates,
                        });
                    }

                    return;
                }

                // Handle new or modified status
                const otaCode = revision.ota_reservation_code;
                const revisionRooms = revision.rooms || [];

                for (let idx = 0; idx < revisionRooms.length; idx++) {
                    const room = revisionRooms[idx];
                    const resolvedBookingCode = revisionRooms.length === 1 ? otaCode : `${otaCode}-${idx + 1}`;

                    // Match Room Type and Rate Plan
                    const resolvedRoom = await tx.room.findFirst({
                        where: {
                            propertyId: propertyInfo.propertyId,
                            roomType: room.room_type_id,
                            isDeleted: false,
                        },
                    });

                    if (!resolvedRoom) {
                        throw new Error(`Room type ${room.room_type_id} not configured in PMS`);
                    }

                    const resolvedRatePlan = await tx.ratePlan.findFirst({
                        where: {
                            propertyId: propertyInfo.propertyId,
                            ratePlanCode: room.rate_plan_id,
                        },
                    });

                    if (!resolvedRatePlan) {
                        throw new Error(`Rate plan ${room.rate_plan_id} not configured in PMS`);
                    }

                    const startDate = new Date(room.check_in || revision.arrival_date);
                    const endDate = new Date(room.check_out || revision.departure_date);
                    const roomAmount = parseFloat(room.amount?.toString() || (parseFloat(revision.amount) / revisionRooms.length).toString());

                    const existing = await tx.reservation.findUnique({
                        where: { bookingCode: resolvedBookingCode },
                    });

                    if (existing) {
                        // Modification: adjust inventory if dates or room types changed
                        const oldDates = getDatesBetween(existing.reservationStartDate, existing.reservationEndDate);
                        const newDates = getDatesBetween(startDate, endDate);

                        const datesChanged = oldDates.map(d => d.getTime()).join() !== newDates.map(d => d.getTime()).join();
                        const roomTypeChanged = existing.roomTypeCode !== resolvedRoom.roomType;

                        if (datesChanged || roomTypeChanged) {
                            // Revert old inventory
                            await ariRepo.increaseAvailableRooms({
                                propertyCode: propertyInfo.propertyCode,
                                roomTypeCode: existing.roomTypeCode,
                                numberOfRooms: 1,
                                dates: oldDates,
                            });

                            // Deduct new inventory
                            await ariRepo.decreaseAvailableRooms({
                                propertyCode: propertyInfo.propertyCode,
                                roomTypeCode: resolvedRoom.roomType,
                                numberOfRooms: 1,
                                dates: newDates,
                            });
                        }

                        // Update reservation details
                        await tx.reservation.update({
                            where: { id: existing.id },
                            data: {
                                reservationStartDate: startDate,
                                reservationEndDate: endDate,
                                amount: roomAmount,
                                roomTypeCode: resolvedRoom.roomType,
                                roomName: resolvedRoom.roomName,
                                ratePlanCode: resolvedRatePlan.ratePlanCode,
                                ratePlanName: resolvedRatePlan.ratePlanName,
                                primaryGuestId,
                                guests: {
                                    adults: room.occupancy?.adults ?? 1,
                                    children: room.occupancy?.children ?? 0,
                                    rooms: 1,
                                    roomsArray: [],
                                },
                                bookingStatus: 'confirmed',
                            },
                        });
                    } else {
                        // Create new reservation
                        await tx.reservation.create({
                            data: {
                                bookingCode: resolvedBookingCode,
                                reservationStartDate: startDate,
                                reservationEndDate: endDate,
                                amount: roomAmount,
                                bookingUserEmail: revision.customer?.mail || '',
                                bookingUserPhone: revision.customer?.phone || null,
                                countryCode: revision.customer?.country || 'IN',
                                deviceTypes: 'desktop',
                                guests: {
                                    adults: room.occupancy?.adults ?? 1,
                                    children: room.occupancy?.children ?? 0,
                                    rooms: 1,
                                    roomsArray: [],
                                },
                                hotelName: propertyInfo.propertyName,
                                propertyCode: propertyInfo.propertyCode,
                                ratePlanCode: resolvedRatePlan.ratePlanCode,
                                ratePlanName: resolvedRatePlan.ratePlanName,
                                roomTypeCode: resolvedRoom.roomType,
                                roomName: resolvedRoom.roomName,
                                timezone: 'Asia/Dubai',
                                primaryGuestId,
                                propertyId: propertyInfo.propertyId,
                                bookingSource: 'agency',
                                extraAmountToPay: 0,
                                refundAmount: 0,
                                isPromoUsed: false,
                                currencyCode: (revision.currency || 'AED') as any,
                                paidAmount: 0,
                                platforms: 'web',
                                bookingStatus: 'confirmed',
                            },
                        });

                        // Deduct new inventory
                        await ariRepo.decreaseAvailableRooms({
                            propertyCode: propertyInfo.propertyCode,
                            roomTypeCode: resolvedRoom.roomType,
                            numberOfRooms: 1,
                            dates: getDatesBetween(startDate, endDate),
                        });
                    }
                }
            });

            // 7. Acknowledge the booking revision
            const ackUrl = `${config.baseUrl}/api/v1/booking_revisions/${revisionId}/ack`;
            await axios.post(ackUrl, {}, {
                headers: {
                    'user-api-key': config.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            log.pushMessage(`Revision ${revisionId} successfully processed and acknowledged`, 'info').save();
            return res.status(200).json({ success: true, message: 'Revision processed and acknowledged' });

        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return res.status(500).json({
                success: false,
                message: `Webhook processing error: ${error.message}`,
            });
        }
    }

    /**
     * Handshake endpoint for Channex Open Channel connection verification
     */
    public static async testConnection(req: Request, res: Response) {
        const log = logger.start('testConnection');
        const hotelCode = req.query.hotel_code as string;

        try {
            if (!hotelCode) {
                return res.status(400).json({ success: false, message: 'Missing hotel_code' });
            }

            // Check if property exists
            const property = await prisma.property.findUnique({
                where: { propertyCode: hotelCode },
                select: { id: true },
            });

            if (!property) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            // Validate API Key
            const isValid = await ChannexWebhookController.validateApiKey(req, hotelCode);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Unauthorized - invalid api-key' });
            }

            return res.status(200).json({ success: true });
        } catch (error: any) {
            log.setError(error).save();
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Expose configured room types and rate plans for mapping inside Channex UI
     */
    public static async getMappingDetails(req: Request, res: Response) {
        const log = logger.start('getMappingDetails');
        const hotelCode = req.query.hotel_code as string;

        try {
            if (!hotelCode) {
                return res.status(400).json({ success: false, message: 'Missing hotel_code' });
            }

            const property = (await prisma.property.findUnique({
                where: { propertyCode: hotelCode },
                include: {
                    propertyRooms: {
                        where: { isDeleted: false },
                        select: {
                            roomType: true,
                            roomName: true,
                            maxOccupancy: true,
                        },
                    },
                    ratePlans: {
                        select: {
                            ratePlanCode: true,
                            ratePlanName: true,
                        },
                    },
                    propertyConfigs: {
                        select: {
                            baseCurrency: true,
                        },
                    },
                },
            })) as any;

            if (!property) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            // Validate API Key
            const isValid = await ChannexWebhookController.validateApiKey(req, hotelCode);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Unauthorized - invalid api-key' });
            }

            const baseCurrency = property.propertyConfigs?.baseCurrency || 'AED';

            const roomTypes = property.propertyRooms.map((room: any) => {
                const mappedRatePlans = property.ratePlans.map((rp: any) => ({
                    id: rp.ratePlanCode,
                    title: rp.ratePlanName,
                    sell_mode: 'per_person', // Support per-occupancy pricing (same as SiteMinder)
                    max_persons: room.maxOccupancy || 2,
                    currency: baseCurrency,
                    read_only: false,
                }));

                return {
                    id: room.roomType,
                    title: room.roomName,
                    rate_plans: mappedRatePlans,
                };
            });

            return res.status(200).json({
                data: {
                    type: 'mapping_details',
                    attributes: {
                        room_types: roomTypes,
                    },
                },
            });
        } catch (error: any) {
            log.setError(error).save();
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Callback receiving Availability, Price, and Restrictions updates pushed from Channex
     */
    public static async handleAriPush(req: Request, res: Response) {
        const log = logger.start('handleAriPush');
        const body = req.body;
        log.setIncoming(body);

        try {
            const notifications = body.data || [];
            if (!Array.isArray(notifications) || notifications.length === 0) {
                return res.status(200).json({ success: true, message: 'No data to update' });
            }

            const sampleNotification = notifications[0];
            const hotelCode = sampleNotification.attributes?.hotel_code;
            const uniqueId = sampleNotification.attributes?.request_id || 'channex-incident-key';

            if (!hotelCode) {
                return res.status(400).json({ success: false, message: 'Missing hotel_code in payload' });
            }

            const propertyInfo = await prisma.property.findUnique({
                where: { propertyCode: hotelCode },
                select: { id: true, propertyCode: true },
            });

            if (!propertyInfo) {
                log.pushMessage(`Property not found for hotel_code: ${hotelCode}`, 'error').save();
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            // Validate API Key
            const isValid = await ChannexWebhookController.validateApiKey(req, hotelCode);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Unauthorized - invalid api-key' });
            }

            for (const notification of notifications) {
                const changes = notification.attributes?.changes || [];
                for (const change of changes) {
                    const attrs = change.attributes || {};
                    const dateFromStr = attrs.date_from;
                    const dateToStr = attrs.date_to;

                    if (!dateFromStr || !dateToStr) continue;

                    const dateFrom = new Date(dateFromStr);
                    const dateTo = new Date(dateToStr);
                    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) continue;

                    // Loop day-by-day (inclusive)
                    const currentDate = new Date(dateFrom);
                    const endDate = new Date(dateTo);

                    while (currentDate <= endDate) {
                        const date = new Date(currentDate);

                        if (change.type === 'availability_changes') {
                            const roomTypeCode = attrs.room_type_id;
                            const parsedAvail = attrs.availability !== undefined && attrs.availability !== null
                                ? parseInt(attrs.availability.toString(), 10)
                                : NaN;
                            
                            if (!isNaN(parsedAvail)) {
                                await ChannexDao.upsertInventory({
                                    propertyCode: propertyInfo.propertyCode,
                                    roomTypeCode,
                                    date,
                                    availability: parsedAvail,
                                });
                            }
                        } else if (change.type === 'restriction_changes') {
                            const roomTypeCode = attrs.room_type_id;
                            const ratePlanCode = attrs.rate_plan_id;
                            
                            const stopSell = attrs.stop_sell !== undefined && attrs.stop_sell !== null ? !!attrs.stop_sell : undefined;
                            const closedToArrival = attrs.closed_to_arrival !== undefined && attrs.closed_to_arrival !== null ? !!attrs.closed_to_arrival : undefined;
                            const closedToDeparture = attrs.closed_to_departure !== undefined && attrs.closed_to_departure !== null ? !!attrs.closed_to_departure : undefined;
                            
                            const minStayRaw = attrs.min_stay_arrival !== undefined && attrs.min_stay_arrival !== null ? attrs.min_stay_arrival 
                                : (attrs.min_stay_through !== undefined && attrs.min_stay_through !== null ? attrs.min_stay_through : attrs.min_stay);
                            
                            const minLosParsed = minStayRaw !== undefined && minStayRaw !== null ? parseInt(minStayRaw.toString(), 10) : NaN;
                            const minLos = !isNaN(minLosParsed) ? minLosParsed : undefined;
                            
                            const maxLosParsed = attrs.max_stay !== undefined && attrs.max_stay !== null ? parseInt(attrs.max_stay.toString(), 10) : NaN;
                            const maxLos = !isNaN(maxLosParsed) ? maxLosParsed : undefined;
                            
                            // Occupancy rates mapping (safely skipping null or invalid rates)
                            const rates = attrs.rates
                                ?.filter((r: any) => r && r.rate !== undefined && r.rate !== null && !isNaN(parseFloat(r.rate)))
                                .map((r: any) => ({
                                    rate: parseFloat(r.rate),
                                    occupancy: r.occupancy ? parseInt(r.occupancy.toString(), 10) : 1,
                                })) || [];
                            const currencyCode = attrs.rates?.[0]?.currency || undefined;

                            const hasRestrictions =
                                rates.length > 0 ||
                                stopSell !== undefined ||
                                closedToArrival !== undefined ||
                                closedToDeparture !== undefined ||
                                minLos !== undefined ||
                                maxLos !== undefined;

                            if (hasRestrictions) {
                                await ChannexDao.upsertCharge({
                                    propertyCode: propertyInfo.propertyCode,
                                    roomTypeCode,
                                    ratePlanCode,
                                    date,
                                    rates,
                                    currencyCode,
                                    isSaleStopped: stopSell,
                                    isClosedToArrival: closedToArrival,
                                    isClosedToDeparture: closedToDeparture,
                                    minLos,
                                    maxLos,
                                });
                            }
                        }

                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }

            log.pushMessage('ARI changes processed successfully', 'info').save();
            return res.status(200).json({
                success: true,
                unique_id: uniqueId
            });
        } catch (error: any) {
            log.setError(error).save();
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Callback handler for Full Sync requests from Channex
     */
    public static async handleSync(req: Request, res: Response) {
        const log = logger.start('handleSync');
        const hotelCode = (req.query.hotel_code || req.body.hotel_code) as string;

        try {
            if (!hotelCode) {
                return res.status(400).json({ success: false, message: 'Missing hotel_code' });
            }

            const propertyInfo = await prisma.property.findUnique({
                where: { propertyCode: hotelCode },
                select: { id: true, propertyCode: true },
            });

            if (!propertyInfo) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            const config = await ChannexDao.getChannexConfig(propertyInfo.id, 'channel_manager');
            if (!config) {
                return res.status(404).json({ success: false, message: 'Channex config not found' });
            }

            const targetUrl = `${config.baseUrl}/api/v1/channel_webhooks/open_channel/request_full_sync`;
            const response = await axios.post(
                targetUrl,
                {
                    provider_code: 'OpenChannel',
                    hotel_code: propertyInfo.propertyCode,
                },
                {
                    headers: {
                        'api-key': config.apiKey,
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000,
                }
            );

            log.pushMessage('Full sync request sent successfully', 'info')
                .setMeta({ responseData: response.data })
                .save();

            return res.status(200).json({ success: true, data: response.data });
        } catch (error: any) {
            const errorMsg = error?.response?.data || error.message;
            log.setError(error).setMeta({ errorDetail: errorMsg }).save();
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Callback handler for channel activation requests from Channex
     */
    public static async handleActivate(req: Request, res: Response) {
        return res.status(200).json({ success: true });
    }
}
