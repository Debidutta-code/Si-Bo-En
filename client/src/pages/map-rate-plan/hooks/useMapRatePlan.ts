import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import type { IFilterProps, RatePlan, RoomTypes, Charges, ICreateCharges, IUpdatedCharges } from "../types";
import { 
    fetchRatePlansService, 
    fetchRoomTypesService, 
    createMappingService,
    getMappedRatePlansService,
    updateMappedPriceService 
} from "../services";

export function useMapRatePlan(propertyId: string | undefined) {
    const [charges, setCharges] = useState<Charges[]>([]);
    const [filters, setFilters] = useState<IFilterProps>({
        roomTypeCode: "",
        ratePlanCode: "",
        startDate: "",
        endDate: "",
    });
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined; 
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined,
    });
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (propertyId) {
            fetchInitialData();
            handleSearch(1); // Fetch initial data on mount
        }
    }, [propertyId]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);

            const [ratePlansRes, roomTypesRes] = await Promise.all([
                fetchRatePlansService(propertyId!),
                fetchRoomTypesService(propertyId!),
            ]);

            if (ratePlansRes.success) {
                setRatePlans(ratePlansRes.data || []);
            } else {
                toast.error(ratePlansRes.message || "Failed to fetch rate plans");
            }

            if (roomTypesRes.success) {
                setRoomTypes(roomTypesRes.data || []);
            } else {
                toast.error(roomTypesRes.message || "Failed to fetch room types");
            }
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
        setDateRange(range);
        if (range.from && range.to) {
            setFilters({
                ...filters,
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.to, "yyyy-MM-dd"),
            });
        }
    };

    const handleSearch = async (page: number = 1) => {
        if (!propertyId) {
            toast.error("Property ID is missing");
            return;
        }

        try {
            setIsLoading(true);
            const response = await getMappedRatePlansService(propertyId, filters, page);
            
            // console.log("API Response:", response);

            if (response.success && response.data) {
                setCharges(response.data.data || []);
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalResults);
                
                // Only show success toast when user manually searches, not on initial load
                if (page > 1 || filters.ratePlanCode || filters.roomTypeCode) {
                    toast.success(`Found ${response.data.pagination.totalResults || 0} mapped rate plans`);
                }
            } else {
                toast.error(response.message || "Failed to fetch mapped rate plans");
                setCharges([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to search mappings");
            setCharges([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        // console.log("Page change requested:", page);
        setCurrentPage(page);
        handleSearch(page);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCreateMapping = () => {
        setIsCreateDialogOpen(true);
    };

    const handleSaveNewMapping = async (newMapping: ICreateCharges) => {
        try {
            const ratePlan = ratePlans.find(rp => rp.ratePlanCode === newMapping.ratePlanCode);
            const roomType = roomTypes.find(rt => rt.roomType === newMapping.roomTypeCode);

            if (!ratePlan || !roomType) {
                toast.error("Rate plan or room type not found");
                return;
            }

            const response = await createMappingService(
                propertyId!,
                newMapping,
                ratePlan.ratePlanName,
                roomType.roomName
            );

            if (response.success) {
                toast.success("Mapping created successfully!");
                setIsCreateDialogOpen(false);
                // Refresh current page after creating
                handleSearch(currentPage);
            } else {
                toast.error(response.message || "Failed to create mapping");
            }
        } catch (error) {
            toast.error("Failed to create mapping");
        }
    };

    const handleUpdateMapping = async (updatedMapping: IUpdatedCharges) => {
        try {
            const response = await updateMappedPriceService(
                updatedMapping.id,
                updatedMapping.baseGuestAmounts,
                updatedMapping.additionalGuestAmounts
            );

            if (response.success) {
                // Update the charges array with the updated mapping
                setCharges((prevCharges) =>
                    prevCharges.map((charge) =>
                        charge.id === updatedMapping.id ? { ...charge, ...updatedMapping } : charge
                    )
                );
                toast.success("Price updated successfully!");
            } else {
                toast.error(response.message || "Failed to update price");
            }
        } catch (error) {
            toast.error("Failed to update price");
        }
    };

    const handleDeleteMapping = async (mapping: Charges) => {
        // Remove the mapping from the charges array
        setCharges((prevCharges) => prevCharges.filter((charge) => charge.id !== mapping.id));
        toast.success("Mapping deleted successfully!");
        
        // Refresh current page after deletion
        await handleSearch(currentPage);
    };

    return {
        // State
        charges,
        setCharges,
        filters,
        setFilters,
        dateRange,
        ratePlans,
        roomTypes,
        isLoading,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        
        // Pagination state
        currentPage,
        totalPages,
        totalItems,

        // Handlers
        handleDateSelect,
        handleSearch,
        handlePageChange,
        handleCreateMapping,
        handleSaveNewMapping,
        handleUpdateMapping,
        handleDeleteMapping,
    };
}