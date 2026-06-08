import AxiosInstance from "@/components/axiosInstance";
import type { IAssignUser } from "../types/types";
const axiosInstance = AxiosInstance()

export async function getCreationsByRole() {

    try {
        const response = await axiosInstance.get(`/create/getCreations`)
        if (response.data.success) {
            return response.data
        } else {
            return response.data
        }
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function getCreationId(id:string) {
    try {
        const response = await axiosInstance.get(`/create/getSpecificCreation/${id}`)
        return response.data;
        
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function getPropertyId(propertyId:string) {
    try {
        const response = await axiosInstance.get(`/property-management/property/${propertyId}`)
        return response.data
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function getUnMappedUsers() {
    try {
        const response = await axiosInstance.get(`/user/getUsersForMapping`)
        return response.data
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function assignUserToProperty(data:IAssignUser) {
    try {
        const response = await axiosInstance.post(`/user/assignUserToProperty`,data)
        return response.data
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}

export async function updateCreation(id:string,data:{name:string,images:string[],isActive:boolean}) {
    try {
        const response = await axiosInstance.put(`/create/${id}`,data)
        return response.data;
        
    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }

}
export async function deleteCreation(id:string) {
    try {
        const response = await axiosInstance.delete(`/create/remove/${id}`)
        return response.data;

    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export async function recoverCreation(id:string) {
    try {
        const response = await axiosInstance.put(`/create/recover/${id}`)
        return response.data;

    } catch (error: any) {
        if (!error?.response?.data?.success) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
