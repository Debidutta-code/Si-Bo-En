import {
    getLoyalityLevels,
    createLoyalityLevel,
    updateLoyalityLevel,
    deleteLoyalityLevel
} from "../api/loyality-level.api";
import type { ICLoyalityLevels } from "../interfaces";

export const getLoyalityLevelsService = async (programId: string) => {
    return getLoyalityLevels(programId);
};

export const createLoyalityLevelService = async (data: ICLoyalityLevels) => {
    return createLoyalityLevel(data);
};

export const updateLoyalityLevelService = async (id: string, data: ICLoyalityLevels) => {
    return updateLoyalityLevel(id, data);
};

export const deleteLoyalityLevelService = async (id: string) => {
    return deleteLoyalityLevel(id);
};
