// import { Home, Bed, CheckCircle, DoorOpen, AlertTriangle } from 'lucide-react';
// import StatCard from './StatCard';
// import ProgressBarChart from './ProgressBarChart';
// import { Card, CardContent } from '@/components/ui/card';
// import type { IRoomAnalytics } from '../interface';

// interface RoomStatsProps {
//   data: IRoomAnalytics;
// }

// export default function RoomStats({ data }: RoomStatsProps) {
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2">
//         <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
//           <Home className="h-5 w-5 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//           Room Analytics
//         </h2>
//       </div>

//       <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="Total Rooms"
//           value={data?.totalRooms}
//           icon={Bed}
//           description="Total inventory"
//         />
//         <StatCard
//           title="Occupied Rooms"
//           value={data?.occupiedRooms}
//           icon={CheckCircle}
//           description={`${data?.checkedInRooms} checked in, ${data?.reservedRooms} reserved`}
//         />
//         <StatCard
//           title="Available Rooms"
//           value={data?.availableRooms}
//           icon={DoorOpen}
//           description="Ready to book"
//         />
//         <StatCard
//           title="Occupancy Rate"
//           value={`${data?.occupancyRate}%`}
//           icon={Bed}
//           description={`${data?.dirtyRooms} rooms need cleaning`}
//         />
//       </div>

//       {/* Room Type Occupancy with Progress Chart */}
//       <ProgressBarChart
//         data={data?.roomTypeOccupancy.map((roomType) => ({
//           label: roomType.roomName,
//           value: roomType.occupiedRooms,
//           total: roomType.totalRooms,
//           color: '#3b82f6'
//         }))}
//         title="Room Type Occupancy"
//       />

//       {data?.tentativeRooms > 0 && (
//         <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
//           <CardContent className="pt-6">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-yellow-600" />
//               <span className="font-semibold text-yellow-800">
//                 {data?.tentativeRooms} rooms have tentative bookings
//               </span>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
