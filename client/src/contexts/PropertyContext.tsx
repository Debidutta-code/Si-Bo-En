import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPropertyLanguagesService } from '@/pages/property/property/services/property-language.services';
import type { IPropertyActiveLanguage } from '@/pages/property/property/types';

interface PropertyContextType {
    propertyId: string | null;
    languages: IPropertyActiveLanguage[];
    loadingLanguages: boolean;
    refreshLanguages: () => void;
    setCreationId: React.Dispatch<React.SetStateAction<string>>;
    propertyCreationId: string;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [propertyId, setPropertyId] = useState<string | null>(null);
    const [languages, setLanguages] = useState<IPropertyActiveLanguage[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState<boolean>(false);
    const [propertyCreationId,setCreationId]=useState<string>("")

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
            fetchLanguages(propertyId);
        }
    }, [propertyId]);

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

    const refreshLanguages = () => {
        if (propertyId) {
            fetchLanguages(propertyId);
        }
    };

    return (
        <PropertyContext.Provider value={{ propertyId, languages, loadingLanguages, refreshLanguages,setCreationId, propertyCreationId}}>
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
