import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';
import StatusPieChart from './StatusPieChart';
import type { IReservationAnalytics } from '../interface';
import { useTranslation } from 'react-i18next';

interface ReservationStatsProps {
  data: IReservationAnalytics;
}

export default function ReservationStats({ data }: ReservationStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('DashboardStats.reservationOverview')}        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('DashboardStats.totalReservations')}
          value={data?.totalReservations}
          icon={Calendar}
          description={t('DashboardStats.allTimeBookings')}
        />
        <StatCard
          title={t('DashboardStats.todaysCheckIns')}
          value={data?.todayCheckIns}
          icon={TrendingUp}
          description={t('DashboardStats.arrivalsToday')}
        />
        <StatCard
          title={t('DashboardStats.todaysCheckOuts')}
          value={data?.todayCheckOuts}
          icon={TrendingUp}
          description={t('DashboardStats.departuresToday')}
        />
        <StatCard
          title={t('DashboardStats.upcomingReservations')}
          value={data?.upcomingReservations}
          icon={Calendar}
          description={t('DashboardStats.next7Days')}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('DashboardStats.totalGuests')}
          value={data?.totalGuests}
          icon={Users}
          description={t('DashboardStats.allGuests')}
        />
        <StatCard
          title={t('DashboardStats.avgStayDuration')}
          value={`${data?.averageStayDuration} ${t('DashboardStats.nights')}`}
          icon={Clock}
          description={t('DashboardStats.averageBookingLength')}
        />
        <StatCard
          title={t('DashboardStats.avgGuestsPerBooking')}
          value={data?.averageGuestsPerBooking}
          icon={Users}
          description={t('DashboardStats.perReservation')}
        />
        <StatCard
          title={t('DashboardStats.cancellationRate')}
          value={`${data?.cancellationRate}%`}
          icon={TrendingUp}
          description={t('DashboardStats.allTimeCancellationRate')}
        />
      </div>

      {/* Status Breakdown with Pie Chart */}
      <StatusPieChart
        data={data?.statusBreakdown.map((status, index) => {
          const colors = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];
          return {
            label: t(`BookingStatus.${status.status}`),
            value: status.count,
            color: colors[index % colors.length]
          };
        })}
        title={t('DashboardStats.reservationStatusDistribution')}
      />
    </div>
  );
}
