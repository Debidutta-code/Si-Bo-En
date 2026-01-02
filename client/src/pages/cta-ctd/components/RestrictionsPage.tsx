// pages/Restrictions.tsx

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { format } from "date-fns";
import RestrictionTable from "../components/RestrictionTable";
import RestrictionForm from "../components/RestrictionForm";
import RestrictionFiltersComponent from "../components/RestrictionFilters";
import {
    fetchRestrictionsService,
    fetchRoomTypesService,
    fetchRatePlansService
} from "../services";
import type {
    Restriction,
    RestrictionFilters,
    RoomType,
    RatePlan
} from "../interfaces";

interface RestrictionsPageProps {
    propertyId: string;
    propertyCode: string;
}

export default function RestrictionsPage({ propertyId, propertyCode }: RestrictionsPageProps) {
    const [restrictions, setRestrictions] = useState<Restriction[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<Restriction | null>(null);
    const [filters, setFilters] = useState<RestrictionFilters>({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), "yyyy-MM-dd")
    });

    useEffect(() => {
        if (propertyId && propertyCode) {
            fetchInitialData();
        }
    }, [propertyId, propertyCode]);

    useEffect(() => {
        if (propertyCode && !showForm) {
            fetchRestrictions();
        }
    }, [filters, propertyCode, showForm]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [roomTypesRes, ratePlansRes] = await Promise.all([
                fetchRoomTypesService(propertyId),
                fetchRatePlansService(propertyId)
            ]);

            if (roomTypesRes.success) {
                setRoomTypes(roomTypesRes.data || []);
            } else {
                toast.error(roomTypesRes.message || "Failed to load room types");
            }

            if (ratePlansRes.success) {
                setRatePlans(ratePlansRes.data || []);
            } else {
                toast.error(ratePlansRes.message || "Failed to load rate plans");
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Failed to load property data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRestrictions = async () => {
        setIsLoading(true);
        try {
            const response = await fetchRestrictionsService(propertyCode, filters);

            if (response.success) {
                // Filter out past dates and sort by date
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const futureRestrictions = (response.data || [])
                    .filter((r: Restriction) => new Date(r.date) >= today)
                    .sort((a: Restriction, b: Restriction) => 
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                setRestrictions(futureRestrictions);
            } else {
                toast.error(response.message || "Failed to load restrictions");
            }
        } catch (error) {
            console.error("Error fetching restrictions:", error);
            toast.error("Failed to load restrictions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditData(null);
        setShowForm(true);
    };

    const handleEdit = (restriction: Restriction) => {
        setEditData(restriction);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditData(null);
        fetchRestrictions();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditData(null);
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), "yyyy-MM-dd")
        });
    };

    if (isLoading && roomTypes.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CTA/CTD Restrictions</h1>
                    <p className="text-gray-600 mt-1">
                        Manage Closed to Arrival and Closed to Departure restrictions
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={handleCreateClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Restriction
                    </Button>
                )}
            </div>

            {/* Form or Table View */}
            {showForm ? (
                <RestrictionForm
                    propertyCode={propertyCode}
                    roomTypes={roomTypes}
                    ratePlans={ratePlans}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                    editData={editData}
                />
            ) : (
                <>
                    {/* Filters */}
                    <RestrictionFiltersComponent
                        filters={filters}
                        onFilterChange={setFilters}
                        roomTypes={roomTypes}
                        ratePlans={ratePlans}
                        onReset={handleResetFilters}
                    />

                    {/* Table */}
                    <RestrictionTable
                        restrictions={restrictions}
                        onEdit={handleEdit}
                        isLoading={isLoading}
                    />
                </>
            )}
        </div>
    );
}