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
                data: data,
            });
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
            });
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
            });
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
                data: data,
            });
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
            });
        } catch (error) {
            throw new Error('Failed to delete ticket');
        }
    }
    public async getTicketsRaisedByCustomer(
        guestId: string,
        limit: number,
        page: number
    ): Promise<IProblemTicketsWithData[]> {
        try {
            return await prisma.problemTickets.findMany({
                where: {
                    guestId: guestId,
                    isDeleted: false,
                },
                include: {
                    Guests: true,
                    Property: true,
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                ],
            });
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
                    Guests: true,
                    Property: true,
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                ],
            });
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
            });
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
            });
        } catch (error) {
            throw new Error('Failed to update ticket status');
        }
    }
    public async getTotalTicketsForCustomer(guestId: string): Promise<number> {
        try {
            return await prisma.problemTickets.count({
                where: {
                    guestId: guestId,
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
