import { updatePropertyConfig ,fetchPropertyConfig} from "../api";
import type { IUPropertyConfig } from "../types";

export const updatePropertyConfigService = async (propertyId: string, data: IUPropertyConfig) => {
    try {
        if (!propertyId) {
            return {
                success: false,
                message: "Property Is Not Selected"
            }
        }
        if (!data) {
            return {
                success: false,
                message: "Property config data not found"
            }
        }
        const response = await updatePropertyConfig(propertyId, data)
        return response;
    } catch (error: any) {

        return {
            success: false,
            message: "Internal Server Error"
        }

    }

}
export const fetchPropertyConfigService = async (propertyId: string) => {
    try {
        if (!propertyId) {
            return {
                success: false,
                message: "Property Is Not Selected"
            }
        }
        const response = await fetchPropertyConfig(propertyId)
        return response;
    } catch (error: any) {

        return {
            success: false,
            message: "Internal Server Error"
        }

    }

}