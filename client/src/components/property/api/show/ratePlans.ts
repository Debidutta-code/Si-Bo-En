import AxiosInstance from "@/components/axiosInstance";


export const getRatePlans = async (hotelCode: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.get(`/ari/rateplan/get/${hotelCode}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
export const deleteRatePlans = async (ratePlanCode: string) => {
    const axiosInstance = AxiosInstance()
    try {
        const response = await axiosInstance.patch(`/ari/rateplan/delete/${ratePlanCode}`)
        return response.data
    } catch (error: any) {
        return error?.response.data
    }
}
