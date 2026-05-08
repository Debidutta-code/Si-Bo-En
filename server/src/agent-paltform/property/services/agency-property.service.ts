import { successResponse, errorResponse } from '../../../utils';
import { IApiResponse } from '../../../utils';
import { AgenticPropertyRepository } from '../repository';

export class AgencyPropertyService {
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }

    public async getAgenticProperties(agencyId: string): Promise<IApiResponse> {
        try {
            const agency =
                await this.agenticPropertyRepository.getAgencyById(agencyId);
            if (!agency) {
                return errorResponse(
                    'Agency not found',
                    'Agency does not exist or deleted'
                );
            }
            const properties =
                await this.agenticPropertyRepository.getAgenticProperties(
                    agencyId
                );
            return successResponse(
                'Properties fetched successfully for Agencies',
                properties
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve agentic properties',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve agentic properties');
        }
    }

    // public async getAgenticPropertyById(agenticPropertyId: string): Promise<IApiResponse> {
    //     try {
    //         const property = await this.agenticPropertyRepository.getAgenticPropertyById(agenticPropertyId);
    //         if (!property) {
    //             return errorResponse("Agentic Property not found", "Property does not exist or deleted");
    //         }
    //         return successResponse("Agentic Property fetched successfully", property);
    //     } catch (error) {
    //         if(error instanceof Error){
    //             return errorResponse("Failed to retrieve agentic property", error.message);
    //         }
    //         return errorResponse("Failed to retrieve agentic property");
    //     }
    // }
}
