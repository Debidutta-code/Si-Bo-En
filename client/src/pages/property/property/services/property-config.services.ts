import { 
    updatePropertyConfig ,
    fetchPropertyConfig,
    addPropertyIntegrationField,
    createPropertyIntegration,
    deletePropertyIntegration,
    deletePropertyIntegrationField,
    updatePropertyIntegrationField,
    updatePropertyIntegrationStatus,
    getAllPartnerIntegrations
} from "../api";
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

export const getAllPartnerIntegrationsService = async (propertyId: string) => {
    try {
        if (!propertyId) {
            return {
                success: false,
                message: "Property is not chosen"
            }
        }
        const response = await getAllPartnerIntegrations(propertyId)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to fetch partner integrations"
        }
    }
}

export const createPropertyIntegrationService = async (data: any) => {
    try {
        if (!data) {
            return {
                success: false,
                message: "Integration data is required"
            }
        }
        if (!data.propertyId) {
            return {
                success: false,
                message: "Property ID is required"
            }
        }
        if (!data.masterIntegrationId) {
            return {
                success: false,
                message: "Master Integration ID is required"
            }
        }
        if (!data.fields || data.fields.length === 0) {
            return {
                success: false,
                message: "Integration fields are required"
            }
        }
        const response = await createPropertyIntegration(data)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to create property integration"
        }
    }
}

export const updatePropertyIntegrationStatusService = async (integrationId: string, isActive: boolean) => {
    try {
        if (!integrationId) {
            return {
                success: false,
                message: "Integration ID is required"
            }
        }
        if (typeof isActive !== 'boolean') {
            return {
                success: false,
                message: "Active status must be a boolean value"
            }
        }
        const response = await updatePropertyIntegrationStatus(integrationId, isActive)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to update integration status"
        }
    }
}

export const deletePropertyIntegrationService = async (integrationId: string) => {
    try {
        if (!integrationId) {
            return {
                success: false,
                message: "Integration ID is required"
            }
        }
        const response = await deletePropertyIntegration(integrationId)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to delete property integration"
        }
    }
}

export const addPropertyIntegrationFieldService = async (integrationId: string, data: any) => {
    try {
        if (!integrationId) {
            return {
                success: false,
                message: "Integration ID is required"
            }
        }
        if (!data) {
            return {
                success: false,
                message: "Field data is required"
            }
        }
        const response = await addPropertyIntegrationField(integrationId, data)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to add integration field"
        }
    }
}

export const updatePropertyIntegrationFieldService = async (fieldId: string, data: any) => {
    try {
        if (!fieldId) {
            return {
                success: false,
                message: "Field ID is required"
            }
        }
        if (!data) {
            return {
                success: false,
                message: "Field data is required"
            }
        }
        const response = await updatePropertyIntegrationField(fieldId, data)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to update integration field"
        }
    }
}

export const deletePropertyIntegrationFieldService = async (fieldId: string) => {
    try {
        if (!fieldId) {
            return {
                success: false,
                message: "Field ID is required"
            }
        }
        const response = await deletePropertyIntegrationField(fieldId)
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Failed to delete integration field"
        }
    }
}