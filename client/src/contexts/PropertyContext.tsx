import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPropertyLanguagesService } from '@/pages/property/property/services/property-language.services';
import type { IPropertyActiveLanguage, IUPropertyConfig } from '@/pages/property/property/types';
import { fetchPropertyConfigService } from '@/pages/property/property/services';

interface PropertyContextType {
    propertyId: string | null;
    languages: IPropertyActiveLanguage[];
    loadingLanguages: boolean;
    refreshLanguages: () => void;
    setCreationId: React.Dispatch<React.SetStateAction<string>>;
    propertyCreationId: string;
    refreshPropertyConfig: () => void;
    propertyConfig: IUPropertyConfig;
    setPropertyConfig: React.Dispatch<React.SetStateAction<IUPropertyConfig>>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [propertyId, setPropertyId] = useState<string | null>(null);
    const [languages, setLanguages] = useState<IPropertyActiveLanguage[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState<boolean>(false);
    const [propertyCreationId, setCreationId] = useState<string>("");
    const [propertyConfig, setPropertyConfig] = useState<IUPropertyConfig>({
        channelManagerIntegrationActive: false,
        pmsIntegrationActive: false,
        selfAriActive: false,
        isB2bAvailable: false,
        isB2cAvailable: false,
        commission: false,
        showVideo: true,
        timezone: "Asia/Kolkata",
        baseCurrency: "INR",
        isAvailableForBooking:true,
        isAvailableForBookingEngine:true,
        isAvailableForOTA:false,
        isLoyaltyProgramEnabled:false,
        isSpaModuleEnabled:false
    })

    useEffect(() => {
        const segments = location.pathname.split('/');
        const idRegex = /^([0-9a-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
        
        const foundId = segments.find(segment => idRegex.test(segment));
        
        if (foundId && foundId !== propertyId) {
            setPropertyId(foundId);
        }
    }, [location.pathname, propertyId]);

    useEffect(() => {
        if (propertyId) {
            fetchAllData(propertyId);
        }
    }, [propertyId]);

    const fetchAllData = async (propertyId: string) => {
        await Promise.all([
            fetchLanguages(propertyId),
            fetchPropertyConfig(propertyId)
        ]);
    };

    const fetchLanguages = async (id: string) => {
        setLoadingLanguages(true);
        try {
            const response = await getPropertyLanguagesService(id);
            if (response.success && response.data) {
                setLanguages(response.data);
            }
        } catch (error) {
            console.error("Error fetching property languages:", error);
        } finally {
            setLoadingLanguages(false);
        }
    };
    const fetchPropertyConfig = async (id: string) => {
        if (!id) return;
        try {
            const response = await fetchPropertyConfigService(id);
            if (response.success) {
                setPropertyConfig(response.data);
            } else {
            }
        } catch (error) {
        } finally {
        }
    }

    const refreshPropertyConfig = () => {
        if (propertyId) {
            fetchPropertyConfig(propertyId);
        }
    }

    const refreshLanguages = () => {
        if (propertyId) {
            fetchLanguages(propertyId);
        }
    };

    return (
        <PropertyContext.Provider value={{ propertyId, languages, loadingLanguages, refreshLanguages, setCreationId, propertyCreationId, refreshPropertyConfig, propertyConfig, setPropertyConfig }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const usePropertyContext = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error("usePropertyContext must be used within a PropertyProvider");
    }
    return context;
};

/** Safe version — returns undefined instead of throwing when used outside PropertyProvider */
export const usePropertyContextSafe = () => {
    return useContext(PropertyContext);
};
