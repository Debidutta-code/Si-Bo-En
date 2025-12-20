
// import Loader from '@/components/Loader/Loader';
// import { useEffect, useState } from 'react';
// import { fetchAnaltyticsService, fetchPropertiesService } from "./services";
// import toast from 'react-hot-toast';
// import type { IAnalyticsData, IPropertyCodeAndIds , ILoader} from "./interface";
// import ReservationStats from './components/ReservationStats';
// import RevenueStats from './components/RevenueStats';
// import RoomStats from './components/RoomStats';
// import GuestStats from './components/GuestStats';
// import HousekeepingStats from './components/HousekeepingStats';
// import AdditionalStats from './components/AdditionalStats';
// // import TopPropertiesStats from './components/TopPropertiesStats';
// import { AlertCircle, RefreshCw, Building2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useAppSelector } from '@/redux/hooks';

// export default function Dashboard() {
//   const { user } = useAppSelector((state) => state.user);
//   const [loader, setLoader] = useState<ILoader>({
//     isLoading: true,
//     message: "Fetching Analytics ..."
//   });

//   const [analyticsData, setAnalyticsData] = useState<IAnalyticsData | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [allProperties, setAllProperties] = useState<IPropertyCodeAndIds[]>([])
//   const [selectedProperty, setSelectedProperty] = useState<IPropertyCodeAndIds>({
//     id: "",
//     code: "",
//     name: ""
//   })
//   useEffect(() => {
//     if(user?.role!="housekeeping"&&user?.role != "front_desk"){
//       fetchProperties();
//     }
//   }, []);


//   const handlePropertyChange = (propertyId: string) => {
//     const property = allProperties.find(p => p.id === propertyId);
//     if (property) {
//       setSelectedProperty(property);
//     }
//     fetchAnalytics(property?.id,property?.code,property?.name)
//   };

//   const fetchAnalytics = async (propertyId?:string,propertyCode?:string,propertyName?:string) => {
//     try {
//       setLoader({ isLoading: true, message: "Fetching Analytics ..." });
//       setError(null);

//       const response = await fetchAnaltyticsService(propertyId,propertyCode,propertyName);

//       if (response.success && response.data) {
//         setAnalyticsData(response.data.analytics);
//         // toast.success("Analytics fetched successfully");
//       } else {
//         setError(response.message || "Failed to fetch analytics");
//         toast.error(response.message || "Failed to fetch analytics");
//       }
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error("Error fetching analytics:", err);
//     } finally {
//       setLoader({ isLoading: false, message: "" });
//     }
//   };
//   const fetchProperties = async () => {
//     try {
//       setLoader({ isLoading: true, message: "Fetching Property Names ..." });
//       setError(null);

//       const response = await fetchPropertiesService();

//       if (response.success ) {
//         setAllProperties(response.data);
//        await fetchAnalytics()
//         // toast.success("Properties fetched successfully");
//       } else {
//         setError(response.message || "Failed to fetch analytics");
//         toast.error(response.message || "Failed to fetch analytics");
//       }
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
//       setError(errorMessage);
//       toast.error(errorMessage);
//       console.error("Error fetching properties:", err);
//     } finally {
//       setLoader({ isLoading: false, message: "" });
//     }
//   }

//   if (loader.isLoading) {
//     return (
//       <div className="min-h-screen w-full flex justify-center items-center">
//         <Loader text={loader.message} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen w-full flex justify-center items-center p-4">
//         <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <AlertCircle className="h-6 w-6 text-red-600" />
//             <h2 className="text-xl font-semibold text-red-800">Error Loading Analytics</h2>
//           </div>
//           <p className="text-red-700 mb-4">{error}</p>
//           <button
//             onClick={()=>{fetchAnalytics()}}
//             className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!analyticsData) {
//     return (
//       <div className="min-h-screen w-full flex justify-center items-center">
//         <div className="text-center">
//           <p className="text-muted-foreground mb-4">No analytics data available</p>
//           <button
//             onClick={()=>{fetchAnalytics()}}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//           >
//             Load Analytics
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen w-full bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto space-y-6">
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
//             <p className="text-sm text-muted-foreground mt-0.5">
//               Comprehensive overview of your property management system
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             {allProperties.length > 1 && (
//               <Select
//                 value={selectedProperty.id}
//                 onValueChange={handlePropertyChange}
//               >
//                 <SelectTrigger className="w-[200px]">
//                   <Building2 className="h-4 w-4 mr-2" />
//                   <SelectValue placeholder="Select Property" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {allProperties.map((property) => (
//                     <SelectItem key={property.id} value={property.id}>
//                       <div className="flex flex-col">
//                         <span className="font-medium">{property.name}</span>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//             <Button
//               onClick={()=>{fetchAnalytics()}}
//               variant={"terciary"}
//               className=" "
//             >
//               <RefreshCw className='h-3 mr-2 w-3' />
//               Refresh
//             </Button>
//           </div>
//         </div>

//         {/* Reservation Analytics */}
//         <ReservationStats data={analyticsData.reservation} />

//         {/* Revenue Analytics */}
//         <RevenueStats data={analyticsData.revenue} />

//         {/* Room Analytics */}
//         <RoomStats data={analyticsData.room} />

//         {/* Guest Analytics */}
//         <GuestStats data={analyticsData.guest} />

//         {/* Housekeeping Analytics */}
//         <HousekeepingStats data={analyticsData.housekeeping} />

//         {/* Additional Stats (Add-ons, Booking Sources, Payment Methods) */}
//         <AdditionalStats
//           addonData={analyticsData.addon}
//           bookingSourceData={analyticsData.bookingSource}
//           paymentMethodData={analyticsData.paymentMethod}
//         />

//         {/* Top Performing Properties (only shown for multi-property users) */}
//         {/* {analyticsData.topPerformingProperties && (
//           <TopPropertiesStats data={analyticsData.topPerformingProperties} />
//         )} */}
//       </div>
//     </div>
//   );
// }

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
};

function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <span
            className={`text-sm font-medium ${
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="p-4 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-gray-500">
          Performance overview for your property
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₹12,45,000" change="+8.2%" />
        <StatCard title="Total Bookings" value="1,284" change="+4.5%" />
        <StatCard title="Occupancy Rate" value="78%" change="-1.2%" />
        <StatCard title="ADR" value="₹4,350" change="+2.1%" />
      </div>

      {/* Charts / Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Block */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Revenue Trend</h2>
          <p className="text-sm text-gray-500 mb-4">
            Last 30 days revenue performance
          </p>

          {/* Placeholder for chart */}
          <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center text-gray-400">
            Revenue Chart
          </div>
        </div>

        {/* Booking Block */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Bookings Overview</h2>
          <p className="text-sm text-gray-500 mb-4">
            Booking volume & cancellations
          </p>

          {/* Placeholder for chart */}
          <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center text-gray-400">
            Booking Chart
          </div>
        </div>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Cancellation Rate</p>
          <p className="text-xl font-bold mt-2">6.3%</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Avg Length of Stay</p>
          <p className="text-xl font-bold mt-2">2.4 Nights</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">RevPAR</p>
          <p className="text-xl font-bold mt-2">₹3,390</p>
        </div>
      </div>
    </div>
  );
}