import { prisma } from "../../config";
import { IReservation } from "../../pms/frontoffice/reservation/types";
import { IAgency, IAgencyWD, ICAgency } from "../types";
export class AgencyRepository {
    public async createAgency(data: ICAgency): Promise<IAgency> {
        try {

            return await prisma.agency.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create agency`);
        }
    }
    public async getAgencies(skip: number = 0, take: number = 10): Promise<IAgency[]> {
        try {
            return await prisma.agency.findMany({
                where: {
                    isDeleted: false
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get agencies`);
        }
    }
    public async getAgencyCount(): Promise<number> {
        try {
            return await prisma.agency.count({
                where: {
                    isDeleted: false
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agency count`);
        }
    }
    public async getAgencyById(id: string): Promise<IAgencyWD | null> {
        try {

            return await prisma.agency.findFirst({
                where: { 
                    id,
                    isDeleted: false 
                },
                include: {
                    AgenticProperties: {
                        where: {
                            isDeleted: false
                        }
                    },
                    Agents: {
                        where: {
                            isDeleted: false
                        }
                    },
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agency by ID: ${id}`);
        }
    }

    public async updateAgency(id: string, data: ICAgency): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id },
                data
            });
        } catch (error) {
            throw new Error(`Failed to update agency: ${id}`);
        }
    }

    public async deleteAgency(id: string): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete agency: ${id}`);
        }
    }
    public async getReservationsByAgencyId(agencyId: string, skip: number = 0, take: number = 10): Promise<IReservation[]> {
        try {
            return await prisma.reservation.findMany({
                where: { agencyId },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agency ID: ${agencyId}`);
        }
    }
    public async getAgencyByAgencyCreds(email: string, taxNo: string, name: string): Promise<IAgency | null> {
        try {
            return await prisma.agency.findFirst({
                where: {
                    OR: [
                        { agencyEmail: email },
                        { taxNo: email },
                        { agencyName: name }
                    ]
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agency by email: ${email}`);
        }
    }

}