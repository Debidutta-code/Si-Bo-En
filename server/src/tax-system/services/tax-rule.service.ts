import { ICTaxRule } from "../interfaces";
import { TaxRuleRepository } from "../repository";
import { PropertyDao } from "../../property-management/repository/property.repository";
import { successResponse, errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { getCurrencyConverter } from "../../currency-maping/utils";
export class TaxRuleService {
    taxRuleRepository: TaxRuleRepository;

    constructor() {
        this.taxRuleRepository = new TaxRuleRepository();
    }

    public async createTaxRule(
        propertyId: string,
        taxRuleData: ICTaxRule,
    ): Promise<IApiResponse> {
        try {

            const [property,{convert, baseCurrency} ] = await Promise.all([
              PropertyDao.getPropertyById(propertyId, true),
              getCurrencyConverter(propertyId, "AED")
            ]);
            if (!property) {
                return errorResponse('Property not found');
            }
            const newTaxRule = await this.taxRuleRepository.createTaxRule(
                propertyId,
                taxRuleData
            );
            if (newTaxRule) {
                return successResponse('Tax Rule created successfully', newTaxRule);
            } else {
                return errorResponse('Failed to create Tax Rule');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create Tax Rule', error.message);
            }
            else {
                return errorResponse('Failed to create Tax Rule', 'Unknown error occurred');
            }
        }

    }
    public async getTaxRulesByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const taxRules = await this.taxRuleRepository.getTaxRuleByPropertyId(propertyId);
            return successResponse('Tax Rules fetched successfully', taxRules);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get Tax Rules', error.message);
            }
            else {
                return errorResponse('Failed to get Tax Rules', 'Unknown error occurred');
            }
        }
    }
    public async updateTaxRule(
        taxRuleId: string,
        taxRuleData: Partial<ICTaxRule>,
    ): Promise<IApiResponse> {
        try {
            const exists= await this.taxRuleRepository.getTaxRuleById(taxRuleId);
            if(!exists){
                return errorResponse('Tax Rule does not exist');
            }
            const updatedTaxRule = await this.taxRuleRepository.updateTaxRule(
                taxRuleId,
                taxRuleData
            );
            
            if (updatedTaxRule) {
                return successResponse('Tax Rule updated successfully', updatedTaxRule);
            }
            else {
                return errorResponse('Failed to update Tax Rule');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update Tax Rule', error.message);
            }
            else {
                return errorResponse('Failed to update Tax Rule', 'Unknown error occurred');
            }
        }
    }
    public async deleteTaxRule(taxRuleId: string): Promise<IApiResponse> {
        try {
            const exists= await this.taxRuleRepository.getTaxRuleById(taxRuleId);
            if(!exists){
                return errorResponse('Tax Rule does not exist');
            }
            const deletedTaxRule = await this.taxRuleRepository.deleteTaxRule(taxRuleId);
            if (deletedTaxRule) {
                return successResponse('Tax Rule deleted successfully', deletedTaxRule);
            }else {
                return errorResponse('Failed to delete Tax Rule');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete Tax Rule', error.message);
            }
            else {
                return errorResponse('Failed to delete Tax Rule', 'Unknown error occurred');
            }
        }
    }
}