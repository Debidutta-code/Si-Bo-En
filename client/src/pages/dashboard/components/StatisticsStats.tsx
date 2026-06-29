import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown } from 'lucide-react';

interface IStatisticMetric {
  current: number;
  previous: number;
  percentageChange: number;
}

interface IComparisonPeriod {
  current: {
    start: string;
    end: string;
    label: string;
  };
  previous: {
    start: string;
    end: string;
    label: string;
  };
}

interface IStatisticsComparison {
  bookings: IStatisticMetric;
  cancelledBookings: IStatisticMetric;
  revenue: IStatisticMetric;
  averageBookingValue: IStatisticMetric;
  roomNights: IStatisticMetric;
  period: IComparisonPeriod;
}

interface StatisticsStatsProps {
  data: IStatisticsComparison;
  currencyCode: CurrencyCode;
}
import { useTranslation } from "react-i18next";

const StatCard = ({
  title,
  metric,
  period,
  format = 'number',
  currency
}: {
  title: string;
  metric: IStatisticMetric;
  period: IComparisonPeriod;
  format?: 'number' | 'currency';
  currency?: CurrencyCode;
}) => {
  const formatValue = (value: number) => {
    if (format === 'currency') {
      const symbol = currency ?? 'USD';
      return `${symbol} ${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return value.toLocaleString('en-US');
  };

  const isPositive = metric.percentageChange > 0;
  const isNegative = metric.percentageChange < 0;

  // Extract short labels from period
  const getPeriodLabel = (label: string) => {
    const monthMatch = label.match(/^(\w+)\s+(\d{4})$/);
    if (monthMatch) {
      return monthMatch[1].slice(0, 3);
    }
    const rangeMatch = label.match(/(\d{4})/g);
    if (rangeMatch && rangeMatch.length >= 1) {
      return rangeMatch[rangeMatch.length - 1];
    }

    return label;
  };

  const previousLabel = getPeriodLabel(period.previous.label);
  const currentLabel = getPeriodLabel(period.current.label);

  // Calculate bar heights as percentages
  const maxValue = Math.max(metric.current, metric.previous);
  const currentHeight = maxValue > 0 ? (metric.current / maxValue) * 100 : 0;
  const previousHeight = maxValue > 0 ? (metric.previous / maxValue) * 100 : 0;

  // Get descriptive label based on card title
  const getDescriptiveLabel = () => {
    switch (title) {
      case 'Bookings':
        return `${formatValue(metric.current)} Bookings`;
      case 'Revenue':
        return `${formatValue(metric.current)}`;
      case 'Average Booking Value':
        return `Avg ${formatValue(metric.current)}`;
      case 'Cancellation Rate':
        return `${formatValue(metric.current)} Cancelled`;
      case 'Room Nights':
        return `${formatValue(metric.current)} Room Booked`;
      default:
        return formatValue(metric.current);
    }
  };
  return (
    <div className="bg-white rounded-lg border p-4 space-y-2 min-w-0 overflow-hidden">
      {/* Title */}
      <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
        {title}
      </h3>

      {/* Bar Chart */}
      <div className='pt-2'>
        <div className="flex items-end justify-center gap-4 h-24">
          {/* Previous Period */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className="relative h-16 w-5 flex items-end">
              {metric.previous > 0 && (
                <div
                  className="w-full bg-gray-500 transition-all duration-500"
                  style={{ height: `${previousHeight}%` }}
                />
              )}
            </div>
            <span className="text-[10px] text-gray-600">{previousLabel}</span>
            <span className="text-[10px] font-semibold text-gray-700 text-center break-all">
              {formatValue(metric.previous)}
            </span>
          </div>

          {/* Current Period */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className="relative h-16 w-5 flex items-end">
              {metric.current > 0 && (
                <div
                  className="w-full bg-green-500 transition-all duration-500"
                  style={{ height: `${currentHeight}%` }}
                />
              )}
            </div>
            <span className="text-[10px] text-gray-600">{currentLabel}</span>
            <span className="text-[10px] font-semibold text-gray-700 text-center break-all">
              {formatValue(metric.current)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Value with Descriptive Label */}
      <div className="text-center pt-1.5 border-t">
        <div className="text-xs font-semibold text-gray-900 break-all leading-tight">
          {getDescriptiveLabel()}
        </div>
      </div>

      {/* Percentage Change */}
      <div className={`flex items-center justify-center gap-1 text-xs font-semibold flex-wrap ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
      }`}>
        {isPositive ? (
          <>
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span>{'+' }{metric.percentageChange.toFixed(2)}%</span>
            <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
          </>
        ) : isNegative ? (
          <>
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
            <span>{metric.percentageChange.toFixed(2)}%</span>
            <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
          </>
        ) : (
          <span>0.00%</span>
        )}
      </div>
    </div>
  );
};

export default function StatisticsStats({ data, currencyCode }: StatisticsStatsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('Dashboard.statistics')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('Dashboard.comparison', { previous: data.period.previous.label, current: data.period.current.label })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title={t('Dashboard.totalBookings')} metric={data.bookings} period={data.period} format="number" />
        <StatCard title={t('DashboardStats.totalRevenue')} metric={data.revenue} period={data.period} format="currency" currency={currencyCode} />
        <StatCard title={t('DashboardStats.avgBookingValue')} metric={data.averageBookingValue} period={data.period} format="currency" currency={currencyCode} />
        <StatCard title={t('DashboardStats.cancellationRate')} metric={data.cancelledBookings} period={data.period} format="number" />
        <StatCard title={t('DashboardStats.totalReservations')} metric={data.roomNights} period={data.period} format="number" />
      </div>
    </div>
  );
}