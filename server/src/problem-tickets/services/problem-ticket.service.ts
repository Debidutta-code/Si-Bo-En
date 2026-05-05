import {
    IProblemTickets,
    IProblemTicketsWithData,
    ICProblemTicketsS,
    ticketStatus,
    ticketPriority,

} from '../types';

import { ProblemTicketRepository } from '../repository';
import { IApiResponse ,successResponse,errorResponse,paginatedSuccessResponse} from '../../utils';
export class ProblemTicketService {
    private problemTicketRepository: ProblemTicketRepository;
    constructor() {
        this.problemTicketRepository = new ProblemTicketRepository();
    }
    public async createTicket(
        data: ICProblemTicketsS
    ): Promise<IApiResponse<IProblemTickets>> {
        try {
            const ticket = await this.problemTicketRepository.createTicket({
                ...data,
                ticketNo:await this.generateTicketNumber(),
                priority:"medium",
                status:"open"
            });
            return successResponse('Ticket created successfully', ticket);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create ticket', error.message);
            }
            return errorResponse(
                'Failed to create ticket',
                'Error occur while creating ticket'
            );
        }
    }
    private async generateTicketNumber():Promise<string>{
        const ticketNumber = `TICKET-${Date.now()}`;
        const ticket = await this.problemTicketRepository.getTicketByTicketNumber(ticketNumber);
        if(ticket){
            return this.generateTicketNumber();
        }
        return ticketNumber;
    }
    public async updateTicket(id:string,data:IProblemTickets){
        try {
            const ticket = await this.problemTicketRepository.getTicket(id)
            if(!ticket){
                return errorResponse('Ticket not found', 'Ticket not found');
            }
            const updatedTicket = await this.problemTicketRepository.updateTicket(id,data);
            return successResponse('Ticket updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update ticket', error.message);
            }
            return errorResponse(
                'Failed to update ticket',
                'Error occur while updating ticket'
            );
        }
    }
    public async deleteTicket(id:string){
        try {
            const ticket = await this.problemTicketRepository.getTicket(id)
            if(!ticket){
                return errorResponse('Ticket not found', 'Ticket not found');
            }
            await this.problemTicketRepository.deleteTicket(id);
            return successResponse('Ticket deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete ticket', error.message);
            }
            return errorResponse(
                'Failed to delete ticket',
                'Error occur while deleting ticket'
            );
        }
    }
    public async getTicketsForCustomer(customerId:string,limit:number=10,page:number=1):Promise<IApiResponse<IProblemTicketsWithData[]>>{
        try {
            const [tickets,totalTickets] = await Promise.all([
                this.problemTicketRepository.getTicketsRaisedByCustomer(customerId,limit,page),
                this.problemTicketRepository.getTotalTicketsForCustomer(customerId)
            ])
            return paginatedSuccessResponse('Tickets fetched successfully', tickets,{
                currentPage:page,
                totalPages:Math.ceil(totalTickets/limit),
                limit,
                hasNextPage:page<Math.ceil(totalTickets/limit),
                hasPrevPage:page>1,
                totalCount:totalTickets,
                
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch tickets', error.message);
            }
            return errorResponse(
                'Failed to fetch tickets',
                'Error occur while fetching tickets'
            );
        }
    }
    public async getTicketsForProperty(propertyId:string,limit:number=10,page:number=1):Promise<IApiResponse<IProblemTicketsWithData[]>>{
        try {
            const [tickets,totalTickets] = await Promise.all([
                this.problemTicketRepository.getTicketsRaisedForProperty(propertyId,limit,page),
                this.problemTicketRepository.getTotalTicketsForProperty(propertyId)
            ])
            return paginatedSuccessResponse('Tickets fetched successfully', tickets,{
                currentPage:page,
                totalPages:Math.ceil(totalTickets/limit),
                limit,
                hasNextPage:page<Math.ceil(totalTickets/limit),
                hasPrevPage:page>1,
                totalCount:totalTickets,
                
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch tickets', error.message);
            }
            return errorResponse(
                'Failed to fetch tickets',
                'Error occur while fetching tickets'
            );
        }
    }

    public async updateTicketStatus(id:string,status:ticketStatus):Promise<IApiResponse<IProblemTickets>>{
        try {
            const ticket = await this.problemTicketRepository.getTicket(id);
            if(!ticket){
                return errorResponse('Ticket not found', 'Ticket not found');
            }
            const updatedTicket = await this.problemTicketRepository.updateTicketStatus(id,status);
            return successResponse('Ticket status updated successfully', updatedTicket);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse('Failed to update ticket status',error.message);
            }
            return errorResponse(
                'Failed to update ticket status',
                'Error occur while updating ticket status'
            );
        }
    }
    public async updateTicketPriority(id:string,priority:ticketPriority):Promise<IApiResponse<IProblemTickets>>{
        try {
            const ticket = await this.problemTicketRepository.getTicket(id);
            if(!ticket){
                return errorResponse('Ticket not found', 'Ticket not found');
            }
            const updatedTicket = await this.problemTicketRepository.updateTicketPriority(id,priority);
            return successResponse('Ticket priority updated successfully', updatedTicket);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse('Failed to update ticket priority',error.message);
            }
            return errorResponse(
                'Failed to update ticket priority',
                'Error occur while updating ticket priority'
            );
        }
    }
        
}
