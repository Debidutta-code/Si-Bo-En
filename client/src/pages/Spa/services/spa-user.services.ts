import {
    getSpaUsersForProperty,
    assignSpaToUser,
    removeUserFromSpa
} from "../api";

export const getSpaUsersForPropertyService = async (propertyId: string) => {
    try {
        const result = await getSpaUsersForProperty(propertyId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve spa users"
        };
    }
};

export const assignSpaToUserService = async (spaId: string, userId: string) => {
    try {
        const result = await assignSpaToUser(spaId, userId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to assign spa to user"
        };
    }
};

export const removeUserFromSpaService = async (spaId: string, userId: string) => {
    try {
        const result = await removeUserFromSpa(spaId, userId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to remove user from spa"
        };
    }
};
