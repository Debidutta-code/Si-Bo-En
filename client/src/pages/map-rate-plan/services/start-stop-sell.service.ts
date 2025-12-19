import {startStopSellAPI} from "../api";
import type { ICStartStopSell } from "../types";

export const useStartStopSellService = async (propertyId:string, data:ICStartStopSell) => {
    try {
        if(!propertyId){
            return{
                success:false,
                message:"Property ID is required"
            }
        }
        if(!data ){
            return{
                success:false,
                message:"No data to process"
            }
        }
if(!data.ratePlanCode&&!data.roomTypeCode){
            return{
                success:false,
                message:"At least one of Rate Plan Code or Room Type Code must be provided"
            }
        }
        if(!data.from || !data.to){
            return{
                success:false,  
                message:"From and To dates are required"
            }   
        }
        if(data.to<data.from){
            return{
                success:false,
                message:"To date cannot be earlier than From date"
            }   
        }
        const response = await startStopSellAPI(propertyId,data);
        return response;
    } catch (error) {
        return {
            success:false,
            message:"An error occurred while processing start-stop-sell data"
        }
    }
}