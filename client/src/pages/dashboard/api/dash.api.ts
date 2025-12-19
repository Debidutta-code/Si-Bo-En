import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance=createAxiosInstance()

export const fetchAnalytics=async(selectedPropertyId?:string,propertyCode?:string,propertyName?:string)=>{
    try {
        const response=await axiosInstance.get(`/dash/get-analytics?${selectedPropertyId&&"propertyId="+selectedPropertyId}&&${propertyCode&&"propertyCode"+propertyCode}&&${propertyName&&"propertyName"+propertyName}`)
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}
export const fetchProperties=async()=>{
    try {
        const response=await axiosInstance.get("/dash/properties")
        return response.data
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}