import { TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
// import RevenueChart from './RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IRevenueAnalytics } from '../interface';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { useTranslation } from 'react-i18next';

interface RevenueStatsProps {
  data: IRevenueAnalytics;
  currencyCode: CurrencyCode
}

export default function RevenueStats({ data, currencyCode }: RevenueStatsProps) {
    const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    const symbol = currencyCode;  // or import formatCurrency from utils
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const growthIsPositive = parseFloat(data?.monthOverMonthGrowth) >= 0;
  const CurrencyIcon = getCurrencySymbol(currencyCode)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg flex items-center justify-center w-9 h-9">
          <span className="text-white font-bold text-sm leading-none">
            {CurrencyIcon}
          </span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          {t('DashboardStats.revenueAnalytics')}
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('DashboardStats.totalRevenue')}
          value={formatCurrency(data?.totalRevenue)}
          customIcon={CurrencyIcon}
          description={t('DashboardStats.allTime')}
        />
         <StatCard
          title={t('DashboardStats.todaysRevenue')}
          value={formatCurrency(data?.todayRevenue)}
          icon={TrendingUp}
          description={t('DashboardStats.revenueToday')}
        />
        <StatCard
          title={t('DashboardStats.thisWeek')}
          value={formatCurrency(data?.weekRevenue)}
          icon={TrendingUp}
          description={t('DashboardStats.last7Days')}
        />
        <StatCard
          title={t('DashboardStats.thisMonth')}
          value={formatCurrency(data?.monthRevenue)}
          icon={TrendingUp}
          trend={{
            value: data?.monthOverMonthGrowth,
            isPositive: growthIsPositive
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('DashboardStats.revPAR')}
          value={formatCurrency(data?.revPAR)}
          customIcon={CurrencyIcon}
          description={t('DashboardStats.revenuePerAvailableRoom')}
        />
        <StatCard
          title={t('DashboardStats.avgBookingValue')}
          value={formatCurrency(data?.averageRevenuePerBooking)}
          icon={CreditCard}
          description={t('DashboardStats.perReservation')}
        />
        <StatCard
          title={t('DashboardStats.pendingPayments')}
          value={formatCurrency(data?.pendingPayments.amount)}
          icon={AlertCircle}
          description={t('DashboardStats.paymentsPending', { count: data?.pendingPayments.count })}
          className="border-orange-200"
        />
        <StatCard
          title={t('DashboardStats.lastMonth')}
          value={formatCurrency(data?.lastMonthRevenue)}
          customIcon={CurrencyIcon}
          description={t('DashboardStats.previousMonthRevenue')}
        />
      </div>

      {/* Last 7 Days Revenue Trend with Chart */}
      {/* <RevenueChart data={data?.last7DaysTrend} /> */}

      {/* Payment Status Breakdown */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
    <CardTitle className="text-xl font-bold">{t('DashboardStats.paymentStatusBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.paymentStatusBreakdown.map((payment) => {
              // Calculate max amount to normalize bar widths
              const maxAmount = Math.max(...(data?.paymentStatusBreakdown.map(p => p.amount) || [0]));
              const percentage = maxAmount > 0 ? (payment.amount / maxAmount * 100) : 0;

              return (
                <div key={payment.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{t(`BookingStatus.${payment.status}`)}</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
              {payment.count} {t('DashboardStats.bookingsLabel')}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${payment.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        payment.status === 'pending' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
