import { TaxGroupRepository } from '../repository';
import { ICTaxGroup } from '../interfaces';
import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { PropertyDao } from '../../property-management/repository/property.repository';
export class TaxGroupService {
    taxGroupRepository: TaxGroupRepository;

    constructor() {
        this.taxGroupRepository = new TaxGroupRepository();
    }
    public async createTaxGroup(
        propertyId: string,
        taxGroupData: ICTaxGroup
    ): Promise<IApiResponse> {
        try {
            const isProertyExist = await PropertyDao.getPropertyById(
                propertyId,
                true
            );
            if (!isProertyExist) {
                throw new Error('Property not found');
            }
            const newTaxGroup = await this.taxGroupRepository.createTaxGroup(
                propertyId,
                taxGroupData
            );
            if (newTaxGroup) {
                return successResponse(
                    'Tax Group created successfully',
                    newTaxGroup
                );
            } else {
                return errorResponse('Failed to create Tax Group');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create Tax Group',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to create Tax Group',
                    'Unknown error occurred'
                );
            }
        }
    }
    public async getTaxGroupsByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const taxGroups =
                await this.taxGroupRepository.getTaxGroupByPropertyId(
                    propertyId
                );
            return successResponse(
                'Tax Groups fetched successfully',
                taxGroups
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get Tax Groups', error.message);
            } else {
                return errorResponse(
                    'Failed to get Tax Groups',
                    'Unknown error occurred'
                );
            }
        }
    }
    public async updateTaxGroup(
        taxGroupId: string,
        taxGroupData: ICTaxGroup
    ): Promise<IApiResponse> {
        try {
            const exists =
                await this.taxGroupRepository.getTaxGroupById(taxGroupId);
            if (!exists) {
                return errorResponse('Tax Group does not exist');
            }
            const updatedTaxGroup =
                await this.taxGroupRepository.updateTaxGroup(
                    taxGroupId,
                    taxGroupData
                );
            if (updatedTaxGroup) {
                return successResponse(
                    'Tax Group updated successfully',
                    updatedTaxGroup
                );
            } else {
                return errorResponse('Failed to update Tax Group');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update Tax Group',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to update Tax Group',
                    'Unknown error occurred'
                );
            }
        }
    }
    public async deleteTaxGroup(taxGroupId: string): Promise<IApiResponse> {
        try {
            const exists =
                await this.taxGroupRepository.getTaxGroupById(taxGroupId);
            if (!exists) {
                return errorResponse('Tax Group does not exist');
            }
            const deletedTaxGroup =
                await this.taxGroupRepository.deleteTaxGroup(taxGroupId);
            if (deletedTaxGroup) {
                return successResponse(
                    'Tax Group deleted successfully',
                    deletedTaxGroup
                );
            } else {
                return errorResponse('Failed to delete Tax Group');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete Tax Group',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to delete Tax Group',
                    'Unknown error occurred'
                );
            }
        }
    }
    public async getTaxGroupById(taxGroupId: string): Promise<IApiResponse> {
        try {
            const taxGroup =
                await this.taxGroupRepository.getTaxGroupById(taxGroupId);
            if (!taxGroup) {
                return errorResponse('Tax Group does not exist');
            }
            return successResponse('Tax Group fetched successfully', taxGroup);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get Tax Group', error.message);
            } else {
                return errorResponse(
                    'Failed to get Tax Group',
                    'Unknown error occurred'
                );
            }
        }
    }

    public async addRulesToTaxGroup(
        taxGroupId: string,
        taxGroupRules: string[]
    ): Promise<IApiResponse> {
        try {
            const exists =
                await this.taxGroupRepository.getTaxGroupById(taxGroupId);
            if (!exists) {
                return errorResponse('Tax Group does not exist');
            }
            const addedRules =
                await this.taxGroupRepository.addTaxRulesToTaxGroup(
                    taxGroupId,
                    taxGroupRules
                );
            if (addedRules) {
                return successResponse(
                    'Tax Group Rules added successfully',
                    addedRules
                );
            } else {
                return errorResponse('Failed to add Tax Group Rules');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to add Tax Group Rules',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to add Tax Group Rules',
                    'Unknown error occurred'
                );
            }
        }
    }
    public async removeRulesFromTaxGroup(
        taxGroupId: string,
        taxGroupRules: string[]
    ): Promise<IApiResponse> {
        try {
            const exists =
                await this.taxGroupRepository.getTaxGroupById(taxGroupId);
            if (!exists) {
                return errorResponse('Tax Group does not exist');
            }
            const removedRules =
                await this.taxGroupRepository.removeTaxRulesFromTaxGroup(
                    taxGroupId,
                    taxGroupRules
                );
            if (removedRules) {
                return successResponse(
                    'Tax Group Rules removed successfully',
                    removedRules
                );
            } else {
                return errorResponse('Failed to remove Tax Group Rules');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to remove Tax Group Rules',
                    error.message
                );
            } else {
                return errorResponse(
                    'Failed to remove Tax Group Rules',
                    'Unknown error occurred'
                );
            }
        }
    }
}
