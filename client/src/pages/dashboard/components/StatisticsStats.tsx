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
}

const StatCard = ({
  title,
  metric,
   period,
  format = 'number',
  currency = 'AED'
}: {
  title: string;
  metric: IStatisticMetric;
  period: IComparisonPeriod;
  format?: 'number' | 'currency';
  currency?: string;
}) => {
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('en-US');
  };

  const isPositive = metric.percentageChange > 0;
  const isNegative = metric.percentageChange < 0;

  // Extract short labels from period (e.g., "November 2025" -> "2025")
  const getPeriodLabel = (label: string) => {
    // If it's a month-year format like "December 2025"
    const monthMatch = label.match(/^(\w+)\s+(\d{4})$/);
    if (monthMatch) {
      return monthMatch[2]; // Return just the year for cleaner display
    }
    
    // If it's a range format like "Nov 2024 - Oct 2025"
    const rangeMatch = label.match(/(\d{4})/g);
    if (rangeMatch && rangeMatch.length >= 1) {
      return rangeMatch[rangeMatch.length - 1]; // Return the last year
    }
    
    return label;
  };

  const previousLabel = getPeriodLabel(period.previous.label);
  const currentLabel = getPeriodLabel(period.current.label);

  // Calculate bar heights as percentages
  const maxValue = Math.max(metric.current, metric.previous);
  const currentHeight = maxValue > 0 ? (metric.current / maxValue) * 100 : 0;
  const previousHeight = maxValue > 0 ? (metric.previous / maxValue) * 100 : 0;
  
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {title}
      </h3>

      {/* Bar Chart */}
<div className='pt-2'>
    <div className="flex items-end justify-center gap-12 h-32">
  {/* Previous Period */}
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-24 w-8 flex items-end">
      {metric.previous > 0 && (
        <div
          className="w-full bg-gray-500 transition-all duration-500"
          style={{ height: `${previousHeight}%` }}
        />
      )}
    </div>
    <span className="text-xs text-gray-600">{previousLabel}</span>
    <span className="text-sm font-semibold text-gray-700">
      {formatValue(metric.previous)}
    </span>
  </div>

  {/* Current Period */}
  <div className="flex flex-col items-center gap-2">
    <div className="relative h-24 w-8 flex items-end">
      {metric.current > 0 && (
        <div
          className="w-full bg-green-500 transition-all duration-500"
          style={{ height: `${currentHeight}%` }}
        />
      )}
    </div>
    <span className="text-xs text-gray-600">{currentLabel}</span>
    <span className="text-sm font-semibold text-gray-700">
      {formatValue(metric.current)}
    </span>
  </div>
</div>
</div>



      {/* Current Value */}
      <div className="text-center pt-2 border-t">
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(metric.current)}
        </div>
      </div>

      {/* Percentage Change */}
      <div className={`flex items-center justify-center gap-2 text-lg font-bold ${
        isPositive 
          ? 'text-green-600' 
          : isNegative 
          ? 'text-red-600' 
          : 'text-gray-600'
      }`}>
        {isPositive ? (
          <>
            <TrendingUp className="h-5 w-5" />
            <span>{isPositive ? '+' : ''}{metric.percentageChange.toFixed(2)}%</span>
            <ThumbsUp className="h-5 w-5" />
          </>
        ) : isNegative ? (
          <>
            <TrendingDown className="h-5 w-5" />
            <span>{metric.percentageChange.toFixed(2)}%</span>
            <ThumbsDown className="h-5 w-5" />
          </>
        ) : (
          <span>0.00%</span>
        )}
      </div>
    </div>
  );
};

export default function StatisticsStats({ data }: StatisticsStatsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Statistics</h2>
            <p className="text-sm text-gray-500 mt-1">
              Comparison: {data.period.previous.label} vs {data.period.current.label}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Bookings"
          metric={data.bookings}
          period={data.period}
          format="number"
        />
        
        <StatCard
          title="Revenue"
          metric={data.revenue}
                    period={data.period}

          format="currency"
          currency="AED"
        />
        
        <StatCard
          title="Average Booking Value"
          metric={data.averageBookingValue}
                    period={data.period}
          format="currency"
          currency="AED"
        />
        
        <StatCard
          title="Cancellation Rate"
          metric={data.cancelledBookings}
                    period={data.period}
          format="number"
        />
        
        <StatCard
          title="Room Nights"
          metric={data.roomNights}
                    period={data.period}
          format="number"
        />
      </div>
    </div>
  );
}