import { useParams } from "react-router-dom";
import { useState } from "react";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import { MapPin } from "lucide-react";
import { FilterSection, MappingsTable, UpdatePriceDialog, CreateMappingDialog } from "./components";
import { useMapRatePlan } from "./hooks";
import type { Charges } from "./types";

export default function MapRatePlan() {
    const { propertyId } = useParams<{ propertyId: string }>();
    const [editingMapping, setEditingMapping] = useState<Charges | null>(null);
    // const [isStartStopSellDialogOpen, setIsStartStopSellDialogOpen] = useState(false);

    const {
        charges,
        filters,
        setFilters,
        dateRange,
        ratePlans,
        roomTypes,
        isLoading,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        handleDateSelect,
        handleSearch,
        handleCreateMapping,
        handleSaveNewMapping,
        handleUpdateMapping,
        handleDeleteMapping,
        // Pagination props
        currentPage,
        totalPages,
        totalItems,
        handlePageChange,
    } = useMapRatePlan(propertyId);

    // const handleStartStopSell = async (data: ICStartStopSell & { isSellStop: boolean }) => {
    //     try {
    //         if (!propertyId) {
    //             return { success: false, message: "Property ID is required" };
    //         }
    //         const response = await useStartStopSellService(propertyId, data);
    //         if (response.success) {
    //             handleSearch(currentPage); // Refresh current page
    //         } else {
    //             toast.error(response.message || "Failed to process start/stop sell");
    //         }
    //         return response;
    //     } catch (error) {
    //         console.error("Start/Stop Sell Error:", error);
    //         toast.error("An error occurred");
    //     }
    // };

    if (isLoading && charges.length === 0) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <Loader text="Loading rate plans and room types..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                    <BackButton />
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Map Rate Plan</h1>
                                <p className="text-gray-600">Connect rate plans with room types and set pricing</p>
                            </div>
                        </div>
                     
                    </div>
                </div>

                {/* Filter Section Component */}
                <FilterSection
                    filters={filters}
                    setFilters={setFilters}
                    dateRange={dateRange}
                    handleDateSelect={handleDateSelect}
                    ratePlans={ratePlans}
                    roomTypes={roomTypes}
                    onSearch={() => handleSearch(1)} // Reset to page 1 on new search
                    onCreateMapping={handleCreateMapping}
                />

                {/* Mappings Table Component with Pagination Props */}
                <MappingsTable
                    mappings={charges}
                    onEdit={(mapping) => setEditingMapping(mapping)}
                    onDelete={handleDeleteMapping}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />

                {/* Update Price Dialog */}
                <UpdatePriceDialog
                    mapping={editingMapping}
                    open={!!editingMapping}
                    onOpenChange={(open) => !open && setEditingMapping(null)}
                    onSave={handleUpdateMapping}
                />

                {/* Create Mapping Dialog */}
                <CreateMappingDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSave={handleSaveNewMapping}
                    ratePlans={ratePlans}
                    roomTypes={roomTypes}
                    filters={filters}
                />

                {/* Start/Stop Sell Dialog */}
                {/* <StartStopSellDialog
                    open={isStartStopSellDialogOpen}
                    onOpenChange={setIsStartStopSellDialogOpen}
                    onSave={handleStartStopSell}
                    ratePlans={ratePlans}
                    roomTypes={roomTypes.map(rt => ({ id:rt.id, roomTypeCode: rt.roomType, roomTypeName: rt.roomName }))}
                /> */}
            </div>
        </div>
    );
}