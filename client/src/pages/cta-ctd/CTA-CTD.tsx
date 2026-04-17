

// pages/cta-ctd/page.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/components/axiosInstance";
import RestrictionsPage from "./components/RestrictionsPage";

export default function RestrictionsPageWrapper() {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [propertyCode, setPropertyCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (propertyId) {
            fetchPropertyCode();
        }
    }, [propertyId]);

    const fetchPropertyCode = async () => {
        try {
            setIsLoading(true);
            const axios = axiosInstance();
            const response = await axios.get(`/property-management/property/${propertyId}`);
            
            if (response.data?.data?.propertyCode) {
                setPropertyCode(response.data.data.propertyCode);
            }
        } catch (error) {
            console.error("Error fetching property code:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading property data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!propertyId || !propertyCode) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-12">
                        <p className="text-red-600">Property not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <RestrictionsPage
            propertyId={propertyId} 
            propertyCode={propertyCode} 
        />
    );
}