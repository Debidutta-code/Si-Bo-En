import {
    createRoomView,
    deleteRoomView,
    getRoomViews,
    getSpecificRoomView,
    updateRoomView
} from "../api";
import type { ICMasterRoomView } from "../types";

export const getAllRoomViews = async () => {
    try {

        const response = await getRoomViews();
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch room views"
        };
    }
};
export const createNewRoomView = async (payload: ICMasterRoomView) => {
    try {
        if (!payload.viewName || payload.viewName.trim() === "") {
            return {
                success: false,
                message: "View name is required"
            };
        }
        
        const response = await createRoomView(payload);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create room view"
        };
    }
};

export const updateRoomViewService = async (id: string, payload: ICMasterRoomView) => {
    try {
        if (!payload.viewName || payload.viewName.trim() === "") {
            return {
                success: false,
                message: "View name is required"
            };
        }

        const response = await updateRoomView(id, payload);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update room view"
        };
    }
};
export const deleteRoomViewService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a room view to delete"
            };
        }

        const response = await deleteRoomView(id);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete room view"
        };
    }
};
export const getSpecificRoomViewService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a room view to get details"
            };
        }

        const response = await getSpecificRoomView(id);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch specific room view"
        };
    }
};