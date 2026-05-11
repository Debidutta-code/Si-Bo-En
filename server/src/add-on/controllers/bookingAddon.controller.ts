import { Request, Response } from 'express';
import { BookingAddonService } from '../services';
import { successResponse, errorResponse } from '../../utils/return';

export class BookingAddonController {
    private bookingAddonService: BookingAddonService;

    constructor() {
        this.bookingAddonService = new BookingAddonService();
    }

    /**
     * Create a booking addon
     */
    createBookingAddon = async (req: Request, res: Response) => {
        try {
            const bookingAddonData = req.body;

            const bookingAddon =
                await this.bookingAddonService.createBookingAddon(
                    bookingAddonData
                );

            return res
                .status(bookingAddon.success ? 201 : 400)
                .json(bookingAddon);
        } catch (error: any) {
            console.error(
                'Failed to create booking addon at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create booking addon',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create booking addon',
                        'Unable to create booking addon at this moment'
                    )
                );
        }
    };

    /**
     * Update booking addon
     */
    updateBookingAddon = async (req: Request, res: Response) => {
        try {
            const { bookingAddonId } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update payload cannot be empty',
                });
            }

            const bookingAddon =
                await this.bookingAddonService.updateBookingAddon(
                    bookingAddonId,
                    updateData
                );

            return res
                .status(bookingAddon.success ? 200 : 400)
                .json(bookingAddon);
        } catch (error: any) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update booking addon',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to update booking addon',
                        'Unable to update booking addon at this moment'
                    )
                );
        }
    };

    /**
     * Delete booking addon
     */
    deleteBookingAddon = async (req: Request, res: Response) => {
        try {
            const { bookingAddonId } = req.params;

            const result =
                await this.bookingAddonService.deleteBookingAddon(
                    bookingAddonId
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error: any) {
            console.error(
                'Failed to delete booking addon at Controller Layer:',
                error
            );

            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete booking addon',
                            error.message
                        )
                    );
            }

            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete booking addon',
                        'Unable to delete booking addon at this moment'
                    )
                );
        }
    };
}
