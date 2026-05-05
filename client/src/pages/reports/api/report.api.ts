import createAxiosInstance from "@/components/axiosInstance";

const axios = createAxiosInstance();

export const downloadReportApi = async (params: {
    reportType: string;
    startDate?: string;
    endDate?: string;
    propertyId?: string;
    brandId?: string;
    groupId?: string;
    groupBy?: string;
    sortBy?: string;
    mode?: string;
}) => {
    try {
        
        const response = await axios.get('/reports/generate', {
            params,
            responseType: 'blob', 
        });
        return response;
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
};

export const getFilterOptionsApi = async () => {
    try {
        
        const response = await axios.get('/reports/filter-options');
        return response;
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
};
