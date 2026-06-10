import { ICTouristTax } from '../interfaces';
import { TouristTaxRepository } from '../repository/tourist-tax.repository';
import { PropertyDao } from '../../property-management/repository/property.repository';
import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { RatePlanRepository } from '../../ari/repository';
import { getCurrencyConverter } from '../../currency-maping/utils';
import { RoomDao } from '../../property-management/repository';

export class TouristTaxService {
    touristTaxRepository: TouristTaxRepository;
    roomDao: RoomDao;

    constructor() {
        this.touristTaxRepository = new TouristTaxRepository();
        this.roomDao = new RoomDao();
    }

    public async createTouristTax(
        propertyId: string,
        touristTaxData: ICTouristTax
    ): Promise<IApiResponse> {
        try {
            // Verify property exists
            const [property, { convert, baseCurrency }] = await Promise.all([
                PropertyDao.getPropertyById(propertyId, true),
                getCurrencyConverter(
                    propertyId,
                    touristTaxData.currencyCode
                        ? touristTaxData.currencyCode
                        : 'AED'
                ),
            ]);
            if (!property) {
                return errorResponse('Property not found');
            }
            const room = await this.roomDao.findByRoomId(touristTaxData.roomId,false);

            if (!room) {
                return errorResponse(
                    'Room not found or does not belong to this property'
                );
            }

            const existingTouristTax =
                await this.touristTaxRepository.getTouristTaxByRoomType(
                    room.id,
                    propertyId
                );

            if (existingTouristTax) {
                return errorResponse(
                    'Tourist tax already exists for this rate plan'
                );
            }

            const newTouristTax =
                await this.touristTaxRepository.createTouristTax(room.id, {
                    ...touristTaxData,
                    currencyCode:
                        touristTaxData.discountType === 'flat'
                            ? baseCurrency
                            : touristTaxData.currencyCode,
                    discountValue:
                        touristTaxData.discountType === 'flat'
                            ? convert(
                                  touristTaxData.discountValue
                                      ? touristTaxData.discountValue
                                      : 0
                              )
                            : touristTaxData.discountValue,
                });

            if (newTouristTax) {
                return successResponse(
                    'Tourist tax created successfully',
                    newTouristTax
                );
            } else {
                return errorResponse('Failed to create tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create tourist tax',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to create tourist tax',
                    'Unknown error occurred'
                );
            }
        }
    }

    public async getTouristTaxesByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const touristTaxes =
                await this.touristTaxRepository.getTouristTaxesByPropertyId(
                    propertyId
                );
            return successResponse(
                'Tourist taxes fetched successfully',
                touristTaxes
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get tourist taxes',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to get tourist taxes',
                    'Unknown error occurred'
                );
            }
        }
    }

    public async updateTouristTax(
        touristTaxId: string,
        touristTaxData: ICTouristTax
    ): Promise<IApiResponse> {
        try {
            const exists =
                await this.touristTaxRepository.getTouristTaxById(touristTaxId);
            if (!exists) {
                return errorResponse('Tourist tax does not exist');
            }
            const propertyId = exists.Room?.propertyId;
            if (!propertyId) {
                return errorResponse(
                    'Associated property not found for this tourist tax'
                );
            }
            const { convert, baseCurrency } = await getCurrencyConverter(
                propertyId,
                touristTaxData.currencyCode
                    ? touristTaxData.currencyCode
                    : 'AED'
            );

            const updatedTouristTax =
                await this.touristTaxRepository.updateTouristTax(touristTaxId, {
                    ...touristTaxData,
                    currencyCode:
                        touristTaxData.discountType === 'flat'
                            ? baseCurrency
                            : touristTaxData.currencyCode,
                    discountValue:
                        touristTaxData.discountType === 'flat'
                            ? convert(
                                  touristTaxData.discountValue
                                      ? touristTaxData.discountValue
                                      : 0
                              )
                            : touristTaxData.discountValue,
                });

            if (updatedTouristTax) {
                return successResponse(
                    'Tourist tax updated successfully',
                    updatedTouristTax
                );
            } else {
                return errorResponse('Failed to update tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update tourist tax',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to update tourist tax',
                    'Unknown error occurred'
                );
            }
        }
    }

    public async deleteTouristTax(touristTaxId: string): Promise<IApiResponse> {
        try {
            const exists =
                await this.touristTaxRepository.getTouristTaxById(touristTaxId);
            if (!exists) {
                return errorResponse('Tourist tax does not exist');
            }

            const deletedTouristTax =
                await this.touristTaxRepository.deleteTouristTax(touristTaxId);
            if (deletedTouristTax) {
                return successResponse(
                    'Tourist tax deleted successfully',
                    deletedTouristTax
                );
            } else {
                return errorResponse('Failed to delete tourist tax');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete tourist tax',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to delete tourist tax',
                    'Unknown error occurred'
                );
            }
        }
    }
}
