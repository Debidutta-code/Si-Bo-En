import { errorResponse } from '../../utils/return';
import { Response, Request } from 'express';
import { CustomRequest, PropertyRequest, IOtaReservationRequest } from '../../utils';
import { NewReservationService } from '../services';
import { ICReservationS, IGuestCheckInDetails } from '../types';
import { getDeviceInfo, getGeoLocationDetails } from '../../utils';
import { decodeToken } from '../../utils/jwtHelper';
import { config } from '../../config';

export class ReservationController {
    private reservationService: NewReservationService;

    constructor() {
        this.reservationService = new NewReservationService();
    }

    public async createReservation(
        req: PropertyRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICReservationS = req.body;
            if (!data) {
                return res.status(400).json(errorResponse('Invalid payload'));
            }
            if (!data.propertyCode) {
                return res
                    .status(400)
                    .json(errorResponse('Property code is required'));
            }
            if (!data.reservationStartDate) {
                return res
                    .status(400)
                    .json(errorResponse('Check-in date is required'));
            }
            if (!data.reservationEndDate) {
                return res
                    .status(400)
                    .json(errorResponse('Check-out date is required'));
            }
            if (!data.guests) {
                return res
                    .status(400)
                    .json(errorResponse('Guests details is required'));
            }
            if (!data.numberOfRooms) {
                return res
                    .status(400)
                    .json(errorResponse('Number of rooms is required'));
            }
            if (!data.ratePlanCode) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan code is required'));
            }
            if (!data.roomTypeCode) {
                return res
                    .status(400)
                    .json(errorResponse('Room type code is required'));
            }
            if (!data.guestDetails) {
                return res
                    .status(400)
                    .json(errorResponse('Guest details is required'));
            }
            if (!data.finalPrice) {
                return res
                    .status(400)
                    .json(errorResponse('Final price is required'));
            }
            if (!data.bookingSource) {
                return res
                    .status(400)
                    .json(errorResponse('Booking source is required'));
            }
            if (!data.paymentMethod) {
                return res
                    .status(400)
                    .json(errorResponse('Payment method is required'));
            }
            const PropertyDetails = req.property;
            if (!PropertyDetails) {
                return res
                    .status(400)
                    .json(errorResponse('Property details is required'));
            }
            const geoLocation = await getGeoLocationDetails(req);
            const countryCode = geoLocation?.country;
            const { deviceType } = getDeviceInfo(req);

            const serviceRes = await this.reservationService.createReservation(
                data,
                PropertyDetails,
                countryCode,
                deviceType
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error) {
            console.error('Controller error:', error);
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create reservation'));
        }
    }

    public async createOtaReservation(
        req: IOtaReservationRequest,
        res: Response
    ): Promise<Response> {
        try {
            const guestId = req.otaUser?.id;
            if (!guestId) {
                return res.status(401).json(errorResponse('Login to continue to reservation'));
            }
            const data: ICReservationS = req.body;
            if (!data) {
                return res.status(400).json(errorResponse('Invalid payload'));
            }
            if (!data.propertyCode) {
                return res
                    .status(400)
                    .json(errorResponse('Property code is required'));
            }
            if (!data.reservationStartDate) {
                return res
                    .status(400)
                    .json(errorResponse('Check-in date is required'));
            }
            if (!data.reservationEndDate) {
                return res
                    .status(400)
                    .json(errorResponse('Check-out date is required'));
            }
            if (!data.guests) {
                return res
                    .status(400)
                    .json(errorResponse('Guests details is required'));
            }
            if (!data.numberOfRooms) {
                return res
                    .status(400)
                    .json(errorResponse('Number of rooms is required'));
            }
            if (!data.ratePlanCode) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan code is required'));
            }
            if (!data.roomTypeCode) {
                return res
                    .status(400)
                    .json(errorResponse('Room type code is required'));
            }
            if (!data.guestDetails) {
                return res
                    .status(400)
                    .json(errorResponse('Guest details is required'));
            }
            if (!data.finalPrice) {
                return res
                    .status(400)
                    .json(errorResponse('Final price is required'));
            }
            if (!data.bookingSource) {
                return res
                    .status(400)
                    .json(errorResponse('Booking source is required'));
            }
            if (!data.paymentMethod) {
                return res
                    .status(400)
                    .json(errorResponse('Payment method is required'));
            }

            data.customerId = guestId;

            const PropertyDetails = req.property;
            if (!PropertyDetails) {
                return res
                    .status(400)
                    .json(errorResponse('Property details is required'));
            }
            const geoLocation = await getGeoLocationDetails(req as any);
            const countryCode = geoLocation?.country;
            const { deviceType } = getDeviceInfo(req as any);

            const serviceRes = await this.reservationService.createReservation(
                data,
                PropertyDetails,
                countryCode,
                deviceType
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error: any) {
            console.error('Controller error:', error);
            if (error instanceof Error && error.name === 'TokenExpiredError') {
                return res
                    .status(401)
                    .json(errorResponse('Authorization failed, Login again to continue', error.message));
            } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
                return res
                    .status(401)
                    .json(errorResponse('Invalid Token, Login again to continue', error.message));
            }

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create OTA reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create OTA reservation'));
        }
    }

    public async getReservationByCode(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const reservationCode = req.params.reservationCode;
            const propertyCode = req.query.propertyCode as string;
            if (!propertyCode) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Property details is required to find the reservation'
                        )
                    );
            }
            if (!reservationCode) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation code is required'));
            }

            const serRes = await this.reservationService.getReservaltionByCode(
                reservationCode,
                propertyCode
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Reservation',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }

    public async getReservationByGuestId(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.cookies && req.cookies.revvChillOtaAccess) {
                token = req.cookies.revvChillOtaAccess;
            }

            if (!token) {
                return res.status(401).json(errorResponse('Authorization failed, Login again'));
            }

            const decoded = await decodeToken(token, config.otaJWTSecret!);

            if (!decoded || !decoded.id) {
                return res.status(401).json(errorResponse('Authorization failed, Login again'));
            }

            const guestId = decoded.id;

            const serRes = await this.reservationService.getReservationsByGuestId(guestId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            if (error instanceof Error && error.name === 'TokenExpiredError') {
                return res
                    .status(401)
                    .json(errorResponse('Authorization failed, Login again to continue', error.message));
            } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
                return res
                    .status(401)
                    .json(errorResponse('Invalid Token, Login again to continue', error.message));
            }

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Reservation',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }

    public async updateReservation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const reservationCode = req.params.reservationCode;
            const updateData = req.body;

            if (!reservationCode) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation code is required'));
            }

            if (!updateData) {
                return res
                    .status(400)
                    .json(errorResponse('Update data is required'));
            }

            // Validate required fields
            if (
                !updateData.propertyCode ||
                !updateData.checkInDate ||
                !updateData.checkOutDate
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields: propertyCode, checkInDate, checkOutDate'
                        )
                    );
            }

            const serviceRes = await this.reservationService.updateReservation(
                reservationCode,
                updateData
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error) {
            console.error('Controller error updating reservation:', error);
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update reservation'));
        }
    }

    public async getAllReservations(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'User is not assigned to any creation',
                            'Creation ID not found'
                        )
                    );
            }

            const {
                startDate,
                endDate,
                page = '1',
                limit = '10',
                propertyId,
                propertyCode,
                bookingStatus,
                bookingSource,
                deviceType,
                bookingCode,
                guestName,
                promoCode,
                countryCode,
                dateFilterType,
            } = req.query;

            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid date format'));
            }

            if (start > end) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);

            if (pageNum < 1 || limitNum < 1) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Page and limit must be positive numbers')
                    );
            }

            const serRes =
                await this.reservationService.getReservationsForDateRange(
                    req.user.creationId,
                    req.user.level,
                    start,
                    end,
                    pageNum,
                    limitNum,
                    propertyId?.toString(),
                    propertyCode?.toString(),
                    bookingStatus?.toString(),
                    bookingSource?.toString(),
                    deviceType?.toString(),
                    bookingCode?.toString(),
                    guestName?.toString(),
                    promoCode?.toString(),
                    countryCode?.toString(),
                    dateFilterType?.toString() as
                    | 'checkin'
                    | 'booking'
                    | 'modification'
                    | undefined
                );

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Reservations',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }

    public async getArrivalsForADate(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse('User is not assigned to any creation')
                    );
            }

            const {
                startDate,
                endDate,
                page = '1',
                limit = '10',
                propertyId,
                propertyCode,
                bookingStatus,
            } = req.query;

            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid date format'));
            }

            if (start > end) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);

            const serRes = await this.reservationService.getArrivals(
                req.user.creationId,
                req.user.level,
                start,
                end,
                pageNum,
                limitNum,
                propertyId?.toString(),
                propertyCode?.toString(),
                bookingStatus?.toString()
            );

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch Arrivals', error.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }

    public async getDeparturesForADate(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse('User is not assigned to any creation')
                    );
            }

            const {
                startDate,
                endDate,
                page = '1',
                limit = '10',
                propertyId,
                propertyCode,
                bookingStatus,
            } = req.query;

            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid date format'));
            }

            if (start > end) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);

            const serRes = await this.reservationService.getDepartures(
                req.user.creationId,
                req.user.level,
                start,
                end,
                pageNum,
                limitNum,
                propertyId?.toString(),
                propertyCode?.toString(),
                bookingStatus?.toString()
            );

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Departures',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }

    // public async getCheckInsForADate(
    //     req: CustomRequest,
    //     res: Response
    // ): Promise<Response> {
    //     try {
    //         if (!req.user?.creationId || req.user.level === undefined) {
    //             return res
    //                 .status(400)
    //                 .json(
    //                     errorResponse('User is not assigned to any creation')
    //                 );
    //         }

    //         const {
    //             startDate,
    //             endDate,
    //             page = '1',
    //             limit = '10',
    //             propertyId,
    //             propertyCode,
    //         } = req.query;

    //         if (!startDate || !endDate) {
    //             return res
    //                 .status(400)
    //                 .json(
    //                     errorResponse('Start date and end date are required')
    //                 );
    //         }

    //         const start = new Date(startDate as string);
    //         const end = new Date(endDate as string);

    //         if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //             return res
    //                 .status(400)
    //                 .json(errorResponse('Invalid date format'));
    //         }

    //         if (start > end) {
    //             return res
    //                 .status(400)
    //                 .json(errorResponse('Start date must be before end date'));
    //         }

    //         const pageNum = parseInt(page as string, 10);
    //         const limitNum = parseInt(limit as string, 10);

    //         const serRes =
    //             await this.reservationService.getCheckedInReservations(
    //                 req.user.creationId,
    //                 req.user.level,
    //                 start,
    //                 end,
    //                 pageNum,
    //                 limitNum,
    //                 propertyId?.toString(),
    //                 propertyCode?.toString()
    //             );

    //         return res.status(serRes.success ? 200 : 400).json(serRes);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return res
    //                 .status(500)
    //                 .json(
    //                     errorResponse(
    //                         'Failed to fetch Check-Ins',
    //                         error.message
    //                     )
    //                 );
    //         }
    //         return res.status(500).json(errorResponse('Internal server Error'));
    //     }
    // }

    // public async getCheckOutsForADate(
    //     req: CustomRequest,
    //     res: Response
    // ): Promise<Response> {
    //     try {
    //         if (!req.user?.creationId || req.user.level === undefined) {
    //             return res
    //                 .status(400)
    //                 .json(
    //                     errorResponse('User is not assigned to any creation')
    //                 );
    //         }

    //         const {
    //             startDate,
    //             endDate,
    //             page = '1',
    //             limit = '10',
    //             propertyId,
    //             propertyCode,
    //         } = req.query;

    //         if (!startDate || !endDate) {
    //             return res
    //                 .status(400)
    //                 .json(
    //                     errorResponse('Start date and end date are required')
    //                 );
    //         }

    //         const start = new Date(startDate as string);
    //         const end = new Date(endDate as string);

    //         if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //             return res
    //                 .status(400)
    //                 .json(errorResponse('Invalid date format'));
    //         }

    //         if (start > end) {
    //             return res
    //                 .status(400)
    //                 .json(errorResponse('Start date must be before end date'));
    //         }

    //         const pageNum = parseInt(page as string, 10);
    //         const limitNum = parseInt(limit as string, 10);

    //         const serRes =
    //             await this.reservationService.getCheckedOutReservations(
    //                 req.user.creationId,
    //                 req.user.level,
    //                 start,
    //                 end,
    //                 pageNum,
    //                 limitNum,
    //                 propertyId?.toString(),
    //                 propertyCode?.toString()
    //             );

    //         return res.status(serRes.success ? 200 : 400).json(serRes);
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return res
    //                 .status(500)
    //                 .json(
    //                     errorResponse(
    //                         'Failed to fetch Check-Outs',
    //                         error.message
    //                     )
    //                 );
    //         }
    //         return res.status(500).json(errorResponse('Internal server Error'));
    //     }
    // }

    public async cancelReservation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const reservationId = req.params.reservationId;
            const cancellationReason = req.body.cancellationReason;

            if (!reservationId) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation id is required'));
            }

            const serRes = await this.reservationService.deleteReservation(
                reservationId,
                cancellationReason
            );

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to cancel Reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to cancel Reservation'));
        }
    }
    public async noShowReservation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const reservationId = req.params.reservationId;

            if (!reservationId) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation id is required'));
            }

            const serRes =
                await this.reservationService.noShowReservation(reservationId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to no show Reservation',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal server Error'));
        }
    }
    public async checkInReservation(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const bookingCode = req.params.bookingCode;
            const guestDetails: IGuestCheckInDetails = req.body;

            if (!bookingCode) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation not found'));
            }

            const serRes = await this.reservationService.makeCheckIn(
                bookingCode,
                guestDetails
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to check-in Reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to check-in Reservation',
                        'Internal server Error'
                    )
                );
        }
    }
    public async checkOutReservation(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const bookingCode = req.params.bookingCode;

            if (!bookingCode) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation not found'));
            }

            const serRes =
                await this.reservationService.makeCheckOut(bookingCode);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to check-out Reservation',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to check-out Reservation',
                        'Internal server Error'
                    )
                );
        }
    }
}
