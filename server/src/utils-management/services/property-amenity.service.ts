import { PropertyAminityDao } from '../repository';
import { errorResponse, IApiResponse, successResponse } from '../../utils';

export class AminityServices {
    private propertyAminityDao: PropertyAminityDao;
    constructor() {
        this.propertyAminityDao = new PropertyAminityDao();
    }
    public async createCategory(amenities: string[]): Promise<IApiResponse> {
        try {
            const daoRes =
                await this.propertyAminityDao.addPropertyAmenities(amenities);
            return successResponse('Aminity added successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create category',
                    error?.message
                );
            }
            return errorResponse('Failed to create category', 'Unknown error');
        }
    }
    public async getCategory(type: string = 'property'): Promise<IApiResponse> {
        try {
            const daoRes =
                await this.propertyAminityDao.getAllPropertyAmenities(type);
            return successResponse('Aminity fetched Successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch aminity', error?.message);
            }
            return errorResponse('Failed to fetch aminity', 'Unknown error');
        }
    }
    public async deleteCategory(amenities: string[]): Promise<IApiResponse> {
        try {
            const daoRes =
                await this.propertyAminityDao.deletePropertyAmenities(
                    amenities
                );
            return successResponse('Aminity Deleted Successfully', daoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete aminity',
                    error?.message
                );
            }
            return errorResponse('Failed to delete aminity', 'Unknown error');
        }
    }
}
