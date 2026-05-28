import {Request, Response } from 'express';
import { CustomRequest, errorResponse, PropertyRequest, successResponse } from '../../utils';
import { LoyaltyGuestService } from '../services';

export class LoyaltyGuestController {
    private loyaltyGuestService: LoyaltyGuestService;

    constructor() {
        this.loyaltyGuestService = new LoyaltyGuestService();
    }


    public async getLoyaltyGuestsForProperty(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const skip = parseInt(req.query.skip as string) || 0;
            const take = parseInt(req.query.take as string) || 10;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Property ID is required'
                        )
                    );
            }

            const result =
                await this.loyaltyGuestService.getLoyalityGuestsForProperty(
                    propertyId,
                    skip,
                    take
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty guests for property',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty guests for property'
                    )
                );
        }
    }

    public async getLoyaltyGuestsForCreation(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { creationLoyaltyId } = req.params;
            const skip = parseInt(req.query.skip as string) || 0;
            const take = parseInt(req.query.take as string) || 10;

            if (!creationLoyaltyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Creation Loyalty ID is required'
                        )
                    );
            }

            const result =
                await this.loyaltyGuestService.getLoyalityGuestForcreationLoyality(
                    creationLoyaltyId,
                    skip,
                    take
                );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve loyalty guests for creation loyalty',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to retrieve loyalty guests for creation loyalty'
                    )
                );
        }
    }

    public async registerGuestFromBookingEngine(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.property) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Property information is required'
                        )
                    );
            }
            if (!req.customer) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Customer information is required'
                        )
                    );
            }
            const { propertyId, metadata } = req.body;


            const result =
                await this.loyaltyGuestService.registerGuestFromBookingEngine({
                    propertyId,
                    metaData: metadata || {},
                    customerId: req.customer.id
                });

            return res.status(result.success ? 201 : 400).cookie("loyalty_token", `${req.customer.id}split${req.property.id}`, {
                httpOnly: true,
                secure: true,
            }).json(result);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('already registered')) {
                    return res
                        .status(409)
                        .json(
                            errorResponse('Already Registered', error.message)
                        );
                }
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to register guest', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to register for loyalty program'
                    )
                );
        }
    }
    public async checkLoyaltyDiscount(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.customer) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Customer information is required'
                        )
                    );
            }
            const { propertyId } = req.body;
            const id = req.customer.id
            // Validation
            if (!propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid Request',
                            'Email and propertyId are required'
                        )
                    );
            }

            const result = await this.loyaltyGuestService.checkLoyaltyDiscount(
                id,
                propertyId
            );
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to check discount', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'Failed to check discount'
                    )
                );
        }
    }
    public async signoutLoyalityMember(req:Request ,res : Response ){
        try {
            res.clearCookie("loyalty_token")
            return res.status(200).json(successResponse("Signout success"))
        } catch (error) {
            if(error instanceof Error){
                return res
                    .status(500)
                    .json(
                        errorResponse("Failed to signout",error.message)
                    );
            }
            return res.status(500).json(errorResponse("Internal Server Error","Failed to signout"))
        }
    }
}
