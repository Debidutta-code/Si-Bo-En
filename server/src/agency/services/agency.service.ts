import {
    successResponse,
    errorResponse,
    paginatedSuccessResponse,
} from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { AgencyRepository, AgenticPropertyRepository } from '../repository';
import { ICAgency } from '../types';
export class AgencyService {
    private agencyRepository: AgencyRepository;
    // private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agencyRepository = new AgencyRepository();
        // this.agenticPropertyRepository = new AgenticPropertyRepository();
    }
    public async getAgencies(
        page: number,
        limit: number
    ): Promise<IApiResponse> {
        try {
            const skip = (page - 1) * limit;
            const [agencies, totalCount] = await Promise.all([
                this.agencyRepository.getAgencies(skip, limit),
                this.agencyRepository.getAgencyCount(),
            ]);
            return paginatedSuccessResponse(
                'Agencies retrieved successfully',
                agencies,
                {
                    currentPage: page,
                    hasNextPage: page * limit < totalCount,
                    hasPrevPage: page > 1,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to retrieve agencies',
                    error.message
                );
            }
            return errorResponse('failed to retrieve agencies');
        }
    }
    public async createAgency(data: ICAgency): Promise<IApiResponse> {
        try {
            const isAlreadyExists =
                await this.agencyRepository.getAgencyByAgencyCreds(
                    data.agencyEmail,
                    data.taxNo,
                    data.agencyName
                );
            if (isAlreadyExists) {
                return errorResponse(
                    'Agency with the same credentials already exists',
                    'agency exists with same email, or tax or name'
                );
            }
            const agency = await this.agencyRepository.createAgency(data);
            return successResponse('Agency created successfully', agency);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to create agency', error.message);
            }
            return errorResponse('failed to create agency');
        }
    }
    public async updateAgency(
        agencyId: string,
        data: ICAgency
    ): Promise<IApiResponse> {
        try {
            const existingAgency =
                await this.agencyRepository.getAgencyById(agencyId);
            if (!existingAgency) {
                return errorResponse('Agency not found');
            }
            const isAlreadyExists =
                await this.agencyRepository.getAgencyByAgencyCreds(
                    data.agencyEmail,
                    data.taxNo,
                    data.agencyName
                );
            if (!isAlreadyExists) {
                return errorResponse('Agency not found');
            }
            const agency = await this.agencyRepository.updateAgency(
                agencyId,
                data
            );
            return successResponse('Agency updated successfully', agency);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to update agency', error.message);
            }
            return errorResponse('failed to update agency');
        }
    }
    public async deleteAgency(agencyId: string): Promise<IApiResponse> {
        try {
            const existingAgency =
                await this.agencyRepository.getAgencyById(agencyId);
            if (!existingAgency) {
                return errorResponse('Agency not found');
            }
            const agency = await this.agencyRepository.deleteAgency(agencyId);
            return successResponse('Agency deleted successfully', agency);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to delete agency', error.message);
            }
            return errorResponse('failed to delete agency');
        }
    }
    public async getAgencyById(agencyId: string): Promise<IApiResponse> {
        try {
            const agency = await this.agencyRepository.getAgencyById(agencyId);
            if (!agency) {
                return errorResponse('Agency not found');
            }
            return successResponse('Agency retrieved successfully', agency);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to get agency', error.message);
            }
            return errorResponse('failed to get agency');
        }
    }
    public async getReservationsForAgency(
        agencyId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<IApiResponse> {
        try {
            const reservations =
                await this.agencyRepository.getReservationsByAgencyId(
                    agencyId,
                    (page - 1) * limit,
                    limit
                );
            return successResponse(
                'Reservations retrieved successfully',
                reservations
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to get reservations',
                    error.message
                );
            }
            return errorResponse('failed to get reservations');
        }
    }
}
