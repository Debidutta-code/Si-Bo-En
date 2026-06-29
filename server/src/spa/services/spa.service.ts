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
            const spas = await this.spaRepository.getAvailableSpaForinDateRangeBE(
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
            let reservation: any = null;

            if (data.bookingCode) {
                reservation = await this.spaRepository.getReservationByCode(data.bookingCode);
            }

            // Fetch all Spas at once to avoid N+1
            const uniqueSpaIds = [...new Set(data.slots.map(s => s.spaId))];
            const spaMap = new Map();
            for (const id of uniqueSpaIds) {
                const spa = await this.spaRepository.getById(id);
                if (spa) spaMap.set(id, spa);
            }

            let inclusiveSlotsCountInRequest = 0;
            for (const slot of data.slots) {
                const spa = spaMap.get(slot.spaId);
                if (!spa) return errorResponse(`Spa not found: ${slot.spaId}`);

                if (spa.isInclusive) {
                    inclusiveSlotsCountInRequest++;
                    if (!reservation) {
                        return errorResponse('Inclusive spa services require a valid hotel reservation.');
                    }
                }

                const slotAmount = !spa.isInclusive ? (spa.discountValue || 0) : 0;
                totalAmount += slotAmount;

                processedSlots.push({
                    spaId: slot.spaId,
                    slotsAvailableId: slot.slotsAvailableId,
                    amount: slotAmount,
                    userName: slot.userName,
                    userEmail: slot.userEmail,
                });
            }

            // Backend restriction for inclusive slots
            if (inclusiveSlotsCountInRequest > 0 && reservation) {
                const reservationWithGuests = await this.spaRepository['prisma'].reservation.findUnique({
                    where: { id: reservation.id },
                    include: {
                        reservationGuests: true,
                        SlotsAvailable: {
                            where: { status: 'booked' },
                            include: {
                                spaSlot: {
                                    include: {
                                        spaDate: {
                                            include: {
                                                spaModule: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                });
                const totalGuestsAllowed = (reservationWithGuests?.reservationGuests?.length || 0) + 1; // +1 for primary guest

                const alreadyBookedInclusiveCount = reservationWithGuests?.SlotsAvailable?.filter(sa =>
                    sa.spaSlot?.spaDate?.spaModule?.isInclusive
                ).length || 0;

                if (inclusiveSlotsCountInRequest + alreadyBookedInclusiveCount > totalGuestsAllowed) {
                    return errorResponse(`You can only book up to ${totalGuestsAllowed} inclusive spa slots in total for your stay. You have already booked ${alreadyBookedInclusiveCount}.`);
                }
            }

            const booking = await this.spaRepository.createSpaBooking(
                {
                    userEmail: reservation?.bookingUserEmail || data.userEmail, // Prioritize reservation email as per instructions
                    userName: data.userName,
                    userContactNumber: data.userContactNumber,
                    userId: data.userId,
                    totalAmount,
                    currencyCode: data.currencyCode,
                    reservationId: reservation?.id,
                },
                processedSlots
            );

            try {
                const firstSpaWithProperty = await this.spaRepository.getSpaWithProperty(
                    processedSlots[0].spaId
                );
                const managerEmails: string[] = firstSpaWithProperty?.AssignedSpas
                    ?.map((a: any) => a.User?.email).filter(Boolean) ?? [];

                const emailSlots = await Promise.all(
                    processedSlots.map(async (ps) => {
                        const spa = await this.spaRepository.getById(ps.spaId);
                        const slot = await this.spaRepository.getSlotById(ps.slotsAvailableId);
                        return {
                            spaName: spa?.name ?? 'Spa Service',
                            date: slot?.spaDate?.date
                                ? new Date(slot.spaDate.date).toLocaleDateString('en-US', {
                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
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
                            guestName: ps.userName || data.userName,
                            guestEmail: ps.userEmail || data.userEmail,
                        };
                    })
                );

                // Send confirmation to primary user (reservation email preferred)
                const primaryEmail = reservation?.bookingUserEmail || data.userEmail;

                await this.spaEmailService.bookingConfirmed({
                    userName: data.userName,
                    userEmail: primaryEmail,
                    bookingId: booking.id,
                    managerEmails,
                    slots: emailSlots,
                    totalAmount,
                    currencyCode: data.currencyCode,
                });

                // Send separate confirmations to other guests if they have emails
                for (const ps of processedSlots) {
                    if (ps.userEmail && ps.userEmail !== primaryEmail) {
                        const guestSlot = emailSlots.find(s => s.guestEmail === ps.userEmail);
                        if (guestSlot) {
                            await this.spaEmailService.bookingConfirmed({
                                userName: ps.userName || 'Guest',
                                userEmail: ps.userEmail,
                                bookingId: booking.id,
                                managerEmails: [], // Don't spam managers
                                slots: [guestSlot],
                                totalAmount: ps.amount,
                                currencyCode: data.currencyCode,
                            });
                        }
                    }
                }
            } catch (emailError) {
                console.error('Spa confirmation email failed:', emailError);
            }

            return successResponse('Spa booking created successfully', booking);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to create spa booking', error.message);
            return errorResponse('Failed to create spa booking');
        }
    }

    public async cancelSpaReservation(
        bookingId: string,
        customerId?: string,
        slotBookingId?: string          // ← renamed from spaSlotsId
    ): Promise<IApiResponse> {
        try {
            const cancelledBooking = await this.spaRepository.getSpaBookingById(bookingId);
            const result = await this.spaRepository.cancelSpaBooking(bookingId, slotBookingId); // ← updated

            const cancelledSlot = result?.cancelledSlot;
            const spa = cancelledSlot?.spa;
            const slotsAvailable = cancelledSlot?.slotsAvailable;   // ← updated
            const spaSlot = slotsAvailable?.spaSlot;

            const cancellationData = {
                spaName: spa?.name ?? 'Spa Service',
                date: spaSlot?.spaDate?.date
                    ? new Date(spaSlot.spaDate.date).toLocaleDateString('en-US', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                    })
                    : '—',
                startTime: spaSlot?.startTime
                    ? new Date(spaSlot.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                    })
                    : '—',
                endTime: spaSlot?.endTime
                    ? new Date(spaSlot.endTime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                    })
                    : null,
            };

            try {
                const managerEmails: string[] =
                    spa?.AssignedSpas?.map((a: any) => a.User?.email).filter(Boolean) ?? [];

                if (cancelledBooking?.userEmail) {
                    await this.spaEmailService.bookingCancelled({
                        userName: spaSlot ? 'Guest' : 'Guest',
                        userEmail: cancelledBooking.userEmail,
                        bookingId,
                        managerEmails,
                        cancelledSlot: cancellationData,
                    });
                }
            } catch (emailError) {
                console.error('Spa cancellation email failed:', emailError);
            }

            return successResponse('Spa booking cancelled successfully', result.booking);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to cancel spa booking', error.message);
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
