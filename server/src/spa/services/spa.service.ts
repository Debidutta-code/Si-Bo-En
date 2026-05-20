import { getCurrencyConverter } from '../../currency-maping/utils';
import { IApiResponse, successResponse, errorResponse } from '../../utils';
import { SpaRepository } from '../repository';
import { ICSpaR, IUSpaR, ISpaBookingRequest } from '../types';

export class SpaService {
    private spaRepository: SpaRepository;

    constructor() {
        this.spaRepository = new SpaRepository();
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
                    amount: slotAmount
                });
            }
            
            const booking = await this.spaRepository.createSpaBooking(
                {
                    userEmail: data.userEmail,
                    userContactNumber: data.userContactNumber,
                    userId: data.userId,
                    totalAmount: totalAmount,
                    currencyCode: 'AED' 
                },
                processedSlots
            );
            
            return successResponse('Spa booking created successfully', booking);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create spa booking', error.message);
            }
            return errorResponse('Failed to create spa booking');
        }
    }
    public async cancelSpaReservation(bookingId: string, customerId?: string): Promise<IApiResponse> {
        try {
            const booking = await this.spaRepository.cancelSpaBooking(bookingId, customerId);
            return successResponse('Spa booking cancelled successfully', booking);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to cancel spa booking', error.message);
            }
            return errorResponse('Failed to cancel spa booking');
        }
    }
}
