import {
    createAgenticProperty,
    deleteAgenticProperty,
    getAgenticPropertyById,
    getAvailablePropertiesForAgencies,
    getReservationsByAgenticPropertyId
} from "../api";

import type{
    ICAgenticProperty,
} from "../interfaces/agentic-property.type";

export const createAgenticPropertyService = async (data:ICAgenticProperty) => {
    try {
        if(!data.propertyId){
            return{
                success: false,
                message: "Property is not selected"
            }
        }
        if(!data.agencyId){
            return{
                success: false,
                message: "Agency is not selected"
            }
        }
        if(!data.propertyCode ||!data.propertyId){
            return{
                success: false,
                message: "Invalid property details are choosen"
            }
        }
        const response = await createAgenticProperty(data);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return{
            success: false,
            message: "Failed to create agentic property, try again later"
        }
    }
}
export const getAgenticPropertyByIdService=async(id:string)=>{
    try {
        const response = await getAgenticPropertyById(id);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agentic property, try again later"
        };
    }
};
export const deleteAgenticPropertyService=async(id:string)=>{
    try {
        const response = await deleteAgenticProperty(id);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete agentic property, try again later"
        };
    }
};

export const getAvailablePropertiesForAgenciesService=async(agencyId:string)=>{
    try {
        const response = await getAvailablePropertiesForAgencies(agencyId);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve available properties, try again later"
        };
    }
};
export const getReservationsByAgenticPropertyIdService=async(agencyId:string,propertyId:string)=>{
    try {
        const response = await getReservationsByAgenticPropertyId(agencyId,propertyId);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve reservations, try again later"
        };
    }
};