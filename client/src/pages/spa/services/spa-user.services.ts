import {
    getSpaUsersForProperty,
    assignSpaToUser,
    removeUserFromSpa,
    getUserSpa
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

export const SpasForUserService = async (propertyId: string) => {
    if(!propertyId) {
        return {
            success: false,
            message: "Property details are missing"
        };
    }
    try {
        const result = await getUserSpa(propertyId);
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve spas for user"
        };
    }
};
