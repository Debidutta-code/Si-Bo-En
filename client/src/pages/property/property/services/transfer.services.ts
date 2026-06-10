import type { ICompleteRecoveryProcess, IInitRecoveryProcess } from "../types";
import { initTransferProcessApi, completeTransferProcessApi } from "../api";

export const initTransferProcessService = async (payload: IInitRecoveryProcess) => {
    try {
        return await initTransferProcessApi(payload);
    } catch (error) {
        return {
            success: false,
            message: "Failed to initialize transfer process",
        }
    }
}

export const completeTransferProcessService = async (payload: ICompleteRecoveryProcess) => {
    try {
        return await completeTransferProcessApi(payload);
    } catch (error) {
        return {
            success: false,
            message: "Failed to complete transfer process",
        }
    }
}
