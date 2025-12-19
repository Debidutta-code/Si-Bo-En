import {fetchAnalytics,
    fetchProperties
} from "../api";

export const fetchAnaltyticsService=async(propertyid?:string,propertyCode?:string,propetyName?:string)=>{
    try {
        return await fetchAnalytics(propertyid&&propertyid,propertyCode&&propertyCode,propetyName&&propetyName)
    } catch (error) {
        return {
            success:false,
            message:"Failed to fetch Analytics"
        }
    }
}
export const fetchPropertiesService=async()=>{
    try {
        return await fetchProperties()
    } catch (error) {
        return {
            success:false,
            message:"Failed to Properties"
        }
    }
}
