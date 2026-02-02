import {
    agencyApplicationRequest,
    getAgencyApplicationByName,
    getAgencyApplications,
    updateApplicationStatus
} from "../api";
import type {
    AgencyApplicationStatus,
    fAgencyApplicationStatus,
    IUCAgencyApplication,
} from "../interfaces";
export const createAgencyApplicationService = async (applicationData: IUCAgencyApplication) => {
    try {
        if(!applicationData.agencyEmail){
            return {
                success:false,
                message:"Agency email is required"
            }
        }
        if(!applicationData.agencyName){
            return {
                success:false,
                message:"Agency name is required"
            }
        }
        if(!applicationData.contactNo){
            return {
                success:false,
                message:"Contact number is required"
            }
        }
        if(!applicationData.address){
            return {
                success:false,
                message:"Address is required"
            }
        }
        if(!applicationData.taxNo){
            return {
                success:false,
                message:"Tax number is required"
            }
        }
        if(!applicationData.iataCode){
            return {
                success:false,
                message:"IATA code is required"
            }
        }
        if(applicationData.commissionType==="fixed"&&!applicationData.commissionCurrency){
            return {
                success:false,
                message:"Commission currency is required for fixed commission type"
            }
        }
        const response = await agencyApplicationRequest({...applicationData,
            applicationNoForThisUser: 0,
            status: "pending"
        });
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create agency application, try again later"
        };
    }
};

export const getAgencyApplicationByNameService = async (name: string) => {
    try {
        if(!name||!name.trim()){
            return {
                success:false,
                message:"Agency name is required"
            }
        }
        const response = await getAgencyApplicationByName(name);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agency application, try again later"
        };
    }
};

export const getAgencyApplicationsService = async (status: fAgencyApplicationStatus, page: number=1, limit: number=10) => {
    try {
        const response = await getAgencyApplications(status, page, limit);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to retrieve agency applications, try again later"
        };
    }
};
export const updateAgencyApplicationStatusService = async (applicationId: string, status: AgencyApplicationStatus, rejectionReason?: string) => {
    try {
        const response = await updateApplicationStatus(applicationId, status, rejectionReason);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to update agency application status, try again later"
        };
    }
};
