import {getAllRoomTypesForProperty,addRoomInventory} from "../api";
import type {SelectedRoom} from "../types"

export async function fetchRoomTypesService(propertyId: string) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    const result = await getAllRoomTypesForProperty(propertyId);
    return result;
}
export async function addRoomInventoryService(propertyId: string,payload:SelectedRoom) {
    if (!propertyId) {
        return {
            success: false,
            message: "Property ID is required"
        }
    }
    if(payload.availableRooms>payload.totalRoom){
        return {
            success: false,
            message: "Available rooms cannot be more than total rooms"
        }
    }
    const result = await addRoomInventory(propertyId,payload);
    return result;
}