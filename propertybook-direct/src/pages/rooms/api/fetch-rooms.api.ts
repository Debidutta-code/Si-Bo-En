import createAxiosInstance from "@/components/axiosInstance";
import { FindRoomsRequest } from "../interfaces";

export const fetchRooms = async (requestData: FindRoomsRequest) => {
    const axiosInstance = createAxiosInstance();

    try {
        const response = await axiosInstance.post("/booking-engine/fetch-rooms", requestData);
        return response.data;
    } catch (error) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
};

