import { getCurrencyConverter } from '../../currency-maping/utils';
import { SpaEmailService } from '../../sms-email-service/service/spa.email.service';
import { IApiResponse, successResponse, errorResponse } from '../../utils';
import { SpaRepository } from '../repository';
import { ICSpaR, IUSpaR, ISpaBookingRequest } from '../types';

export class SpaService {
    private spaRepository: SpaRepository;
    private spaEmailService: SpaEmailService;

    constructor() {
        this.spaRepository = new SpaRepository();
        this.spaEmailService = new SpaEmailService();
    }
    public async createSpa(data: ICSpaR): Promise<IApiResponse> {
        try {
            const [isExistByName, isExistByCode, { convert, baseCurrency }] =
                await Promise.all([
                    this.spaRepository.getByName(data.name, data.propertyId),
                    this.spaRepository.getSpaByCode(
                        data.itemCode,
                        data.propertyId
                    ),
                    getCurrencyConverter(
                        data.propertyId,
                        data.currencyCode ? data.currencyCode : 'AED'
                    ),
                ]);

            if (isExistByName || isExistByCode) {
                return errorResponse(
                    'Spa with the same name or code already exists'
                );
            }
            const discountedValue = convert(
                data.discountValue ? data.discountValue : 0
            );
            await this.spaRepository.createSpa({
                ...data,
                currencyCode: data.currencyCode ? baseCurrency : null,
                discountValue: data.discountValue ? discountedValue : null,
            });

            return successResponse('Spa created successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create spa', error.message);
            }
            return errorResponse('Failed to create spa');
        }
    }
    public async getSpaForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const spas = await this.spaRepository.getSpaForProperty(propertyId);
            return successResponse('Spas retrieved successfully', spas);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to retrieve spas', error.message);
            }
            return errorResponse('Failed to retrieve spas');
        }
    }
    public async getSpaForPropertyCode(propertyCode: string): Promise<IApiResponse> {
        try {
            const spas = await this.spaRepository.getSpaForPropertyCode(propertyCode);
            return successResponse('Spas retrieved successfully', spas);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to retrieve spas', error.message);
            }
            return errorResponse('Failed to retrieve spas');
        }
    }
    public async getSpaById(id: string): Promise<IApiResponse> {
        try {
            const spa = await this.spaRepository.getById(id);
            if (!spa) {
                return errorResponse('Spa not found');
            }
            return successResponse('Spa retrieved successfully', spa);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to retrieve spa', error.message);
            }
            return errorResponse('Failed to retrieve spa');
        }
    }
    public async updateSpa(id: string, data: IUSpaR): Promise<IApiResponse> {
        try {
            const isExist = await this.spaRepository.getById(id);
            if (!isExist) {
                return errorResponse('Spa not found');
            }
            const [isExistByName, isExistByCode, { convert, baseCurrency }] =
                await Promise.all([
                    this.spaRepository.getByName(data.name, isExist.propertyId),
                    this.spaRepository.getSpaByCode(
                        data.itemCode,
                        isExist.propertyId
                    ),
                    getCurrencyConverter(
                        isExist.propertyId,
                        data.currencyCode ? data.currencyCode : 'AED'
                    ),
                ]);
            if (isExistByName && isExistByName.id !== id) {
                return errorResponse('Spa with the same name already exists');
            }
            if (isExistByCode && isExistByCode.id !== id) {
                return errorResponse('Spa with the same code already exists');
            }
            await this.spaRepository.updateSpa(id, {
                ...data,
                currencyCode: data.currencyCode ? baseCurrency : null,
                discountValue: data.discountValue
                    ? convert(data.discountValue)
                    : null,
            });
            return successResponse('Spa updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update spa', error.message);
            }
            return errorResponse('Failed to update spa');
        }
    }
    public async deleteSpa(id: string): Promise<IApiResponse> {
        try {
            const isExist = await this.spaRepository.getById(id);
            if (!isExist) {
                return errorResponse('Spa not found');
            }
            await this.spaRepository.deleteSpa(id);
            return successResponse('Spa deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete spa', error.message);
            }
            return errorResponse('Failed to delete spa');
        }
    }
    public async getAvailableSpaForinDateRange(
        bookingCode: string
    ): Promise<IApiResponse> {
        try {
            const reservation =
                await this.spaRepository.getReservationByCode(bookingCode);
            if (!reservation) {
                return errorResponse('Reservation not found');
            }
            const spas = await this.spaRepository.getAvailableSpaForinDateRange(
                reservation.propertyId,
                reservation.reservationStartDate,
                reservation.reservationEndDate
            );
            return successResponse(
                'Available spas retrieved successfully',
                spas
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve available spas',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve available spas');
        }
    }
    public async createSpaReservation(data: ISpaBookingRequest): Promise<IApiResponse> {
        try {
            let totalAmount = 0;
            const processedSlots = [];

            for (const slot of data.slots) {
                const spa = await this.spaRepository.getById(slot.spaId);
                if (!spa) {
                    return errorResponse(`Spa not found: ${slot.spaId}`);
                }

                let slotAmount = 0;
                if (!spa.isInclusive) {
                    slotAmount = spa.discountValue || 0;
                }

                totalAmount += slotAmount;

                processedSlots.push({
                    spaId: slot.spaId,
                    spaSlotId: slot.spaSlotId,
                    amount: slotAmount,
                });
            }

            const booking = await this.spaRepository.createSpaBooking(
                {
                    userEmail: data.userEmail,
                    userName: data.userName,
                    userContactNumber: data.userContactNumber,
                    userId: data.userId,
                    totalAmount: totalAmount,
                    currencyCode: data.currencyCode,
                },
                processedSlots
            );

            // ── Confirmation email ───────────────────────────────────────
            try {
                const firstSpaWithProperty = await this.spaRepository.getSpaWithProperty(
                    processedSlots[0].spaId
                );

                const managerEmails: string[] = firstSpaWithProperty?.AssignedSpas
                    ?.map((a: any) => a.User?.email)
                    .filter(Boolean) ?? [];

                const emailSlots = await Promise.all(
                    processedSlots.map(async (ps) => {
                        const spa = await this.spaRepository.getById(ps.spaId);
                        const slot = await this.spaRepository.getSlotById(ps.spaSlotId);
                        return {
                            spaName: spa?.name ?? 'Spa Service',
                            date: slot?.spaDate?.date
                                ? new Date(slot.spaDate.date).toLocaleDateString('en-US', {
                                    weekday: 'short', year: 'numeric',
                                    month: 'short', day: 'numeric',
                                })
                                : '—',
                            startTime: slot?.startTime
                                ? new Date(slot.startTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                                })
                                : '—',
                            endTime: slot?.endTime
                                ? new Date(slot.endTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                                })
                                : null,
                            amount: ps.amount,
                            currencyCode: data.currencyCode,
                        };
                    })
                );

                await this.spaEmailService.bookingConfirmed({
                    userName: data.userName,
                    userEmail: data.userEmail,
                    bookingId: booking.id,
                    managerEmails,
                    slots: emailSlots,
                    totalAmount,
                    currencyCode: data.currencyCode,
                });
            } catch (emailError) {
                console.error('Spa confirmation email failed:', emailError);
            }
            // ────────────────────────────────────────────────────────────

            return successResponse('Spa booking created successfully', booking);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create spa booking', error.message);
            }
            return errorResponse('Failed to create spa booking');
        }
    }
    public async cancelSpaReservation(
        bookingId: string,
        customerId?: string,
        spaSlotsId?: string
    ): Promise<IApiResponse> {
        try {
            const cancelledBooking =
                await this.spaRepository.getSpaBookingById(bookingId);
            // CANCEL BOOKING
            const result = await this.spaRepository.cancelSpaBooking(
                bookingId,
                customerId,
                spaSlotsId
            );
            const cancelledSlot = result?.cancelledSlot;
            const spa = cancelledSlot?.spa;
            const spaSlot = cancelledSlot?.spaSlots;
            const userName = spaSlot?.userName ?? 'Guest';

            const cancellationData = {
                spaName: spa?.name ?? 'Spa Service',

                date: spaSlot?.spaDate?.date
                    ? new Date(spaSlot.spaDate.date).toLocaleDateString(
                        'en-US',
                        {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }
                    )
                    : '—',

                startTime: spaSlot?.startTime
                    ? new Date(spaSlot.startTime).toLocaleTimeString(
                        'en-US',
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC',
                        }
                    )
                    : '—',

                endTime: spaSlot?.endTime
                    ? new Date(spaSlot.endTime).toLocaleTimeString(
                        'en-US',
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC',
                        }
                    )
                    : null,
            };

            try {
                const managerEmails: string[] =
                    spa?.AssignedSpas?.map((a: any) => a.User?.email).filter(
                        Boolean
                    ) ?? [];


                if (cancelledBooking?.userEmail) {
                    await this.spaEmailService.bookingCancelled({
                        userName,
                        userEmail: cancelledBooking.userEmail,
                        bookingId,
                        managerEmails,
                        cancelledSlot: cancellationData,
                    });

                }
            } catch (emailError) {
                console.error(
                    'Spa cancellation email failed:',
                    emailError
                );
            }

            return successResponse(
                'Spa booking cancelled successfully',
                result.booking
            );
        } catch (error) {
            console.error('cancelSpaReservation error:', error);

            if (error instanceof Error) {
                return errorResponse(
                    'Failed to cancel spa booking',
                    error.message
                );
            }

            return errorResponse('Failed to cancel spa booking');
        }
    }
    public async getCustomerSpaBookings(customerId: string): Promise<IApiResponse> {
        try {
            const bookings = await this.spaRepository.getSpaBookingsByCustomerId(customerId);
            return successResponse('Customer spa bookings retrieved successfully', bookings);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to retrieve customer spa bookings', error.message);
            }
            return errorResponse('Failed to retrieve customer spa bookings');
        }
    }
}
