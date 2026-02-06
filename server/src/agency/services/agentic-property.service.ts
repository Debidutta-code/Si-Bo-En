import { count } from "console";
import { successResponse, errorResponse,IPaginatedResponse, paginatedSuccessResponse} from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { AgenticPropertyRepository,AgencyRepository } from "../repository"
import { ICAgenticProperty } from "../types";

export class AgenticPropertyService {
    private agenticPropertyRepository: AgenticPropertyRepository;
    private agencyRepository: AgencyRepository;

    constructor() {
        this.agenticPropertyRepository = new AgenticPropertyRepository();
        this.agencyRepository = new AgencyRepository(); 
    }
    public async createAgenticProperty(data: ICAgenticProperty):Promise<IApiResponse>{
        try {
            const agency=await this.agencyRepository.getAgencyById(data.agencyId);
            if(!agency){
                return errorResponse("failed to create agentic properties", "Agency not found");
            }
            if(agency.isDeleted){
                return errorResponse("failed to create agentic properties", "Agency is deleted");
            }
            const isAlreadyExists=await this.agenticPropertyRepository.getAgenticPropertyByProperty(data.agencyId,data.propertyId);
            if(isAlreadyExists && isAlreadyExists.isDeleted){
                const [result]=await Promise.all([
                    this.agenticPropertyRepository.recoverDeletedAgenticProperty(isAlreadyExists.id),
                    this.agenticPropertyRepository.connectProperty(data.agencyId,isAlreadyExists.id)
                ])
            }
            if(isAlreadyExists&&!isAlreadyExists.isDeleted){
                return errorResponse("Property already connected to this agency", "Agentic property already exists",isAlreadyExists);
            }

            const agenticProperty = await this.agenticPropertyRepository.createAgenticProperty(data);
            return successResponse("Agentic property created successfully", agenticProperty);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("failed to create agentic properties", error.message);
            }
            return errorResponse("failed to create agentic properties");
        }
    }
    public async deleteAgenticProperty(id: string):Promise<IApiResponse>{
        try {
            const agenticProperty = await this.agenticPropertyRepository.deleteAgenticProperty(id);
            if (!agenticProperty) {
                return errorResponse("failed to delete agentic property", "Agentic property not found");
            }
            return successResponse("Agentic property deleted successfully", agenticProperty);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to delete agentic property", error.message);
            }
            return errorResponse("failed to delete agentic property");
        }
    }
    public async getAgenticPropertyDetails(id: string): Promise<IApiResponse> {
        try {
            const agenticProperty = await this.agenticPropertyRepository.getAgenticPropertyById(id);
            if (!agenticProperty) {
                return errorResponse("failed to get agentic property details", "Agentic property not found");
            }
            return successResponse("Agentic property details retrieved successfully", agenticProperty);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to get agentic property details", error.message);
            }
            return errorResponse("failed to get agentic property details");
        }
    }
    public async getReservationsByAgents({agencyId, propertyId, skip = 0, take = 10}: {agencyId: string, propertyId: string, skip?: number, take?: number}): Promise<IApiResponse> {
        try {
            const [reservations,count] = await Promise.all([
                this.agenticPropertyRepository.getReservationsByAgents(agencyId, propertyId, skip, take),
                this.agenticPropertyRepository.countAllReservations(agencyId, propertyId)
            ]);
            if (!reservations) {
                return errorResponse("failed to get reservations", "No reservations found");
            }
            return paginatedSuccessResponse("Reservations retrieved successfully",  reservations, 
                {
                    currentPage: Math.ceil(skip / take),
                    totalPages: Math.ceil(count / take),
                    totalCount: count,
                    limit: take,
                    hasNextPage: skip + take < count,
                    hasPrevPage: skip > 0
                });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to get reservations", error.message);
            }
            return errorResponse("failed to get reservations");
        }
    }
    public async getAvailablePropertiesForAgents(agencyId: string): Promise<IApiResponse> {
        try {
            const properties = await this.agenticPropertyRepository.getPropertiesForAgent(agencyId);
            if (!properties) {
                return errorResponse("failed to get available properties", "No available properties found");
            }
            return successResponse("Available properties retrieved successfully", properties);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to get available properties", error.message);
            }
            return errorResponse("failed to get available properties");
        }
    }

    public async getAgenciesByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const agencies = await this.agenticPropertyRepository.getAgenciesByPropertyId(propertyId);
            return successResponse("Agencies retrieved successfully", agencies);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to get agencies for property", error.message);
            }
            return errorResponse("Failed to get agencies for property");
        }
    }
}

