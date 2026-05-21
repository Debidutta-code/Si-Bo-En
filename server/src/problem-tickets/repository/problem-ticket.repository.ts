import { prisma } from '../../config';
import {
    IProblemTickets,
    ICProblemTicketsR,
    IProblemTicketsWithData,
    ticketPriority,
    ticketStatus,
} from '../types';

export class ProblemTicketRepository {
    public async createTicket(
        data: ICProblemTicketsR
    ): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.create({
                data: data as any,
            }) as unknown as IProblemTickets;
        } catch (error) {
            throw new Error('Failed to create ticket');
        }
    }

    public async getTicket(id: string): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.findUnique({
                where: {
                    id: id,
                },
            }) as unknown as IProblemTickets | null;
        } catch (error) {
            throw new Error('Failed to get ticket');
        }
    }
    public async getTicketByTicketNumber(
        ticketNumber: string
    ): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.findUnique({
                where: {
                    ticketNo: ticketNumber,
                },
            }) as unknown as IProblemTickets | null;
        } catch (error) {
            throw new Error('Failed to get ticket');
        }
    }

    public async updateTicket(
        id: string,
        data: ICProblemTicketsR
    ): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.update({
                where: {
                    id: id,
                },
                data: data as any,
            }) as unknown as IProblemTickets;
        } catch (error) {
            throw new Error('Failed to update ticket');
        }
    }
    public async deleteTicket(id: string): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.update({
                where: {
                    id: id,
                },
                data: {
                    isDeleted: true,
                },
            }) as unknown as IProblemTickets;
        } catch (error) {
            throw new Error('Failed to delete ticket');
        }
    }
    public async getTicketsRaisedByCustomer(
        customerId: string,
        limit: number,
        page: number
    ): Promise<IProblemTicketsWithData[]> {
        try {
            return await prisma.problemTickets.findMany({
                where: {
                    customerId: customerId,
                    isDeleted: false,
                },
                include: {
                    Customer: true,
                    Property: true,
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                ],
            }) as unknown as IProblemTicketsWithData[];
        } catch (error) {
            throw new Error('Failed to get tickets');
        }
    }
    public async getTicketsRaisedForProperty(
        propertyId: string,
        limit: number,
        page: number
    ): Promise<IProblemTicketsWithData[]> {
        try {
            return await prisma.problemTickets.findMany({
                where: {
                    propertyId: propertyId,
                    isDeleted: false,
                },
                include: {
                    Customer: true,
                    Property: true,
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                ],
            }) as unknown as IProblemTicketsWithData[];
        } catch (error) {
            throw new Error('Failed to get tickets');
        }
    }
    public async updateTicketPriority(
        ticketId: string,
        priority: ticketPriority
    ): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.update({
                where: {
                    id: ticketId,
                },
                data: {
                    priority: priority,
                },
            }) as unknown as IProblemTickets;
        } catch (error) {
            throw new Error('Failed to update ticket priority');
        }
    }
    public async updateTicketStatus(
        ticketId: string,
        status: ticketStatus
    ): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.update({
                where: {
                    id: ticketId,
                },
                data: {
                    status: status,
                },
            }) as unknown as IProblemTickets;
        } catch (error) {
            throw new Error('Failed to update ticket status');
        }
    }
    public async getTotalTicketsForCustomer(customerId: string): Promise<number> {
        try {
            return await prisma.problemTickets.count({
                where: {
                    customerId: customerId,
                    isDeleted: false,
                },
            });
        } catch (error) {
            throw new Error('Failed to get total tickets');
        }
    }
    public async getTotalTicketsForProperty(
        propertyId: string
    ): Promise<number> {
        try {
            return await prisma.problemTickets.count({
                where: {
                    propertyId: propertyId,
                    isDeleted: false,
                },
            });
        } catch (error) {
            throw new Error('Failed to get total tickets');
        }
    }
}
