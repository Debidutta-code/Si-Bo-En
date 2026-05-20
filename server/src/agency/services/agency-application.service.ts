import { createHash } from '../../auth/utills/bcryptHelper';
import { AgencyEmailService } from '../../sms-email-service/service/agency-email.service';
import {
    successResponse,
    errorResponse,
    paginatedSuccessResponse,
} from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import {
    AgencyRepository,
    AgenticPropertyRepository,
    AgencyApplicationRepository,
    AgentRepository,
    AgenticRoomRepository,
} from '../repository';
import {
    AgencyApplicationStatus,
    fAgencyApplicationStatus,
    IAgencyApplication,
    ICAgencyApplication,
} from '../types';

export class AgencyApplicationService {
    private agencyRepository: AgencyRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;
    private agencyApplicationRepository: AgencyApplicationRepository;
    private agentRepository: AgentRepository;
    private agenticRoomRepository: AgenticRoomRepository;
    private agencyEmailService: AgencyEmailService;

    constructor() {
        this.agencyRepository = new AgencyRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
        this.agencyApplicationRepository = new AgencyApplicationRepository();
        this.agentRepository = new AgentRepository();
        this.agenticRoomRepository = new AgenticRoomRepository();
        this.agencyEmailService = new AgencyEmailService();
    }

    public async createAgencyApplication(
        data: ICAgencyApplication
    ): Promise<IApiResponse> {
        try {
            // console.log(data);
            const [
                existingApplication,
                lastAppliedForm,
                agent,
                existingApplicationByTaxNo,
                existingApplicationByName,
            ] = await Promise.all([
                this.agencyApplicationRepository.getApplicationsByEmail(data.agencyEmail),
                this.agencyApplicationRepository.lastAppliedCountByEmail(data.agencyEmail),
                this.agentRepository.getAgentByEmail(data.applicantEmail),
                this.agencyApplicationRepository.getAgentApplicationsByTaxNo(data.taxNo),
                this.agencyApplicationRepository.getAgentApplicationsByName(data.agencyName),
            ]);

            console.log('exist', existingApplication);
            console.log('lastAppliedForm', lastAppliedForm);
            console.log('agent', agent);
            console.log('existingApplicationByTaxNo', existingApplicationByTaxNo);
            console.log('existingApplicationByName', existingApplicationByName);

            if (existingApplication && existingApplication.status === 'approved') {
                return successResponse(
                    'Agency application with this email is already approved',
                    existingApplication
                );
            }
            if (agent) {
                return errorResponse('An agent with this email already exists');
            }
            if (existingApplicationByTaxNo && existingApplicationByTaxNo.status === 'approved') {
                return successResponse(
                    'Agency application with this tax number is exists',
                    existingApplicationByTaxNo
                );
            }
            if (existingApplicationByName && existingApplicationByName.status === 'approved') {
                return successResponse(
                    'Agency application with this name is exists',
                    existingApplicationByName
                );
            }

            if (lastAppliedForm) {
                // console.log('lastAppliedForm', lastAppliedForm);
                const [updateCount, updateStatus] = await Promise.all([
                    this.agencyApplicationRepository.updateCount(data.agencyEmail),
                    this.agencyApplicationRepository.updateApplication(data, 'pending'),
                ]);

                // existingApplication is the full record — it always exists when lastAppliedForm > 0
                this.agencyEmailService
                    .applicationSubmitted({ ...data, id: existingApplication!.id })
                    .catch((err) =>
                        console.error('Email failed [applicationSubmitted - resubmission]:', err)
                    );

                return successResponse('Agency application updated successfully', {
                    updateCount,
                    updateStatus,
                });
            }

            const application =
                await this.agencyApplicationRepository.createApplication(data);

            this.agencyEmailService
                .applicationSubmitted({ ...data, id: application.id })
                .catch((err) =>
                    console.error('Email failed [applicationSubmitted - new]:', err)
                );

            return successResponse('Agency application created successfully', application);

        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to create agency application', error.message);
            }
            return errorResponse('failed to create agency application');
        }
    }

    public async updateApplicationStatus(
        applicationId: string,
        status: AgencyApplicationStatus,
        rejectionReason?: string
    ): Promise<IApiResponse> {
        try {
            if (status == 'rejected' && !rejectionReason) {
                return errorResponse(
                    'Rejection reason is required',
                    'failed to reject application'
                );
            }
            const existingApplication =
                await this.agencyApplicationRepository.getApplicationById(applicationId);
            if (!existingApplication) {
                return errorResponse('Agency application not found');
            }
            if (existingApplication.status != 'pending') {
                return errorResponse(
                    'can only approve pending applications',
                    `failed to approve application which is already ${existingApplication.status}`
                );
            }

            if (status == 'approved') {
                return await this.approveApplication(existingApplication);
            } else {
                return await this.rejectApplication(existingApplication, rejectionReason!);
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to update agency application status', error.message);
            }
            return errorResponse('failed to update agency application status');
        }
    }

    private async approveApplication(
        existingApplication: IAgencyApplication
    ): Promise<IApiResponse> {
        try {
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
                address: existingApplication.address,
            });

            if (!newAgency) {
                return errorResponse('Failed to create agency');
            }

            const hashedPassword = await createHash(existingApplication.applicantPassword);
            const createdInitialAgent = await this.agentRepository.createAgent({
                agencyId: newAgency.id,
                agentName: existingApplication.applicantName,
                agentEmail: existingApplication.applicantEmail,
                agentPhone: existingApplication.applicantPhone,
                agentPassword: hashedPassword,
            });

            if (!createdInitialAgent) {
                return errorResponse('Failed to create initial agent');
            }

            const availableProperties =
                await this.agenticPropertyRepository.getPropertiesForAgent(newAgency.id);

            if (availableProperties && availableProperties.length > 0) {
                const agenticProperties =
                    await this.agenticPropertyRepository.createAgenticProperties(
                        newAgency.id,
                        availableProperties
                    );

                if (agenticProperties && agenticProperties.length > 0) {
                    await Promise.all(
                        agenticProperties.map(async (agenticProperty: any) => {
                            try {
                                const allAvailableRoomsForAgency =
                                    await this.agenticRoomRepository.getRoomsForAgency(
                                        agenticProperty.id,
                                        newAgency.id
                                    );
                                if (allAvailableRoomsForAgency && allAvailableRoomsForAgency.length > 0) {
                                    await this.agenticRoomRepository.addRoomsForAgenticProperty(
                                        agenticProperty.id,
                                        allAvailableRoomsForAgency
                                    );
                                }
                            } catch (roomError) {
                                console.error(
                                    `Failed to add rooms for property ${agenticProperty.id}:`,
                                    roomError
                                );
                            }
                        })
                    );
                }
            }

            const updatedApplication =
                await this.agencyApplicationRepository.updateApplicationStatus(
                    existingApplication.agencyEmail,
                    'approved'
                );

            // Send approval email — plain password sent before it was hashed above
            const loginUrl = process.env.AGENT_PORTAL_URL ?? 'https://bookings-revchilltech.trip-swift.ai/login';

            this.agencyEmailService
                .applicationApproved(
                    existingApplication,
                    existingApplication.applicantEmail,
                    existingApplication.applicantPassword, // plain text, pre-hash
                    loginUrl
                )
                .catch((err) =>
                    console.error('Email failed [applicationApproved]:', err)
                );

            return successResponse('Agency application approved successfully', {
                agency: newAgency,
                agent: createdInitialAgent,
                propertiesConnected: availableProperties?.length || 0,
                updatedApplication,
            });
        } catch (error) {
            console.error('Error approving application:', error);
            if (error instanceof Error) {
                return errorResponse('Failed to approve agency application', error.message);
            }
            return errorResponse('Failed to approve agency application');
        }
    }

    private async rejectApplication(
        application: IAgencyApplication, // full object now so email has all fields
        reason: string
    ): Promise<IApiResponse> {
        try {
            const updatedApplication =
                await this.agencyApplicationRepository.updateApplicationStatus(
                    application.agencyEmail,
                    'rejected',
                    reason
                );

            this.agencyEmailService
                .applicationRejected(application, reason)
                .catch((err) =>
                    console.error('Email failed [applicationRejected]:', err)
                );

            return successResponse('Agency application rejected successfully', {
                updatedApplication,
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to reject agency application', error.message);
            }
            return errorResponse('failed to reject agency application');
        }
    }

    public async getAgencyApplications(
        status: fAgencyApplicationStatus = 'all',
        page: number = 1,
        limit: number = 10
    ): Promise<IApiResponse> {
        try {
            const skip = (page - 1) * limit;
            const [applications, totalCount] = await Promise.all([
                this.agencyApplicationRepository.getApplications(status, skip, limit),
                this.agencyApplicationRepository.getCount(),
            ]);
            return paginatedSuccessResponse(
                'Agency applications retrieved successfully',
                applications,
                {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNextPage: page < totalCount / limit,
                    hasPrevPage: page > 1,
                    limit,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to retrieve agency applications', error.message);
            }
            return errorResponse('failed to retrieve agency applications');
        }
    }

    public async getAgencyApplicationByName(name: string): Promise<IApiResponse> {
        try {
            const application =
                await this.agencyApplicationRepository.getAgentApplicationsByName(name);
            if (!application) {
                return errorResponse('Agency application not found');
            }
            return successResponse('Agency application retrieved successfully', application);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to retrieve agency application', error.message);
            }
            return errorResponse('failed to retrieve agency application');
        }
    }

    public async getAgencyApplicationById(id: string): Promise<IApiResponse> {
        try {
            const application =
                await this.agencyApplicationRepository.getApplicationById(id);
            if (!application) {
                return errorResponse('Agency application not found');
            }
            return successResponse('Agency application retrieved successfully', application);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to retrieve agency application', error.message);
            }
            return errorResponse('failed to retrieve agency application');
        }
    }
}