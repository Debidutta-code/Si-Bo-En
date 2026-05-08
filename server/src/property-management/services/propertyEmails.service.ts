import { IApiResponse } from '../../utils';
import { successResponse, errorResponse } from '../../utils';
import { PropertyEmailsRepository } from '../repository';
export class PropertyEmailsService {
    private propertyEmailsRepository: PropertyEmailsRepository;
    constructor() {
        this.propertyEmailsRepository = new PropertyEmailsRepository();
    }
    public createPropertyEmail = async (
        propertyId: string,
        email: string
    ): Promise<IApiResponse> => {
        try {
            const isAlreadyExists =
                await this.propertyEmailsRepository.getByEmail(
                    propertyId,
                    email
                );
            if (isAlreadyExists) {
                return errorResponse('email already exists for this property');
            }
            const result = await this.propertyEmailsRepository.create(
                propertyId,
                email
            );
            if (!result) {
                return errorResponse('failed to add email to property');
            }
            return successResponse('Property email created successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to add email to property',
                    error.message
                );
            }
            return errorResponse('failed to add email to property');
        }
    };
    public async getPropertyEmails(propertyId: string): Promise<IApiResponse> {
        try {
            const result =
                await this.propertyEmailsRepository.getByPropertyId(propertyId);
            return successResponse(
                'Property emails retrieved successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to retrieve property emails',
                    error.message
                );
            }
            return errorResponse('failed to retrieve property emails');
        }
    }
    public async deletePropertyEmail(id: string): Promise<IApiResponse> {
        try {
            const existingEmail =
                await this.propertyEmailsRepository.getById(id);
            if (!existingEmail) {
                return errorResponse('email does not exist');
            }
            await this.propertyEmailsRepository.delete(existingEmail.id);
            return successResponse('Property email deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to delete property email',
                    error.message
                );
            }
            return errorResponse('failed to delete property email');
        }
    }
    public async updatePropertyEmail(
        id: string,
        email: string
    ): Promise<IApiResponse> {
        try {
            const existingEmail =
                await this.propertyEmailsRepository.getById(id);
            if (!existingEmail) {
                return errorResponse('email does not exist');
            }
            const isAlreadyExists =
                await this.propertyEmailsRepository.getByEmail(
                    existingEmail.propertyId,
                    email
                );
            if (isAlreadyExists) {
                return errorResponse('email already exists for this property');
            }
            await this.propertyEmailsRepository.update(existingEmail.id, email);
            return successResponse('Property email updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to update property email',
                    error.message
                );
            }
            return errorResponse('failed to update property email');
        }
    }
}
