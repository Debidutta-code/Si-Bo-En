import { successResponse, errorResponse } from '../../utils/return';
import { TaxGroupService } from '../services';
import { Request, Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';

import { TaxGroupInterceptor } from '../../multi-language/interceptors/tax-system/tax-group.interceptor';

export class TaxGroupController {
    taxGroupService: TaxGroupService;

    constructor() {
        this.taxGroupService = new TaxGroupService();
    }
    public async createTaxGroupController(req: CustomRequest, res: Response) {
        try {
            const propertyId = req.query.propertyId as string;
            const taxGroupData = req.body;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }
            if (!taxGroupData.name) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group name is required'));
            }
            const serviceRes = await this.taxGroupService.createTaxGroup(
                propertyId,
                taxGroupData
            );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async getTaxGroupsByPropertyIdController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const propertyId = req.params.propertyId;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let serviceRes =
                await this.taxGroupService.getTaxGroupsByPropertyId(propertyId);

            serviceRes = await TaxGroupInterceptor.intercept(serviceRes, locale);

            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async updateTaxGroupController(req: CustomRequest, res: Response) {
        try {
            const taxGroupId = req.params.taxGroupId;
            const taxGroupData = req.body;
            if (!taxGroupId) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group ID is required'));
            }
            if (!taxGroupData) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group data is required'));
            }
            if (!taxGroupData.name) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group name is required'));
            }

            const serviceRes = await this.taxGroupService.updateTaxGroup(
                taxGroupId,
                taxGroupData
            );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async deleteTaxGroupController(req: CustomRequest, res: Response) {
        try {
            const taxGroupId = req.params.taxGroupId;
            if (!taxGroupId) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group ID is required'));
            }
            const serviceRes =
                await this.taxGroupService.deleteTaxGroup(taxGroupId);
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async addRulesToTaxGroupController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const taxGroupId = req.params.taxGroupId;
            const { ruleIds } = req.body;
            if (!taxGroupId) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group ID is required'));
            }
            if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Rule must be a non-empty array'));
            }
            const serviceRes = await this.taxGroupService.addRulesToTaxGroup(
                taxGroupId,
                ruleIds
            );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public async removeRulesFromTaxGroupController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const taxGroupId = req.params.taxGroupId;
            const { ruleIds } = req.body;
            if (!taxGroupId) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Group ID is required'));
            }
            if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
                return res
                    .status(400)
                    .json(errorResponse('Tax Rules must be a non-empty array'));
            }
            const serviceRes =
                await this.taxGroupService.removeRulesFromTaxGroup(
                    taxGroupId,
                    ruleIds
                );
            const status = serviceRes.success ? 200 : 400;
            return res.status(status).json(serviceRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
