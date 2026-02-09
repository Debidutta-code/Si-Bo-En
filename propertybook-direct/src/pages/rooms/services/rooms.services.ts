import {
    fetchRooms
} from "../api";
import {
    FindRoomsRequest
} from "../interfaces";
export const fetchPropertyDetailsWithRooms = async (data:FindRoomsRequest) => {
    try {

            if(!data.PropertyCode||data.PropertyCode.trim()===""){
                return {
                    success: false,
                    message:"Property is not selected"
                }
            }
            if(!data.startDate||!data.endDate){
                return {
                    success: false,
                    message:"Please select a date range"
                }
            }
            if(data.guests.adults<=0){
                return {
                    success: false,
                    message:"Please select at least one adult"
                }
            }
            if(data.guests.rooms<=0){
                return {
                    success: false,
                    message:"Please select at least one room"
                }
            }
            return await fetchRooms(data);
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "An error occurred while fetching property details"
        };
    }

};
