import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { SpaDatesRepo, SpaSlotsRepo } from "../repository";
import { ICSpaDatesR, ICSpaDatesS, ICSpaSlotS } from "../types/spa-slot.type";

export class SpaDates {
    private spaDatesRepo: SpaDatesRepo;

    constructor() {
        this.spaDatesRepo = new SpaDatesRepo();
    }
    public async createSpaDate(date: Date, spaModuleId: string): Promise<IApiResponse> {
        try {
            const isExistsForDates = await this.spaDatesRepo.getSpaForDate(spaModuleId, date);
            if (isExistsForDates) {
                return errorResponse("Spa already exists for this date add slots", "Spa Exist for this date");
            }
             await this.spaDatesRepo.createDate({
                spaModuleId,
                date
            });
            return successResponse("Date Added Successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create date for spa", error.message);
            }
            return errorResponse("Failed to create date for spa", "Unknown error");
        }
    }
    public async getSpaForDateRange(spaId: string, startDate: Date, endDate: Date): Promise<IApiResponse> {
        try {
            const spaDates = await this.spaDatesRepo.getForDateRange(spaId, startDate, endDate);
            return successResponse("Fetched spa dates successfully", spaDates);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch spa dates for range", error.message);
            }
            return errorResponse("Failed to fetch spa dates for range", "Unknown error");
        }
    }
    public async deleteDate(id: string): Promise<IApiResponse> {
        try {
            const isExists = await this.spaDatesRepo.getDateById(id);
            if (!isExists) {
                return errorResponse("Spa date does not exist", "Spa date not found");
            }
            const deletedDate = await this.spaDatesRepo.deleteDate(id);
            return successResponse("Deleted spa date successfully", deletedDate);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete spa date", error.message);
            }
            return errorResponse("Failed to delete spa date", "Unknown error");
        }
    }
}

export class SpaSlotsServ {
    private spaSlotsRepo: SpaSlotsRepo;
    private spaDatesRepo: SpaDatesRepo;

    constructor() {
        this.spaSlotsRepo = new SpaSlotsRepo();
        this.spaDatesRepo = new SpaDatesRepo();

    }
    public async createSpaSlots(data: ICSpaSlotS, spaDateId: string): Promise<IApiResponse> {
        try {
            const isDateExists = await this.spaDatesRepo.getDateById(spaDateId);
            if (!isDateExists) {
                return errorResponse("Spa date does not exist", "Spa date not found");
            }
            const createdSlot = await this.spaSlotsRepo.createSlots({...data, spaDateId});
            return successResponse("Created spa slot successfully", createdSlot);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create spa slot", error.message);
            }
            return errorResponse("Failed to create spa slot", "Unknown error");
        }
    }
    public async deleteSpaSlot(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse("Spa slot does not exist", "Spa slot not found");
            }
            const deletedSlots = await this.spaSlotsRepo.deleteSlot(id);
            return successResponse("Deleted spa slots successfully", deletedSlots);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete spa slots", error.message);
            }
            return errorResponse("Failed to delete spa slots", "Unknown error");
        }
    }
    public async markAsBooked(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse("Spa slot does not exist", "Spa slot not found");
            }
            if (isSlotExists.isBooked) {
                return errorResponse("Spa slot is already booked", "Spa slot already booked");
            }
            const updatedSlot = await this.spaSlotsRepo.markSlotAsBooked(id);
            return successResponse("Marked spa slot as booked successfully", updatedSlot);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to mark spa slot as booked", error.message);
            }
            return errorResponse("Failed to mark spa slot as booked", "Unknown error");
        }
    }
    public async markAsAvailable(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse("Spa slot does not exist", "Spa slot not found");
            }
            if (isSlotExists.isBooked) {
                return errorResponse("Spa slot is available", "Spa slot already booked");
            }
            const updatedSlot = await this.spaSlotsRepo.markSlotAsAvailable(id);
            return successResponse("Marked spa slot as available successfully", updatedSlot);

        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to mark spa slot as available", error.message);
            }
            return errorResponse("Failed to mark as Available", "Unknown error")
        }
    }

}