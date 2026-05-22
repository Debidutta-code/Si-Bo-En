import { prisma } from '../../config';
import {
    AgencyApplicationStatus,
    ICAgencyApplication,
    IAgencyApplication,
    IAgents,
    fAgencyApplicationStatus,
} from '../types';

export class AgencyApplicationRepository {
    public async createApplication(
        data: ICAgencyApplication
    ): Promise<IAgencyApplication> {
        try {
            const application = await prisma.agentApplications.create({
                data,
            });
            return application;
        } catch (error) {
            throw new Error(`Failed to create agency application`);
        }
    }
    public async getApplicationById(
        id: string
    ): Promise<IAgencyApplication | null> {
        try {
            const application = await prisma.agentApplications.findUnique({
                where: { id },
            });
            return application;
        } catch (error) {
            throw new Error(`Failed to retrieve agency application`);
        }
    }
    public async getApplicationsByEmail(
        email: string
    ): Promise<IAgencyApplication | null> {
        try {
            const applications = await prisma.agentApplications.findUnique({
                where: { agencyEmail: email },
            });
            return applications;
        } catch (error) {
            throw new Error(`Failed to retrieve agency applications by email`);
        }
    }
    public async getApplications(
        status: fAgencyApplicationStatus,
        skip: number = 0,
        take: number = 10
    ): Promise<IAgencyApplication[]> {
        try {
            const query: any = {};
            if (status && status !== 'all') {
                query.status = status;
            }
            const applications = await prisma.agentApplications.findMany({
                where: query,
                skip,
                take,
            });
            return applications;
        } catch (error) {
            throw new Error(`Failed to retrieve agency applications`);
        }
    }
    public async updateApplicationStatus(
        email: string,
        newStatus: AgencyApplicationStatus,
        reason?: string
    ): Promise<IAgencyApplication> {
        try {
            const updatedApplication = await prisma.agentApplications.update({
                where: { agencyEmail: email },
                data: { status: newStatus, rejectionReason: reason },
            });
            return updatedApplication;
        } catch (error) {
            throw new Error(`Failed to update agency application status`);
        }
    }
    public async updateApplication(
        data: ICAgencyApplication,
        newStatus: AgencyApplicationStatus,
        reason?: string
    ): Promise<IAgencyApplication> {
        try {
            const updatedApplication = await prisma.agentApplications.update({
                where: { agencyEmail: data.agencyEmail },
                data: {
                    status: newStatus,
                    rejectionReason: reason,
                    agencyName: data.agencyName,
                    agencyType: data.agencyType,
                    contactNo: data.contactNo,
                    taxNo: data.taxNo,
                    address: data.address,
                    commissionCurrency: data.commissionCurrency,
                    commissionType: data.commissionType,
                    commissionValue: data.commissionValue,
                    iataCode: data.iataCode,
                    applicantName: data.applicantName,
                    applicantPhone: data.applicantPhone,
                    applicantEmail: data.applicantEmail,
                    applicantPassword: data.applicantPassword,
                },
            });
            return updatedApplication;
        } catch (error) {
            throw new Error(`Failed to update agency application status`);
        }
    }
    public async lastAppliedCountByEmail(email: string): Promise<number> {
    try {
        const record = await prisma.agentApplications.findFirst({
            where: { agencyEmail: email },
            select: { applicationNoForThisUser: true },
        });
 
        // No prior application found — this is a first-time applicant
        if (!record) {
            return 0;
        }
 
        // Guard against null/undefined field (e.g. older rows before the column was added)
        return record.applicationNoForThisUser ?? 0;
    } catch (error) {
        // Log but don't throw — a count failure should not block application creation
        console.error('lastAppliedCountByEmail failed, defaulting to 0:', error);
        return 0;
    }
}
    public async getAgentApplicationsByTaxNo(
        taxNo: string
    ): Promise<IAgencyApplication | null> {
        try {
            return await prisma.agentApplications.findUnique({
                where: {
                    taxNo: taxNo,
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to get agent applications by tax number: ${taxNo}`
            );
        }
    }
    public async getAgentApplicationsByName(
        name: string
    ): Promise<IAgencyApplication | null> {
        try {
            return await prisma.agentApplications.findUnique({
                where: {
                    agencyName: name,
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to get agent applications by agency name: ${name}`
            );
        }
    }
    public async updateCount(email: string): Promise<void> {
        try {
            await prisma.agentApplications.update({
                where: { agencyEmail: email },
                data: { applicationNoForThisUser: { increment: 1 } },
            });
        } catch (error) {
            throw new Error(
                `Failed to update application count for email: ${email}`
            );
        }
    }
    public async getCount(): Promise<number> {
        try {
            const count = await prisma.agentApplications.count();
            return count;
        } catch (error) {
            throw new Error(`Failed to get agency application count`);
        }
    }
}
