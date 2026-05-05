import {
    ChildAddonRepository
} from "../repository";
import { IApiResponse, successResponse, errorResponse } from "../../utils";
import {
    ICChildAddoon,
    IChildAddon,
    IUpdateChildAddon
} from "../interfaces"
import { getCurrencyConverter } from "../../currency-maping/utils";
export class ChildAddonsService {
    private childAddonRepository: ChildAddonRepository;

    constructor() {
        this.childAddonRepository = new ChildAddonRepository();
    }
    public async createChildAddon(data: ICChildAddoon, propertyId: string): Promise<IApiResponse> {
        try {
            const [getAllChildAddons,{ convert, baseCurrency }] = await Promise.all([
                this.childAddonRepository.getChildAddons(data.addonId),
                getCurrencyConverter(propertyId, data.currencyCode?data.currencyCode:"AED")
            ]);

            const isAgeValid = this.validateAge(data.minAge, data.maxAge, getAllChildAddons);
            if (!isAgeValid) {
                return errorResponse("Some children catalog are overlapping in age range");
            }
            
            const daoRes = await this.childAddonRepository.createChildAddons({
                minAge: data.minAge,
                maxAge: data.maxAge,
                addonId: data.addonId,
                discountApplicable: data.discountApplicable,
                discountType: data.discountType,
                discountAmount: data.discountType === "flat" ? convert(data.discountAmount?data.discountAmount:0) : data.discountAmount,
                currencyCode: data.discountType === "flat" ? baseCurrency : data.currencyCode
            });
            if (daoRes) {
                return successResponse("Children catalog created successfully", daoRes);
            }
            return errorResponse("Failed to create children catalog");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create children catalog", error.message);
            }
            return errorResponse("Failed to create children catalog");
        }
    }
    private validateAge(
        currentMinAge: number,
        currentMaxAge: number,
        existingChildAddons: IChildAddon[]
    ): boolean {

        if (currentMinAge < 0 || currentMaxAge < 0) return false;

        if (currentMinAge > currentMaxAge) return false;

        return !existingChildAddons.some(addon =>
            currentMinAge <= addon.maxAge && currentMaxAge >= addon.minAge
        );
    }
    public async getChildAddons(addonId: string): Promise<IApiResponse> {
        try {
            const childAddons = await this.childAddonRepository.getChildAddons(addonId);
            return successResponse("Child addons retrieved successfully", childAddons);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve child addons", error.message);
            }
            return errorResponse("Failed to retrieve child addons");
        }
    }
    public async updateChildAddon(id: string, data: IUpdateChildAddon,propertyId:string): Promise<IApiResponse> {
        try {
            const isExist=await this.childAddonRepository.getById(id);
            if (!isExist) {
                return errorResponse("Child addon not found");
            }
            const [getAllChildAddons,{ convert, baseCurrency }] = await Promise.all([
                this.childAddonRepository.getChildAddons(isExist.addonId),
                getCurrencyConverter(propertyId, data.currencyCode?data.currencyCode:"AED")
            ]);
            const daoRes = await this.childAddonRepository.updateChildAddon(id, {
                minAge: data.minAge,
                maxAge: data.maxAge,
                discountApplicable: data.discountApplicable,
                discountType: data.discountType,
                discountAmount: data.discountType === "flat" ? convert(data.discountAmount?data.discountAmount:0) : data.discountAmount,
                currencyCode: data.discountType === "flat" ? baseCurrency : data.currencyCode
            });
            if (daoRes) {
                return successResponse("Children catalog updated successfully", daoRes);
            }
            return errorResponse("Failed to update children catalog");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update children catalog", error.message);
            }
            return errorResponse("Failed to update children catalog");
        }
    }
    public async deleteChildAddon(id: string): Promise<IApiResponse> {
        try {
            const isExist = await this.childAddonRepository.getById(id);
            if (!isExist) {
                return errorResponse("Child addon not found");
            }
            const daoRes = await this.childAddonRepository.deleteChildAddon(id);
            if (daoRes) {
                return successResponse("Children catalog deleted successfully");
            }
            return errorResponse("Failed to delete children catalog");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete children catalog", error.message);
            }
            return errorResponse("Failed to delete children catalog");
        }
    }
}