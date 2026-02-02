import { successResponse, errorResponse, paginatedSuccessResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import {
    AgencyRepository,
    AgenticPropertyRepository,
    AgencyApplicationRepository,
    AgentRepository,
    AgenticRoomRepository
} from "../repository";
import { AgencyApplicationStatus, fAgencyApplicationStatus, IAgencyApplication, ICAgencyApplication } from "../types";

export class AgencyApplicationService {
    private agencyRepository: AgencyRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;
    private agencyApplicationRepository: AgencyApplicationRepository;
    private agentRepository: AgentRepository;
    private agenticRoomRepository: AgenticRoomRepository;

    constructor() {
        this.agencyRepository = new AgencyRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
        this.agencyApplicationRepository = new AgencyApplicationRepository();
        this.agentRepository = new AgentRepository();
        this.agenticRoomRepository = new AgenticRoomRepository();
    }
    public async createAgencyApplication(data: ICAgencyApplication): Promise<IApiResponse> {
        try {
            const [existingApplication,
                lastAppliedForm,
                agent,
                existingApplicationByTaxNo,
                existingApplicationByName] = await Promise.all([
                    this.agencyApplicationRepository.getApplicationsByEmail(data.agencyEmail),
                    this.agencyApplicationRepository.lastAppliedCountByEmail(data.agencyEmail),
                    this.agentRepository.getAgentByEmail(data.applicantEmail),
                    this.agencyApplicationRepository.getAgentApplicationsByTaxNo(data.taxNo),
                    this.agencyApplicationRepository.getAgentApplicationsByName(data.agencyName)
                ])
            if (existingApplication && existingApplication.status === "approved") {
                return successResponse("Agency application with this email is already approved", existingApplication);
            }
            if (agent) {
                return errorResponse("An agent with this email already exists");
            }
            if (existingApplicationByTaxNo && existingApplicationByTaxNo.status === "approved") {
                return successResponse("Agency application with this tax number is exists", existingApplicationByTaxNo);
            }
            if (existingApplicationByName && existingApplicationByName.status === "approved") {
                return successResponse("Agency application with this name is exists", existingApplicationByName);
            }
            if (lastAppliedForm) {
                const [updateCount, updateStatus] = await Promise.all([
                    this.agencyApplicationRepository.updateCount(data.agencyEmail),
                    this.agencyApplicationRepository.updateApplicationStatus(data.agencyEmail, "pending")
                ]);
                return successResponse("Agency application updated successfully", { updateCount, updateStatus });
            }
            else {
                const application = await this.agencyApplicationRepository.createApplication(data);
                return successResponse("Agency application created successfully", application);
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to create agency application", error.message);
            }
            return errorResponse("failed to create agency application");
        }
    }
    public async updateApplicationStatus(applicationId: string, status: AgencyApplicationStatus, rejectionReason?: string): Promise<IApiResponse> {
        try {
            if (status == "rejected" && !rejectionReason) {
                return errorResponse("Rejection reason is required", "failed to reject application");
            }
            const existingApplication = await this.agencyApplicationRepository.getApplicationById(applicationId);
            if (!existingApplication) {
                return errorResponse("Agency application not found");
            }
            if (existingApplication.status != "pending") {
                return errorResponse("can only approve pending applications", `failed to approve application which is already ${existingApplication.status}`);
            }

            if (status == "approved") {
                const updateRes = await this.approveApplication(existingApplication);
                return updateRes;
            }
            else {

                const cancelRes = await this.rejectApplication(existingApplication.applicantEmail, rejectionReason!);
                return cancelRes;
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to update agency application status", error.message);
            }
            return errorResponse("failed to update agency application status");
        }

    }
    private async approveApplication(existingApplication: IAgencyApplication): Promise<IApiResponse> {
        try {
            //  Create the agency 
            const newAgency = await this.agencyRepository.createAgency({
                agencyName: existingApplication.agencyName,
                agencyType: existingApplication.agencyType,
                agencyEmail: existingApplication.agencyEmail,
                contactNo: existingApplication.contactNo,
                taxNo: existingApplication.taxNo,
                commissionType: existingApplication.commissionType,
                commissionValue: existingApplication.commissionValue,
                commissionCurrency: existingApplication.commissionCurrency,
                iataCode: existingApplication.iataCode,
                address: existingApplication.address
            });

            if (!newAgency) {
                return errorResponse("Failed to create agency");
            }

            //  Create the initial Agent
            const createdInitialAgent = await this.agentRepository.createAgent({
                agencyId: newAgency.id,
                agentName: existingApplication.applicantName,
                agentEmail: existingApplication.applicantEmail,
                agentPhone: existingApplication.applicantPhone,
                agentPassword: existingApplication.applicantPassword
            });

            if (!createdInitialAgent) {
                return errorResponse("Failed to create initial agent");
            }

            // gt available b2b propertie
            const availableProperties = await this.agenticPropertyRepository.getPropertiesForAgent(newAgency.id);
            
            if (availableProperties && availableProperties.length > 0) {
                //  Create agentic properties 
                const agenticProperties = await this.agenticPropertyRepository.createAgenticProperties(newAgency.id, availableProperties);
                console.log("Agentic properties created:", agenticProperties.length);

                // Step 5: For each agentic property, add all available rooms
                if (agenticProperties && agenticProperties.length > 0) {
                    await Promise.all(agenticProperties.map(async (agenticProperty: any) => {
                        try {
                            const allAvailableRoomsForAgency = await this.agenticRoomRepository.getRoomsForAgency(
                                agenticProperty.id, 
                                newAgency.id
                            );
                            
                            if (allAvailableRoomsForAgency && allAvailableRoomsForAgency.length > 0) {
                                console.log(`Adding ${allAvailableRoomsForAgency.length} rooms for property ${agenticProperty.propertyName}`);
                                await this.agenticRoomRepository.addRoomsForAgenticProperty(
                                    agenticProperty.id, 
                                    allAvailableRoomsForAgency
                                );
                            } else {
                                console.log(`No rooms found for property ${agenticProperty.propertyName}`);
                            }
                        } catch (roomError) {
                            console.error(`Failed to add rooms for property ${agenticProperty.id}:`, roomError);
                        }
                    }));
                }
            } else {
                console.log("No B2B properties available for this agency");
            }

            //  Update application status to approved
            const [updatedApplication, countIncrement] = await Promise.all([
                this.agencyApplicationRepository.updateApplicationStatus(existingApplication.applicantEmail, "approved"),
                this.agencyApplicationRepository.updateCount(existingApplication.applicantEmail)
            ]);

            return successResponse("Agency application approved successfully", { 
                agency: newAgency,
                agent: createdInitialAgent,
                propertiesConnected: availableProperties?.length || 0,
                updatedApplication, 
                countIncrement 
            });
        } catch (error) {
            console.error("Error approving application:", error);
            if (error instanceof Error) {
                return errorResponse("Failed to approve agency application", error.message);
            }
            return errorResponse("Failed to approve agency application");
        }
    }
    private async rejectApplication(email: string, reason: string): Promise<IApiResponse> {
        try {
            const [updatedApplication, countIncrement] = await Promise.all([
                this.agencyApplicationRepository.updateApplicationStatus(email, "rejected", reason),
                this.agencyApplicationRepository.updateCount(email)
            ]);
            return successResponse("Agency application rejected successfully", { updatedApplication, countIncrement });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to reject agency application", error.message);
            }
            return errorResponse("failed to reject agency application");
        }

    }
    public async getAgencyApplications(status: fAgencyApplicationStatus="all", page: number=1, limit: number=10): Promise<IApiResponse> {
        try {
            const [applications, totalCount] = await Promise.all([
                this.agencyApplicationRepository.getApplications(status, page, limit),
                this.agencyApplicationRepository.getCount()
            ]);
            return paginatedSuccessResponse("Agency applications retrieved successfully", applications, {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNextPage: page < (totalCount / limit),
                hasPrevPage: page > 1,
                limit
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to retrieve agency applications", error.message);
            }
            return errorResponse("failed to retrieve agency applications");
        }
    }
    public async getAgencyApplicationByName(name: string): Promise<IApiResponse> {
        try {
            const application = await this.agencyApplicationRepository.getAgentApplicationsByName(name);
            if (!application) {
                return errorResponse("Agency application not found");
            }
            return successResponse("Agency application retrieved successfully", application);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("failed to retrieve agency application", error.message);
            }
            return errorResponse("failed to retrieve agency application");
        }
    }
}