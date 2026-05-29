import { downloadReportApi, getFilterOptionsApi } from "../api";
import type { IFilterOptionsResponse } from "../interfaces";

export const downloadReportService = async (params: {
    reportType: string;
    startDate?: string;
    endDate?: string;
    propertyId?: string;
    brandId?: string;
    groupId?: string;
    groupBy?: string;
    sortBy?: string;
    mode?: string;
    targetCurrency?: string;
    comparisonType?: string;
    selectedDate?: string;
}) => {
    try {
        const response = await downloadReportApi(params);
        
        // Extract filename from content-disposition header if available
        let filename = `${params.reportType}-report.xlsx`;
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        
        // Append to html link element page
        document.body.appendChild(link);
        
        // Start download
        link.click();
        
        // Clean up and remove the link
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        console.error("Error downloading report:", error);
        return { success: false, error: "Failed to download report" };
    }
};

export const getFilterOptionsService = async (): Promise<{
    success: boolean;
    data?: IFilterOptionsResponse;
    error?: string;
}> => {
    try {
        const response = await getFilterOptionsApi();
        const result = response.data;

        if (result.success) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.message || "Failed to fetch filter options" };
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return { success: false, error: "Failed to fetch filter options" };
    }
};
