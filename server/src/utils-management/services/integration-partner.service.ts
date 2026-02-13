import {
    ICMasterIntegrationIntegrationFields,
    ICMasterIntegrationUrlFields,
    ICMasterIntegrationsS,
} from "../types";
import {
    IMasterIntegrationFieldsRepository,
    IMasterIntegrationUrlFieldRepository,
    InragrationManagement
} from "../repository";
import { IApiResponse } from "../../utils/return.types";
import { successResponse, errorResponse } from "../../utils/return";

export class IntegrationPartnerService {
    private masterIntegrationFieldRepository: IMasterIntegrationFieldsRepository;
    private masterIntegrationUrlFieldRepository: IMasterIntegrationUrlFieldRepository;
    private integrationManagement: InragrationManagement;
    constructor() {
        this.integrationManagement = new InragrationManagement();
        this.masterIntegrationFieldRepository = new IMasterIntegrationFieldsRepository();
        this.masterIntegrationUrlFieldRepository = new IMasterIntegrationUrlFieldRepository();
    }
    public async createPartnerService(data: ICMasterIntegrationsS): Promise<IApiResponse> {
        try {
            const { name, type, urlFileds, requiredFields } = data;
            const isExists = await this.integrationManagement.getByName(name, type);
            if (isExists) {
                return errorResponse("Master Property integration already exists with the same name and type");
            }
            const createdIntegration = await this.integrationManagement.createMasterIntegrations({
                name,
                type,

            });
            await Promise.all([
                this.masterIntegrationUrlFieldRepository.createMasterIntegrationUrlFields(urlFileds, createdIntegration.id),
                this.masterIntegrationFieldRepository.createMasterIntegrationFields(requiredFields, createdIntegration.id)
            ]);
            return successResponse("Master Property integration created successfully", createdIntegration);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create master Property integration ", error.message)
            }
            return errorResponse("Failed to create master Property integration")
        }
    }
    public async getAllPartnerService(): Promise<IApiResponse> {
        try {
            const integrations = await this.integrationManagement.getAllMasterIntegrations();
            return successResponse("Fetched all partner services", integrations);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch all partner services", error.message);
            }
            return errorResponse("Failed to fetch all partner services");
        }
    }
    public async deleteIntegrations(id: string): Promise<IApiResponse> {
        try {
            const deleted = await this.integrationManagement.deleteMasterIntegrations(id);
            if (deleted) {
                return successResponse("Master Property integration deleted successfully");
            }
            return errorResponse("Failed to delete master Property integration");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete master Property integration", error.message);
            }
            return errorResponse("Failed to delete master Property integration");
        }
    }
}

export class IntegrationPartnerFieldService {
    private masterIntegrationFieldRepository: IMasterIntegrationFieldsRepository;
    constructor() {
        this.masterIntegrationFieldRepository = new IMasterIntegrationFieldsRepository();
    }
    public async createField(data: ICMasterIntegrationIntegrationFields[], masterIntegrationId: string): Promise<IApiResponse> {
        try {
            const createdField = await this.masterIntegrationFieldRepository.createMasterIntegrationFields(data, masterIntegrationId);
            return successResponse("Master Property integration field created successfully", createdField);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create master Property integration field", error.message);
            }
            return errorResponse("Failed to create master Property integration field");
        }
    }
    public async deleteField(id: string): Promise<IApiResponse> {
        try {
            const deleted = await this.masterIntegrationFieldRepository.deleteMasterIntegrationField(id);
            if (deleted) {
                return successResponse("Master Property integration field deleted successfully");
            }
            return errorResponse("Failed to delete master Property integration field");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete master Property integration field", error.message);
            }
            return errorResponse("Failed to delete master Property integration field");
        }
    }
}
export class IntegrationPartnerUrlFieldsService{
    private masterIntegrationUrlFieldRepository: IMasterIntegrationUrlFieldRepository;
    constructor() {
        this.masterIntegrationUrlFieldRepository = new IMasterIntegrationUrlFieldRepository();
    }
    public async createField(data: ICMasterIntegrationUrlFields[], masterIntegrationId: string): Promise<IApiResponse> {
        try {
            const createdField = await this.masterIntegrationUrlFieldRepository.createMasterIntegrationUrlFields(data, masterIntegrationId);
            return successResponse("Master Property integration URL field created successfully", createdField);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create master Property integration URL field", error.message);
            }
            return errorResponse("Failed to create master Property integration URL field");
        }
    }
    public async deleteField(id: string): Promise<IApiResponse> {
        try {
            const deleted = await this.masterIntegrationUrlFieldRepository.deleteMasterIntegrationFields(id);
            if (deleted) {
                return successResponse("Master Property integration URL field deleted successfully");
            }
            return errorResponse("Failed to delete master Property integration URL field");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete master Property integration URL field", error.message);
            }
            return errorResponse("Failed to delete master Property integration URL field");
        }
    }
}