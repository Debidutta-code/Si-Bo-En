import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import RevenueChart from './RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IRevenueAnalytics } from '../interface';

interface RevenueStatsProps {
  data: IRevenueAnalytics;
}

export default function RevenueStats({ data }: RevenueStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const growthIsPositive = parseFloat(data?.monthOverMonthGrowth) >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Revenue Analytics
        </h2>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue)}
          icon={DollarSign}
          description="All time"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(data?.todayRevenue)}
          icon={TrendingUp}
          description="Revenue today"
        />
        <StatCard
          title="This Week"
          value={formatCurrency(data?.weekRevenue)}
          icon={TrendingUp}
          description="Last 7 days"
        />
        <StatCard
          title="This Month"
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
          title="RevPAR"
          value={formatCurrency(data?.revPAR)}
          icon={DollarSign}
          description="Revenue per available room"
        />
        <StatCard
          title="Avg Booking Value"
          value={formatCurrency(data?.averageRevenuePerBooking)}
          icon={CreditCard}
          description="Per reservation"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(data?.pendingPayments.amount)}
          icon={AlertCircle}
          description={`${data?.pendingPayments.count} payments pending`}
          className="border-orange-200"
        />
        <StatCard
          title="Last Month"
          value={formatCurrency(data?.lastMonthRevenue)}
          icon={DollarSign}
          description="Previous month revenue"
        />
      </div>

      {/* Last 7 Days Revenue Trend with Chart */}
      <RevenueChart data={data?.last7DaysTrend} />

      {/* Payment Status Breakdown */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Payment Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.paymentStatusBreakdown.map((payment) => (
              <div key={payment.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{payment.status}</span>
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {payment.count} payments
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      payment.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                      payment.status === 'pending' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ 
                      width: `${(payment.amount / data?.totalRevenue * 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
