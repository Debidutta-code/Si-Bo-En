import { Response } from 'express';
import {
    CustomRequest,
    PropertyCustomRequest,
} from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { InventoryServices } from '../services';
import { getPropertyCode } from '../utils';
import { ICharges } from '../types';
import { ServiceLogger } from '../../logs/services/service-log.service';
const logger = new ServiceLogger('InventoryController');
class InventoryController {
    inventoryServices: InventoryServices;
    constructor() {
        this.inventoryServices = new InventoryServices();
    }
    public async getInventoryController(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            const { hotelCode, invTypeCode, startDate, endDate } = req.body;
            const currentPage = req.query.page;
            const resultPerPage = req.query.itemsPerPage;
            if (!hotelCode) {
                return res
                    .status(400)
                    .json(errorResponse('Hotel code is must required field'));
            }
            const serRes = await this.inventoryServices.getInventoryServices(
                hotelCode,
                Number(currentPage),
                Number(resultPerPage),
                startDate,
                endDate,
                invTypeCode
            );
            const resStatus = serRes?.success ? 200 : 400;
            return res.status(resStatus).json(serRes);
        } catch (error: any) {
            return {
                success: false,
                message: 'Error occur while getting all the inventory data',
                error: error.message,
            };
        }
    }
    public async getRoomTypeController(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            const hotelCode = req.params.hotelCode;
            if (!hotelCode) {
                return res
                    .status(400)
                    .json(errorResponse('Hotel code not found'));
            }
            const roomTypes =
                await this.inventoryServices.getAllRoomTypeService(hotelCode);
            const resStatus = roomTypes.success ? 200 : 400;
            return res.status(resStatus).json(roomTypes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async createNewInventory(req: PropertyCustomRequest, res: Response) {
        try {
            const {
                roomType,
                startDate,
                endDate,
                availableRooms,
                pushFromCalender,
            } = req.body;
            if(!req.property) {
                return res
                    .status(400)
                    .json(errorResponse('Property configuration not found'));
            }

            const propertyCode = req.property.propertyCode;

            if (
                !propertyCode ||
                !roomType ||
                !startDate ||
                !endDate ||
                !availableRooms
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields to create an inventory record'
                        )
                    );
            }
            if (new Date(startDate) > new Date(endDate)) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start Date must come before end Date')
                    );
            }
            const serRes = await this.inventoryServices.createInventoryService(
                propertyCode,
                roomType,
                startDate,
                endDate,
                availableRooms,
                pushFromCalender
            );
            const resStatus = serRes?.success ? 200 : 400;
            return res.status(resStatus).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
   public async mapRatePlans(req: PropertyCustomRequest, res: Response) {
       const log = logger.start('mapRatePlans', req.headers['x-request-id'] as string);

    log.setIncoming({
        body: req.body,
        propertyId: req.property?.id,
        propertyCode: req.property?.propertyCode,
    });

    try {
        const {
            ratePlanCode,
            ratePlanName,
            roomTypeCode,
            roomTypeName,
            baseByGuestAmounts,
            additionalGuestAmounts,
            currencyCode,
            startDate,
            endDate,
        } = req.body;

        if (!req.property) {
            const res_ = errorResponse('Property configuration not found');
            log.pushMessage('Property configuration not found', 'warn').setServiceResponse(res_).save();
            return res.status(500).json(res_);
        }

        const propertyId = req.property.id;
        const propertyCode = req.property.propertyCode;

        if (!req.property.propertyConfig?.selfAriActive) {
            const res_ = errorResponse('Self ARI is not active for this property');
            log.pushMessage('Self ARI not active', 'warn', { propertyCode }).setServiceResponse(res_).save();
            return res.status(400).json(res_);
        }

        if (!propertyCode) {
            const res_ = errorResponse('Property Not Found', 'property code is not available');
            log.pushMessage('Property code missing', 'warn').setServiceResponse(res_).save();
            return res.status(400).json(res_);
        }

        if (
            !roomTypeCode || !ratePlanCode || !baseByGuestAmounts ||
            !additionalGuestAmounts || !ratePlanName || !roomTypeName ||
            !currencyCode || !startDate || !endDate
        ) {
            const res_ = errorResponse('All fields are required');
            log.pushMessage('Validation failed — missing required fields', 'warn', {
                missing: { roomTypeCode, ratePlanCode, ratePlanName, roomTypeName, currencyCode, startDate, endDate }
            }).setServiceResponse(res_).save();
            return res.status(400).json(res_);
        }

        log.pushMessage('Validation passed, calling mapRatePlanService', 'info', {
            propertyId, propertyCode, roomTypeCode, ratePlanCode,
        });

        const serRes = await this.inventoryServices.mapRatePlanService(
            propertyId,
            propertyCode,
            roomTypeName,
            roomTypeCode,
            ratePlanName,
            ratePlanCode,
            baseByGuestAmounts,
            additionalGuestAmounts,
            currencyCode,
            startDate,
            endDate,
            log  // 👈 pass it down
        );

        log.setServiceResponse(serRes).save();
        return res.status(serRes?.success ? 200 : 400).json(serRes);

    } catch (error: any) {
        log.setError(error).save();
        return res.status(500).json(errorResponse('Internal Server Error', error?.message));
    }
}
    public async getRoomAvailibility(
        req: PropertyCustomRequest,
        res: Response
    ) {
        try {
            const { roomType } = req.query;

            if (!roomType) {
                return res
                    .status(400)
                    .json(errorResponse('roomType is required'));
            }
            const propertyCode = req.property?.propertyCode;
            if (!propertyCode) {
                return res
                    .status(400)
                    .json(errorResponse('Property Not Found'));
            }

            const serRes =
                await this.inventoryServices.getRoomAvailabilityService(
                    propertyCode,
                    roomType as string
                );
            const resStatus = serRes?.success ? 200 : 400;
            return res.status(resStatus).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
export { InventoryController };
