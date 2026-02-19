import { errorResponse, IApiResponse, successResponse } from "../../../utils";
import { MLOSDao } from "../dao";
import { IMLOSCreate, } from "../interfaces";

export class MLOSService {
    private mlosDao: MLOSDao;

    constructor() {
        this.mlosDao = new MLOSDao();
    }

    public async createRatePlanRule(data: IMLOSCreate): Promise<IApiResponse> {
        try {
            const ratePlanExists = await this.mlosDao.ratePlanExists(data.ratePlanId);
            if (!ratePlanExists) {
                return errorResponse('MLOS already exists for this rateplan');
            }

            const existingRule = await this.mlosDao.getRatePlanRuleByRatePlanId(data.ratePlanId);
            if (existingRule) {
                return errorResponse('Rate plan rule already exists for this rate plan. Please update the existing rule instead.');
            }

            const response = await this.mlosDao.createRatePlanRule(data);

            if (response) {
                return successResponse('Rate plan rule created successfully', response);
            } else {
                return errorResponse('Failed to create rate plan rule');
            }
        } catch (error) {
            
            if (error instanceof Error) {
                return errorResponse('Failed to create rate plan rule', error?.message);
            }
            return errorResponse('Failed to create rate plan rule');
        }
    }

    public async getRatePlanRuleByRatePlanId(ratePlanId: string): Promise<IApiResponse> {
        try {
            const rule = await this.mlosDao.getRatePlanRuleByRatePlanId(ratePlanId);

            if (!rule) {
                return errorResponse('Rate plan rule not found');
            }

            return successResponse('Rate plan rule fetched successfully', rule);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to get mlos ', error?.message);
            }
            return errorResponse('Failed to get mlos');
        }
    }

    public async updateRatePlanRule(
        ratePlanId: string,
        updateData: IMLOSCreate
    ): Promise<IApiResponse> {
        try {
            const existingRule = await this.mlosDao.getRatePlanRuleByRatePlanId(ratePlanId);
            if (!existingRule) {
                return errorResponse('Rate plan rule does not exist');
            }

            const response = await this.mlosDao.updateRatePlanRule(
                ratePlanId,
                updateData
            );

            if (response) {
                return successResponse('Rate plan rule updated successfully', response);
            } else {
                return errorResponse('Failed to update rate plan rule');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update mlos ', error?.message);
            }
            return errorResponse('Failed to update mlos');
        }
    }

    public async deleteRatePlanRule(ratePlanId: string) {
        try {
            const existingRule = await this.mlosDao.getRatePlanRuleByRatePlanId(ratePlanId);
            if (!existingRule) {
                return errorResponse('Rate plan rule does not exist');
            }

            const response = await this.mlosDao.deleteRatePlanRule(ratePlanId);

            if (response) {
                return successResponse('Rate plan rule deleted successfully', response);
            } else {
                return errorResponse('Failed to delete rate plan rule');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete mlos ', error?.message);
            }
            return errorResponse('Failed to delete mlos');
        }
    }
    public async getRatePlanRulesByPropertyId(propertyId: string) {
        try {
            const rules = await this.mlosDao.getRatePlanRulesByPropertyId(propertyId);

            return successResponse('Rate plan rules fetched successfully', rules);
        } catch (error: any) {
            return errorResponse('Failed to fetch rate plan rules', error?.message);
        }
    }
}