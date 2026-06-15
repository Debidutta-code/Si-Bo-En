import { CustomRequest, IApiResponse, errorResponse } from '../../utils';
import { ICSpaC, ICSpaR, IUSpaR } from '../types';
import { Response, Request } from 'express';
import { SpaInterceptor } from '../../multi-language/interceptors/spa/spa.interceptor';
import { SpaService } from '../services';

export class SpaController {
    private spaService: SpaService;

    constructor() {
        this.spaService = new SpaService();
    }
    public async createSpa(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.property) {
                return res.status(500).json(errorResponse('Property configuration not found'));
            }
            if (!req.property.propertyConfig?.isSpaModuleEnabled) {
                return res.status(400).json(errorResponse('Spa module is not enabled for this property'));
            }
            const spaData: ICSpaC = req.body;
            if (!req.user) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Unauthorized User',
                            'Complete Authentication to create'
                        )
                    );
            }
            if (
                !spaData.isInclusive &&
                (!spaData.discountValue ||
                    spaData.discountValue <= 0 ||
                    !spaData.currencyCode)
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Spa price and currency is required for non-inclusive spas',
                            'Discount value must be positive if not inclusive'
                        )
                    );
            }
            const response = await this.spaService.createSpa({
                ...spaData,
                createdBy: req.user.id,
            });

            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to create spa', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create spa',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async getSpaForProperty(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;
            if (!req.property) {
                return res.status(500).json(errorResponse('Property configuration not found'));
            }
            if (!req.property.propertyConfig?.isSpaModuleEnabled) {
                return res.status(400).json(errorResponse('Spa module is not enabled for this property'));
            }

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let response =
                await this.spaService.getSpaForProperty(propertyId);

            response = await SpaInterceptor.intercept(response as any, locale);

            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to retrieve spa', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve spa',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async getSpaForPropertyCode(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.property) {
                return res.status(500).json(errorResponse('Property configuration not found'));
            }
            if (!req.property.propertyConfig?.isSpaModuleEnabled) {
                return res.status(400).json(errorResponse('Spa module is not enabled for this property'));
            }

            const propertyCode = req.property.propertyCode;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            let response =
                await this.spaService.getSpaForPropertyCode(propertyCode);

            response = await SpaInterceptor.intercept(response, locale);

            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to retrieve spa', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve spa',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async updateSpa(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.property) {
                return res.status(500).json(errorResponse('Property configuration not found'));
            }
            if (!req.property.propertyConfig?.isSpaModuleEnabled) {
                return res.status(400).json(errorResponse('Spa module is not enabled for this property'));
            }
            const spaId = req.params.id;

            if (!spaId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid spa choosen',
                            'Spa ID is required'
                        )
                    );
            }
            const spaData: IUSpaR = req.body;
            if (
                !spaData.isInclusive &&
                (!spaData.discountValue ||
                    spaData.discountValue <= 0 ||
                    !spaData.currencyCode)
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Spa price and currency is required for non-inclusive spas',
                            'Discount value must be positive if not inclusive'
                        )
                    );
            }
            const response = await this.spaService.updateSpa(spaId, spaData);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to update spa', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update spa',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async deleteSpa(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.property) {
                return res.status(500).json(errorResponse('Property configuration not found'));
            }
            if (!req.property.propertyConfig?.isSpaModuleEnabled) {
                return res.status(400).json(errorResponse('Spa module is not enabled for this property'));
            }
            const spaId = req.params.id;
            if (!spaId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid spa choosen',
                            'Spa ID is required'
                        )
                    );
            }
            const response = await this.spaService.deleteSpa(spaId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to delete spa', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete spa',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async getAvailableSpaForReservation(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const bookingCode = req.params.bookingCode;
            if (!bookingCode) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid booking code',
                            'Booking code is required'
                        )
                    );
            }
            const response =
                await this.spaService.getAvailableSpaForinDateRange(
                    bookingCode
                );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve available spas',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve available spas',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async createSpaReservation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const bookingData = req.body;
            if(!req.customer){
                return res.status(401).json(errorResponse('Unauthorized User', 'Complete Authentication to create a booking'));
            }
                bookingData.userId = req.customer.id;
                bookingData.userEmail = req.customer.email;

            if (!bookingData.userEmail || !bookingData.userContactNumber || !bookingData.slots || bookingData.slots.length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields',
                            'userEmail, userContactNumber and slots are required'
                        )
                    );
            }

            const response = await this.spaService.createSpaReservation(bookingData);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to create spa reservation', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create spa reservation',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async cancelSpaReservation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const bookingId = req.params.bookingId;
            const { spaSlotsId } = req.body;
            if (!bookingId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields',
                            'bookingId is required'
                        )
                    );
            }

            const customerId = req.customer?.id || req.user?.id;
            const response = await this.spaService.cancelSpaReservation(bookingId, customerId, spaSlotsId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to cancel spa reservation', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to cancel spa reservation',
                        'Internal Server Error'
                    )
                );
        }
    }
    public async getCustomerSpaBookings(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.customer?.id || req.user?.id;
            if (!customerId) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Unauthorized User',
                            'Complete Authentication to view bookings'
                        )
                    );
            }

            const response = await this.spaService.getCustomerSpaBookings(customerId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to retrieve customer spa bookings', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve customer spa bookings',
                        'Internal Server Error'
                    )
                );
        }
    }
}
