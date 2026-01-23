import Loader from '@/components/Loader/Loader';
import { useEffect, useState } from 'react';
import { fetchAnaltyticsService, fetchPropertiesService, fetchStatisticsComparisonService } from "./services";
import toast from 'react-hot-toast';
import type { IAnalyticsData, IPropertyCodeAndIds, ILoader, IStatisticsComparison } from "./interface";
import ReservationStats from './components/ReservationStats';
import RevenueStats from './components/RevenueStats';
// import GuestStats from './components/GuestStats';
import AdditionalStats from './components/AdditionalStats';
import TopPropertiesStats from './components/TopPropertiesStats';
import StatisticsStats from './components/StatisticsStats'; // 🆕 NEW IMPORT
import { AlertCircle, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from '@/redux/hooks';

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.user);
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Fetching Analytics ..."
  });

  const [analyticsData, setAnalyticsData] = useState<IAnalyticsData | null>(null);
  const [statisticsData, setStatisticsData] = useState<IStatisticsComparison | null>(null); // 🆕 NEW STATE
  const [comparisonType, setComparisonType] = useState<'date' | 'month' | 'year'>('month'); // 🆕 NEW STATE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // 🆕 NEW STATE
  const [error, setError] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<IPropertyCodeAndIds[]>([])
  const [selectedProperty, setSelectedProperty] = useState<IPropertyCodeAndIds>({
    id: "",
    code: "",
    name: ""
  })
  
  useEffect(() => {
    if(user?.role!="housekeeping"&&user?.role != "front_desk"){
      fetchProperties();
    }
  }, []);

  // 🆕 NEW: Fetch statistics when comparison type or date changes
useEffect(() => {
  // Always fetch statistics when comparison type or date changes
  // regardless of property selection
  if (allProperties.length > 0 || !selectedProperty.id) {
    fetchStatistics(selectedProperty?.id, selectedProperty?.code, selectedProperty?.name);
  }
}, [comparisonType, selectedDate, selectedProperty.id]);

const handlePropertyChange = (propertyId: string) => {
  if (propertyId === "all") {
    // Reset to show all properties
    setSelectedProperty({ id: "", code: "", name: "" });
    fetchAnalytics();
    fetchStatistics();
  } else {
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      fetchAnalytics(property?.id, property?.code, property?.name);
      fetchStatistics(property?.id, property?.code, property?.name);
    }
  }
};

  // 🆕 NEW FUNCTION: Fetch Statistics Comparison
  const fetchStatistics = async (propertyId?: string, propertyCode?: string, propertyName?: string) => {
    try {
      setError(null);

      const response = await fetchStatisticsComparisonService(
        comparisonType,
        selectedDate.toISOString(),
        propertyId,
        propertyCode,
        propertyName
      );

      if (response.success && response.data) {
        setStatisticsData(response.data);
      } else {
        setError(response.message || "Failed to fetch statistics");
        toast.error(response.message || "Failed to fetch statistics");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching statistics:", err);
    }
  };

  const fetchAnalytics = async (propertyId?:string, propertyCode?:string, propertyName?:string) => {
    try {
      setLoader({ isLoading: true, message: "Fetching Analytics ..." });
      setError(null);

      const response = await fetchAnaltyticsService(propertyId, propertyCode, propertyName);

      if (response.success && response.data) {
        setAnalyticsData(response.data.analytics);
        toast.success("Analytics fetched successfully");
      } else {
        setError(response.message || "Failed to fetch analytics");
        toast.error(response.message || "Failed to fetch analytics");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching analytics:", err);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };
  
const fetchProperties = async () => {
  try {
    setLoader({ isLoading: true, message: "Fetching Property Names ..." });
    setError(null);

    const response = await fetchPropertiesService();

    if (response.success) {
      setAllProperties(response.data);
      
      // ✅ Fetch analytics without property filter
      await fetchAnalytics();
      await fetchStatistics();
    } else {
      setError(response.message || "Failed to fetch properties");
      toast.error(response.message || "Failed to fetch properties");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    setError(errorMessage);
    toast.error(errorMessage);
    console.error("Error fetching properties:", err);
  } finally {
    setLoader({ isLoading: false, message: "" });
  }
}

  if (loader.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Error Loading Analytics</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={()=>{
              fetchAnalytics();
              fetchStatistics(); // 🆕 NEW
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analytics data available</p>
          <button
            onClick={()=>{
              fetchAnalytics();
              fetchStatistics(); // 🆕 NEW
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Load Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Comprehensive overview of your property management system
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 🆕 NEW: Comparison Type Selector */}
            <Select
              value={comparisonType}
              onValueChange={(value: 'date' | 'month' | 'year') => setComparisonType(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>

            {/* 🆕 NEW: Date/Month Picker */}
            <input
              type={comparisonType === 'date' ? 'date' : 'month'}
              value={comparisonType === 'date' 
                ? selectedDate.toISOString().split('T')[0]
                : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`
              }
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border rounded-md text-sm"
            />

            {allProperties.length > 1 && (
  <Select
    value={selectedProperty.id || "all"}
    onValueChange={handlePropertyChange}
  >
    <SelectTrigger className="w-[200px]">
      <Building2 className="h-4 w-4 mr-2" />
      <SelectValue placeholder="Select All" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Select All</SelectItem>
      {allProperties.map((property) => (
        <SelectItem key={property.id} value={property.id}>
          <div className="flex flex-col">
            <span className="font-medium">{property.name}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
            <Button
              onClick={()=>{
                if (selectedProperty.id) {
                  fetchAnalytics(selectedProperty.id, selectedProperty.code, selectedProperty.name);
                  fetchStatistics(selectedProperty.id, selectedProperty.code, selectedProperty.name); // 🆕 NEW
                } else {
                  fetchAnalytics();
                  fetchStatistics(); // 🆕 NEW
                }
              }}
              variant={"terciary"}
            >
              <RefreshCw className='h-3 mr-2 w-3' />
              Refresh
            </Button>
          </div>
        </div>

        {/* 🆕 NEW: Statistics Comparison Section */}
        {statisticsData && <StatisticsStats data={statisticsData} />}

        {/* Reservation Analytics */}
        <ReservationStats data={analyticsData.reservation} />

        {/* Revenue Analytics */}
        <RevenueStats data={analyticsData.revenue} />

        {/* Guest Analytics */}
        {/* <GuestStats data={analyticsData.guest} /> */}

        {/* Additional Stats */}
        <AdditionalStats
          addonData={analyticsData.addon}
          bookingSourceData={analyticsData.bookingSource}
          paymentMethodData={analyticsData.paymentMethod}
        />

        {/* Top Performing Properties */}
        {analyticsData.topPerformingProperties && (
          <TopPropertiesStats data={analyticsData.topPerformingProperties} />
        )}
      </div>
    </div>
  );
}