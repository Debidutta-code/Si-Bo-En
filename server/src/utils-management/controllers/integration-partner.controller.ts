import { errorResponse } from '../../utils/return';
import { CustomRequest } from '../../utils/customRequest';
import { Response } from 'express';
import {
    IntegrationPartnerFieldService,
    IntegrationPartnerService,
    IntegrationPartnerUrlFieldsService,
} from '../services';
import {
    ICMasterIntegrationIntegrationFields,
    ICMasterIntegrationUrlFields,
    ICMasterIntegrationsS,
} from '../types';
import { MasterIntegrationInterceptor } from '../../multi-language/interceptors/masters/master-integration.interceptor';

export class IntegrationPartnerController {
    private integrationPartnerService: IntegrationPartnerService;

    constructor() {
        this.integrationPartnerService = new IntegrationPartnerService();
    }
    public async createPartner(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICMasterIntegrationsS = req.body;
            if (!data.name && !data.type) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Missing required fields: name and type')
                    );
            }
            if (!data.urlFileds || !data.requiredFields) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields: urlFileds and requiredFields'
                        )
                    );
            }
            if (!data.urlFileds.length || !data.requiredFields.length) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'urlFileds and requiredFields must be non-empty arrays'
                        )
                    );
            }
            const serRes =
                await this.integrationPartnerService.createPartnerService(data);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create partner integration',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create partner integration'));
        }
    }
    public async getAllPartners(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let serRes = await this.integrationPartnerService.getAllPartnerService();
            serRes = await MasterIntegrationInterceptor.intercept(serRes as any, locale);

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve partner integrations',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to retrieve partner integrations'));
        }
    }
    public async deletePartner(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const partnerId = req.params.id;
            if (!partnerId) {
                return res
                    .status(400)
                    .json(errorResponse('Missing required field: id'));
            }
            const serRes =
                await this.integrationPartnerService.deleteIntegrations(
                    partnerId
                );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete partner integration',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete partner integration'));
        }
    }
}

export class IntegrationPartnerRequiredFieldsController {
    private integrationPartnerFieldService: IntegrationPartnerFieldService;

    constructor() {
        this.integrationPartnerFieldService =
            new IntegrationPartnerFieldService();
    }
    public async createFields(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const masterId = req.params.masterId;
            const data: ICMasterIntegrationIntegrationFields[] = req.body;
            if (!data.length) {
                return res
                    .status(400)
                    .json(errorResponse('Missing required field: name'));
            }
            const serRes =
                await this.integrationPartnerFieldService.createField(
                    data,
                    masterId
                );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create integration partner fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to create integration partner fields')
                );
        }
    }
    public async deleteField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const fieldId: string = req.params.id;
            if (!fieldId) {
                return res
                    .status(400)
                    .json(errorResponse('Missing required field: id'));
            }
            const serRes =
                await this.integrationPartnerFieldService.deleteField(fieldId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete integration partner fields',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to delete integration partner fields')
                );
        }
    }
}

export class IntegrationPartnerUrlFieldsController {
    private masterIntegrationUrlField: IntegrationPartnerUrlFieldsService;
    constructor() {
        this.masterIntegrationUrlField =
            new IntegrationPartnerUrlFieldsService();
    }
    public async createField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {name,url,masterIntegrationId} = req.body;
            if(!name || !url || !masterIntegrationId){
                return res
                    .status(400)
                    .json(errorResponse('Missing required fields'));
            }
            const createdField =
                await this.masterIntegrationUrlField.createField(
                    [{name,url}],
                    masterIntegrationId
                );
            return res
                .status(createdField.success ? 200 : 400)
                .json(createdField);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create master Property integration URL field',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to create master Property integration URL field'
                    )
                );
        }
    }
    public async deleteField(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const fieldId: string = req.params.id;
            if (!fieldId) {
                return res
                    .status(400)
                    .json(errorResponse('Missing required field: id'));
            }
            const deleted =
                await this.masterIntegrationUrlField.deleteField(fieldId);
            if (deleted) {
                return res.status(200).json(deleted);
            }
            return res
                .status(400)
                .json(
                    errorResponse(
                        'Failed to delete master Property integration URL field'
                    )
                );
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete master Property integration URL field',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to delete master Property integration URL field'
                    )
                );
        }
    }
}
