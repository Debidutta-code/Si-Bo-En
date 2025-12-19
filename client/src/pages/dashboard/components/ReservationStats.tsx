import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';
import StatusPieChart from './StatusPieChart';
import type { IReservationAnalytics } from '../interface';

interface ReservationStatsProps {
  data: IReservationAnalytics;
}

export default function ReservationStats({ data }: ReservationStatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Reservation Overview
        </h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reservations"
          value={data?.totalReservations}
          icon={Calendar}
          description="All time bookings"
        />
        <StatCard
          title="Today's Check-ins"
          value={data?.todayCheckIns}
          icon={TrendingUp}
          description="Arrivals today"
        />
        <StatCard
          title="Today's Check-outs"
          value={data?.todayCheckOuts}
          icon={TrendingUp}
          description="Departures today"
        />
        <StatCard
          title="Upcoming Reservations"
          value={data?.upcomingReservations}
          icon={Calendar}
          description="Next 7 days"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Guests"
          value={data?.totalGuests}
          icon={Users}
          description="All guests"
        />
        <StatCard
          title="Avg Stay Duration"
          value={`${data?.averageStayDuration} nights`}
          icon={Clock}
          description="Average booking length"
        />
        <StatCard
          title="Avg Guests/Booking"
          value={data?.averageGuestsPerBooking}
          icon={Users}
          description="Per reservation"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${data?.cancellationRate}%`}
          icon={TrendingUp}
          description={`${data?.last30DaysBookings} bookings last 30 days`}
        />
      </div>

      {/* Status Breakdown with Pie Chart */}
      <StatusPieChart
        data={data?.statusBreakdown.map((status, index) => {
          const colors = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];
          return {
            label: status.status.replace('_', ' '),
            value: status.count,
            color: colors[index % colors.length]
          };
        })}
        title="Reservation Status Distribution"
      />
    </div>
  );
}
