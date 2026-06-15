import { SpaDates, SpaSlotsServ } from '../services';
import { CustomRequest, IApiResponse, errorResponse, toUTC } from '../../utils';
import { Response, Request } from 'express';
import { ICSpaSlotBatch, ICSpaSlotS } from '../types';

export class SpaDateController {
    private spaDateService: SpaDates;

    constructor() {
        this.spaDateService = new SpaDates();
    }
    public async createSpaDate(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            const { dates } = req.body;

            if (!dates || !Array.isArray(dates) || dates.length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('"dates" must be a non-empty array'));
            }

            const parsedDates = dates.map(toUTC);

            const response = await this.spaDateService.createSpaDates(parsedDates, spaId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to create spa dates', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create spa dates', 'Unknown error'));
        }
    }
    public async getSpaForDateRange(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            const { startDate, endDate } = req.body;
            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }
            const response = await this.spaDateService.getSpaForDateRange(
                spaId,
                toUTC(startDate),
                toUTC(endDate)
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch spa dates for range',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch spa dates for range',
                        'Unknown error'
                    )
                );
        }
    }
    public async deleteSpaDate(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            if (!spaId) {
                return res
                    .status(400)
                    .json(errorResponse('Spa ID is required'));
            }
            const response = await this.spaDateService.deleteDate(spaId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete spa date',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to delete spa date', 'Unknown error')
                );
        }
    }
}

export class SpaSlotController {
    private spaSlotService: SpaSlotsServ;

    constructor() {
        this.spaSlotService = new SpaSlotsServ();
    }

    public async createSlots(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaModuleId = req.params.id; // spa module id from route
            const slots: ICSpaSlotBatch[] = req.body;

            if (!Array.isArray(slots) || slots.length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('slots must be a non-empty array'));
            }

            // Validate each slot has required fields
            for (const slot of slots) {
                if (!slot.spaDateId || !slot.startTime) {
                    return res
                        .status(400)
                        .json(errorResponse('Each slot must have spaDateId and startTime'));
                }
                if (!slot.availability || slot.availability < 1) {
                    return res
                        .status(400)
                        .json(errorResponse('Each slot must have availability >= 1'));
                }
            }

            const response = await this.spaSlotService.createManySlots(slots, spaModuleId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to create spa slots', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create spa slots', 'Unknown error'));
        }
    }

    public async deleteSpaSlot(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const slotId = req.params.id;
            if (!slotId) {
                return res.status(400).json(errorResponse('Slot ID is required'));
            }
            const response = await this.spaSlotService.deleteSpaSlot(slotId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to delete spa slot', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete spa slot', 'Unknown error'));
        }
    }
}
//     public async markSlotAsBooked(
//         req: Request,
//         res: Response
//     ): Promise<Response<IApiResponse>> {
//         try {
//             const slotId = req.params.id;
//             const { reservationId, userName } = req.body;
//             if (!slotId) {
//                 return res
//                     .status(400)
//                     .json(errorResponse('Slot ID is required'));
//             }
//             if (!reservationId || !userName) {
//                 return res
//                     .status(400)
//                     .json(
//                         errorResponse(
//                             'Reservation ID and User Name are required'
//                         )
//                     );
//             }
//             const response = await this.spaSlotService.markAsBooked(
//                 slotId,
//                 reservationId,
//                 userName
//             );
//             return res.status(response.success ? 200 : 400).json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return res
//                     .status(500)
//                     .json(
//                         errorResponse(
//                             'Failed to mark spa slot as booked',
//                             error.message
//                         )
//                     );
//             }
//             return res
//                 .status(500)
//                 .json(
//                     errorResponse(
//                         'Failed to mark spa slot as booked',
//                         'Unknown error'
//                     )
//                 );
//         }
//     }
//     public async markSlotAsAvailable(
//         req: CustomRequest,
//         res: Response
//     ): Promise<Response<IApiResponse>> {
//         try {
//             const slotId = req.params.id;
//             if (!slotId) {
//                 return res
//                     .status(400)
//                     .json(errorResponse('Slot ID is required'));
//             }
//             // const response = await this.spaSlotService.markAsAvailable(slotId);
//             const response ={
//                 success:true,
//                 data:null,
                
//             }
//             return res.status(response.success ? 200 : 400).json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return res
//                     .status(500)
//                     .json(
//                         errorResponse(
//                             'Failed to mark spa slot as available',
//                             error.message
//                         )
//                     );
//             }
//             return res
//                 .status(500)
//                 .json(
//                     errorResponse(
//                         'Failed to mark spa slot as available',
//                         'Unknown error'
//                     )
//                 );
//         }
//     }
//     public async markSlotAsCompleted(
//         req: CustomRequest,
//         res: Response
//     ): Promise<Response<IApiResponse>> {
//         try {
//             const slotId = req.params.id;
//             if (!slotId) {
//                 return res
//                     .status(400)
//                     .json(errorResponse('Slot ID is required'));
//             }
//             const response =
//                 await this.spaSlotService.markSlotAsCompleted(slotId);
//             return res.status(response.success ? 200 : 400).json(response);
//         } catch (error) {
//             if (error instanceof Error) {
//                 return res
//                     .status(500)
//                     .json(
//                         errorResponse(
//                             'Failed to mark spa slot as completed',
//                             error.message
//                         )
//                     );
//             }
//             return res
//                 .status(500)
//                 .json(
//                     errorResponse(
//                         'Failed to mark spa slot as completed',
//                         'Unknown error'
//                     )
//                 );
//         }
//     }
// }
