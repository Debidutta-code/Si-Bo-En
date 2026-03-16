
import { getCreationsByRole, getCreationId, getUnMappedUsers, updateCreation, deleteCreation } from "../api/api";
import type { ICreation } from "../types/types";
export async function getCreation() {
    try {
        const response = await getCreationsByRole()
        if (!response.success) {
            return response
        }
        const data = response.data;
        const groups = data.filter((creation: ICreation) => creation.type === "group")
        const brands = data.filter((creation: ICreation) => creation.type === "brand")
        const properties = data.filter((creation: ICreation) => creation.type === "property")
        const customs = data.filter((creation: ICreation) => creation.type === "custom")
        return {
            success: true,
            message: "Filtered Creation Successfully",
            data: {
                groups,
                brands,
                properties,
                customs
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Failed to filter Creation"
        }
    }
}
export async function getGroupCreationId(id: string) {
    try {
        const response = await getCreationId(id)
        if (!response.success) {
            return response
        }
        const data = response.data;
        const brands = data?.groupChildren?.filter((creation: ICreation) => creation.type === "brand")
        const properties = data?.groupChildren?.filter((creation: ICreation) => creation.type === "property")
        const groupDetails = {
            id: data.id,
            name: data.name,
            users: data.users,
            superGroupName: data.super.name,
            createdAt: data.createdAt,
            isActive: data.isActive,
            images: data.images || []
        }
        return {
            success: true,
            message: "Fetched Group Successfully",
            data: {
                groupData: groupDetails,
                brands,
                properties
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Failed to Fetch Group Details"
        }
    }
}
export async function getCustomCreationId(id: string) {
    try {
        const response = await getCreationId(id)
        if (!response.success) {
            return response
        }
        const data = response.data;
        const brands = data?.customChildren?.filter((creation: ICreation) => creation.type === "brand")
        const properties = data?.customChildren?.filter((creation: ICreation) => creation.type === "property")
        const groups = data?.customChildren?.filter((creation: ICreation) => creation.type === "group")
        const groupDetails = {
            id: data.id,
            name: data.name,
            users: data.users,
            superGroupName: data.super.name,
            createdAt: data.createdAt,
            isActive: data.isActive,
            images: data.images || []
        }
        return {
            success: true,
            message: "Fetched Group Successfully",
            data: {
                customDetails: groupDetails,
                brands,
                properties,
                groups
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Failed to Fetch Group Details"
        }
    }
}
export async function getBrandCreationId(id: string) {
    try {
        const response = await getCreationId(id)
        if (!response.success) {
            return response
        }
        const data = response.data;
        // console.log("Brand Data:", data);
        const properties = data?.brandChildren?.filter((creation: ICreation) => creation.type === "property")
        return {
            success: true,
            message: "Fetched Brand Successfully",
            data: {
                properties,
                brandData: {
                    id: data.id,
                    images: data.images,
                    name: data.name,
                    createdAt: data.createdAt,
                    under: data.group ? data.group.name : data.super.name,
                    isActive: data.isActive,
                    users: data.users,

                }
            }
        }
    } catch (error: any) {
        // console.log(error)
        return {
            success: false,
            message: "Failed to Fetch Brand Details"
        }
    }
}
export async function getPropertyCreationId(id: string) {
    try {
        const response = await getCreationId(id)
        if (!response.success) {
            return response
        }
        const data = response.data;
        return {
            success: true,
            isPropertyCreated: data?.propertyDetails ? true : false,
            message: response.message,
            data: {
                creationData: {
                    id: data.creation.id,
                    name: data.creation.name,
                    images: data.creation.images,
                    isActive: data.creation.isActive,
                    under: data.creation.type === "property" ? (data.creation.brand ? data.creation.brand.name : data.creation.group ? data.creation.group.name : data.creation.super.name) : "",
                    createdAt: data.creation.createdAt,
                    level0Users: data.creation.level0Users,
                    level1Users: data.creation.level1Users,
                },
                propertyDetails: {
                    id: data?.propertyDetails?.id,
                    name: data?.propertyDetails?.propertyName,
                    images: data?.propertyDetails?.image,
                    isDrafted: data?.propertyDetails?.isDraft
                }

            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Failed to Fetch Brand Details"
        }
    }
}
export async function getUsersForMapping() {
    try {
        const response = await getUnMappedUsers()
        if (!response.success) {
            return response
        }
        if (response.data?.length === 0) {
            return {
                success: true,
                message: "No Users Available for Mapping",
                data: []
            }
        }
        const groupManagers = response.data.filter((user: any) => user.role === "group_manager")
        const brandManagers = response.data.filter((user: any) => user.role === "brand_manager")
        const hotelManagers = response.data.filter((user: any) => user.role === "hotel_manager")
        const staffs = response.data.filter((user: any) => user.role === "staff")
        const revenueManagers = response.data.filter((user: any) => user.role === "revenue_manager")
        const frontDesks = response.data.filter((user: any) => user.role === "front_desk")
        const housekeeping = response.data.filter((user: any) => user.role === "housekeeping")
        const customAdmins = response.data.filter((user: any) => user.role === "custom_admin")
        return {
            success: true,
            message: "Fetched Users Successfully",
            data: {
                groupManagers,
                brandManagers,
                hotelManagers,
                staffs,
                revenueManagers,
                frontDesks,
                housekeeping,
                customAdmins
            }
        }
    } catch (error: any) {
        return {
            success: false,
            message: "Failed to Fetch Users"
        }
    }
}

export const updateCreationService = async (id: string, name: string, images: string[], isActive: boolean) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Select a creation to update"
            }
        }
        if (!name) {
            return {
                success: false,
                message: "Creation name is required"
            }
        }
        if (!images || images.length === 0) {
            return {
                success: false,
                message: "Atleast one image is required"
            }
        }
        const response = await updateCreation(id, { name, images, isActive })
        return response
    } catch (error) {
        return {
            success: false,
            message: "Failed to update creation"
        }
    }
}

export const deleteCreationService = async (id: string) => {
    try {
        if (!id) {
            return {
                success: false,
                message: "Select a creation to delete"
            }
        }
        const response = await deleteCreation(id)
        return response
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete creation"
        }
    }
}