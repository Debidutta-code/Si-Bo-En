import { successResponse,errorResponse } from "../../../utils";
import { IApiResponse } from "../../../utils";
import {
    AgenticRoomRepository,
    AgenticRatePlanRepository,
    ChargesRepository,
    AgenticPropertyRepository
} from "../repository";
import { IRooms, IRatePlan, ICharges } from "../types";

interface RoomWithRatePlans {
    room: IRooms;
    ratePlans: {
        ratePlan: IRatePlan;
        totalPrice: number;
        isAvailable: boolean;
        chargesPerDay: {
            date: Date;
            price: number;
            isAvailable: boolean;
            charge: ICharges;
        }[];
    }[];
}

export class AgenticRoomService {
    private agenticRoomRepository: AgenticRoomRepository;
    private agenticRatePlanRepository: AgenticRatePlanRepository;
    private chargesRepository: ChargesRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticRoomRepository = new AgenticRoomRepository();
        this.agenticRatePlanRepository = new AgenticRatePlanRepository();
        this.chargesRepository = new ChargesRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }

    public async getRoomDetails(agenticPropertyId:string,startDate:Date,endDate:Date):Promise<IApiResponse>{
        try {
            const property = await this.agenticPropertyRepository.getAgenticPropertyById(agenticPropertyId);
            if (!property) {
                return errorResponse("Agentic Property not found", "Property does not exist or deleted");
            }

            const [roomDetails, ratePlans] = await Promise.all([
                this.agenticRoomRepository.agenticRooms(agenticPropertyId),
                this.agenticRatePlanRepository.getRatePlans(agenticPropertyId)
            ]);

            const roomCodes = roomDetails.map(room => room.room.roomType);
            const ratePlanCodes = ratePlans.map(ratePlan => ratePlan.ratePlanCode);

            const charges = await this.chargesRepository.getChargesByPropertyId(
                property.propertyCode,
                roomCodes,
                ratePlanCodes,
                startDate,
                endDate
            );

            // Map rooms with their rate plans and prices
            const roomsWithRatePlans: RoomWithRatePlans[] = roomDetails.map(room => {
                const roomType = room.room.roomType;

                // Find all rate plans for this room type
                const roomRatePlans = ratePlans.map(ratePlan => {
                    // Find all charges for this room type and rate plan within the date range
                    const ratePlanCharges = charges.filter(
                        c => c.roomTypeCode === roomType && 
                             c.ratePlanCode === ratePlan.ratePlanCode
                    );

                    // Map charges per day with price
                    const chargesPerDay = ratePlanCharges.map(charge => ({
                        date: charge.date,
                        price: charge.baseGuestAmounts?.[0]?.amountBeforeTax 
                            ? Number(charge.baseGuestAmounts[0].amountBeforeTax) 
                            : 0,
                        isAvailable: charge.isAvailable,
                        charge: charge
                    }));

                    // Calculate total price for the entire stay
                    const totalPrice = chargesPerDay.reduce((sum, day) => sum + day.price, 0);

                    // Check if available for all days
                    const isAvailable = chargesPerDay.length > 0 && chargesPerDay.every(day => day.isAvailable);

                    return {
                        ratePlan,
                        totalPrice,
                        isAvailable,
                        chargesPerDay
                    };
                });

                return {
                    room,
                    ratePlans: roomRatePlans
                };
            });

            return successResponse("Room details retrieved successfully", {
             
                rooms: roomsWithRatePlans,
                dateRange: {
                    startDate,
                    endDate
                }
            });
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to retrieve room details", error.message);
            }
            return errorResponse("Failed to retrieve room details");
        }
    }
    
}
