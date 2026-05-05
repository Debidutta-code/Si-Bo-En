import createAxiosInstance from "@/components/axiosInstance"
const axiosInstance = createAxiosInstance();


export const getPropertyEmails = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/property-management/property/emails/property/${propertyId}`);
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const createPropertyEmail = async (propertyId: string, email: string) => {
    try {
        const response = await axiosInstance.post(`/property-management/property/emails/property/${propertyId}`, { email });
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const deletePropertyEmail = async (emailId: string) => {
    try {
        const response = await axiosInstance.delete(`/property-management/property/emails/${emailId}`);
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export const updatePropertyEmail = async (emailId: string, email: string) => {
    try {
        const response = await axiosInstance.put(`/property-management/property/emails/${emailId}`, { email });
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}