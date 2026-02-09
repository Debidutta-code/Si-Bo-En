import { successResponse, errorResponse } from "../../../utils/return";
import { IApiResponse } from "../../../utils/return.types";
import { AgentDashboardRepository } from "../repository";
import { IAgentDashboardFilters } from "../types";

export class AgentDashboardService {
    private dashboardRepository: AgentDashboardRepository;

    constructor() {
        this.dashboardRepository = new AgentDashboardRepository();
    }

    public async getAgencyAnalytics(
        agencyId: string,
        filters?: IAgentDashboardFilters
    ): Promise<IApiResponse> {
        try {
            if (!agencyId) {
                return errorResponse("Agency ID is required", "Missing agency ID");
            }

            const result = await this.dashboardRepository.getAgencyAnalytics(agencyId, filters);

            if (!result.success) {
                return errorResponse(result.message || "Failed to fetch analytics");
            }

            return successResponse("Analytics fetched successfully", result.data);
        } catch (error) {
            console.error("Service error:", error);
            return errorResponse(
                "Failed to fetch analytics",
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    }

    public async getAgencyProperties(agencyId: string): Promise<IApiResponse> {
        try {
            if (!agencyId) {
                return errorResponse("Agency ID is required", "Missing agency ID");
            }

            const result = await this.dashboardRepository.getAgencyProperties(agencyId);

            if (!result.success) {
                return errorResponse(result.message || "Failed to fetch properties");
            }

            return successResponse("Properties fetched successfully", result.data);
        } catch (error) {
            return errorResponse(
                "Failed to fetch properties",
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    }
}
