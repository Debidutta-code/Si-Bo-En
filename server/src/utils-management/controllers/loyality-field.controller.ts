import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { LoyaltyGuestFields } from '../services';
import { Response } from 'express';
import { MasterLoyaltyFieldInterceptor } from '../../multi-language/interceptors/masters/master-loyalty-field.interceptor';

export class LoyaltyGuestFieldControllers {
    private loyaltyGuestFields: LoyaltyGuestFields;
    constructor() {
        this.loyaltyGuestFields = new LoyaltyGuestFields();
    }
    public async getLoyaltyGuestFields(req: CustomRequest, res: Response) {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let serRes = await this.loyaltyGuestFields.getLoyaltyGuestFields();
            serRes = await MasterLoyaltyFieldInterceptor.intercept(serRes as any, locale);

            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async createLoyaltyGuestFields(req: CustomRequest, res: Response) {
        try {
            const fields = req.body.fields;
            if (!fields) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Fields are required to create Loyalty Guest Fields'
                        )
                    );
            }
            const serRes =
                await this.loyaltyGuestFields.createLoyaltyGuestFields(fields);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }

    public async deleteLoyaltyGuestFields(req: CustomRequest, res: Response) {
        try {
            const fields = req.params.id;
            if (!fields) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Fields are required to delete Loyalty Guest Fields'
                        )
                    );
            }
            const serRes =
                await this.loyaltyGuestFields.deleteLoyaltyGuestFields(fields);
            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
}
