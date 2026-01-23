// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// interface DayRevenue {
//   date: string;
//   revenue: number;
// }

// interface RevenueChartProps {
//   data: DayRevenue[];
// }

// export default function RevenueChart({ data }: RevenueChartProps) {
//   const maxRevenue = Math.max(...data.map(d => d.revenue));
  
//   return (
//     <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
//       <CardHeader>
//         <CardTitle className="text-lg text-green-800">Revenue Trend (Last 7 Days)</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-end justify-between gap-2 h-48">
//           {data.map((day, index) => {
//             const height = (day.revenue / maxRevenue) * 100;
//             const colors = [
//               'bg-gradient-to-t from-green-600 to-green-400',
//               'bg-gradient-to-t from-blue-600 to-blue-400',
//               'bg-gradient-to-t from-purple-600 to-purple-400',
//               'bg-gradient-to-t from-pink-600 to-pink-400',
//               'bg-gradient-to-t from-orange-600 to-orange-400',
//               'bg-gradient-to-t from-primary to-primary/80',
//               'bg-gradient-to-t from-indigo-600 to-indigo-400',
//             ];
            
//             return (
//               <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
//                 <div className="relative w-full group">
//                   <div
//                     className={`w-full rounded-t-lg ${colors[index]} transition-all duration-500 hover:opacity-80 cursor-pointer shadow-lg`}
//                     style={{ height: `${Math.max(height, 5)}%` }}
//                   >
//                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
//                       ${day.revenue.toLocaleString()}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-xs text-center font-medium text-gray-700">
//                   {new Date(day.date).toLocaleDateString('en-US', { 
//                     month: 'short', 
//                     day: 'numeric' 
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
