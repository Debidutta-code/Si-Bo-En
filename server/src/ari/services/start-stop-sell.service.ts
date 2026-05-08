import { StartStopSellRepository } from '../repository/start-stop-sell.repository';
import { IstartStopSellS, IstartStopSellR } from '../types';
import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import getPropertyIdFromPropertyId from '../utils/getPropertyCodeFromPropertyId';
export class StartStopSellService {
    startStopSellRepository: StartStopSellRepository;

    constructor() {
        this.startStopSellRepository = new StartStopSellRepository();
    }
    public async createStartStopSell(
        propertyId: string,
        startStopSellData: IstartStopSellS
    ): Promise<IApiResponse> {
        try {
            const propertyCode = await getPropertyIdFromPropertyId(propertyId);
            if (!propertyCode) {
                return errorResponse(
                    'Property not found',
                    `Property with id ${propertyId} does not exist`
                );
            }
            const { from, to, roomTypeCode, ratePlanCode, isSellStop } =
                startStopSellData;
            if (new Date(from) > new Date(to)) {
                return errorResponse(
                    'Invalid date range',
                    'The "from" date cannot be later than the "to" date.'
                );
            }

            const dateArray: IstartStopSellR[] = [];
            let currentDate = new Date(from);
            while (currentDate <= to) {
                dateArray.push({
                    date: new Date(currentDate),
                    roomTypeCode: roomTypeCode,
                    ratePlanCode: ratePlanCode,
                    isSellStop: isSellStop,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const response =
                await this.startStopSellRepository.createStartStopSell(
                    propertyCode,
                    dateArray
                );
            return successResponse(
                'Start-stop-sell records created successfully',
                response
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    `Failed to complete start-stop-sell from ${startStopSellData.from} to ${startStopSellData.to}`,
                    error.message
                );
            }
            return errorResponse(
                'Failed to complete start-stop-sell',
                'An unknown error occurred'
            );
        }
    }
}
