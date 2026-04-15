import axios from "axios";

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/loyalit-guest`;

/** Fetch the authenticated loyalty guest's full profile via cookie */
export const getMyProfileApi = async () => {
    try {
        const response = await axios.get(`${BASE}/me`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return error?.response?.data ?? { success: false, message: error?.message };
    }
};
