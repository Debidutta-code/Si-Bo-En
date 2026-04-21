import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { SpaDatesRepo, SpaSlotsRepo } from "../repository";
import { ICSpaDatesR, ICSpaDatesS } from "../types/spa-slot.type";

export class SpaDates {
    private spaDatesRepo: SpaDatesRepo;

    constructor() {
        this.spaDatesRepo = new SpaDatesRepo();
    }
    public async createSpaDate(data: ICSpaDatesS, spaModuleId: string): Promise<IApiResponse> {
        try {
            const isExistsForDates = await this.spaDatesRepo.getSpaForDate(spaModuleId, data.date);
            if (isExistsForDates) {
                return errorResponse("Spa already exists for this date add slots", "Spa Exist for this date");
            }
            const spaDate = await this.spaDatesRepo.createDate({
                ...data,
                spaModuleId
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