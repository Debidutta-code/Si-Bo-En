import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck, TrendingUp, Clock, LogIn, LogOut,
  Users, Building2, XCircle, CheckCircle, RefreshCw,
  DollarSign, Percent, CreditCard, ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAnalyticsService } from './services';
import type { AgentAnalyticsData, AgentPropertyAnalytics } from './interface';
import toast from 'react-hot-toast';
import { ButtonLoader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalyticsSource = 'reservation' | 'revenue' | 'guest';

interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  source: AnalyticsSource;
  format?: 'currency' | 'percent';
  description?: string;
}

// ─── Stat Cards Config ────────────────────────────────────────────────────────

const statsConfig: StatConfig[] = [
  {
    key: 'totalReservations',
    label: 'Total Reservations',
    icon: CalendarCheck,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: '#2563eb',
    source: 'reservation',
    description: 'All time bookings',
  },
  {
    key: 'confirmedReservations',
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: '#16a34a',
    source: 'reservation',
  },
  {
    key: 'pendingReservations',
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: '#ca8a04',
    source: 'reservation',
  },
  {
    key: 'cancelledReservations',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    borderColor: '#dc2626',
    source: 'reservation',
  },
  {
    key: 'totalCommissionEarned',
    label: 'Commission Earned',
    icon: Percent,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: '#059669',
    source: 'revenue',
    format: 'currency',
    description: "Your total earnings",
  },
  {
    key: 'totalRevenue',
    label: 'Total Booking Value',
    icon: DollarSign,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
    borderColor: '#7c3aed',
    source: 'revenue',
    format: 'currency',
    description: 'Total value generated',
  },
  {
    key: 'averageCommissionPerBooking',
    label: 'Avg. Commission',
    icon: TrendingUp,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: '#9333ea',
    source: 'revenue',
    format: 'currency',
    description: 'Per booking',
  },
  {
    key: 'averageBookingValue',
    label: 'Avg. Booking Value',
    icon: CreditCard,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
    borderColor: '#0284c7',
    source: 'revenue',
    format: 'currency',
  },
  {
    key: 'todayCheckIns',
    label: "Today's Check-ins",
    icon: LogIn,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    borderColor: '#0891b2',
    source: 'reservation',
  },
  {
    key: 'todayCheckOuts',
    label: "Today's Check-outs",
    icon: LogOut,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: '#ea580c',
    source: 'reservation',
  },
  {
    key: 'upcomingReservations',
    label: 'Upcoming (30 days)',
    icon: ArrowUpRight,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: '#0d9488',
    source: 'reservation',
  },
  {
    key: 'totalGuests',
    label: 'Total Guests',
    icon: Users,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    borderColor: '#4f46e5',
    source: 'guest',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatValue = (value: number, format?: 'currency' | 'percent'): string => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (format === 'percent') return `${value.toFixed(2)}%`;
  return value.toLocaleString('en-IN');
};

const getValue = (analytics: AgentAnalyticsData, stat: StatConfig): number => {
  const source = analytics[stat.source];
  const value = source[stat.key as keyof typeof source];
  return typeof value === 'number' ? value : 0;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ stat, value, index }: { stat: StatConfig; value: number; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card
        className="hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02]"
        style={{ borderLeftColor: stat.borderColor }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
            {stat.label}
          </CardTitle>
          <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bgColor} shrink-0`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
            {formatValue(value, stat.format)}
          </div>
          {stat.description && (
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PropertyRow({ property, index }: { property: AgentPropertyAnalytics; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200 gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-50 shrink-0">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{property.propertyName}</p>
          <p className="text-sm text-muted-foreground">{property.propertyCode}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:text-right flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground">Bookings</p>
          <p className="font-semibold text-foreground">{property.totalReservations}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Booking Value</p>
          <p className="font-semibold text-violet-600">
            {formatValue(property.totalRevenue, 'currency')}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Commission</p>
          <p className="font-semibold text-emerald-600">
            {formatValue(property.totalCommission, 'currency')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function GuestBreakdown({ analytics }: { analytics: AgentAnalyticsData }) {
  const { adults, children, infants, repeatGuests } = analytics.guest;
  const total = analytics.guest.totalGuests || 1;

  const segments = [
    { label: 'Adults', value: adults, color: 'bg-blue-500', pct: (adults / total * 100).toFixed(0) },
    { label: 'Children', value: children, color: 'bg-yellow-500', pct: (children / total * 100).toFixed(0) },
    { label: 'Infants', value: infants, color: 'bg-pink-400', pct: (infants / total * 100).toFixed(0) },
    { label: 'Repeat', value: repeatGuests, color: 'bg-emerald-500', pct: (repeatGuests / total * 100).toFixed(0) },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="text-lg sm:text-xl">Guest Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
          {segments.map(s => (
            <div
              key={s.label}
              className={`${s.color} transition-all`}
              style={{ width: `${s.pct}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {segments.map(s => (
            <div key={s.label} className="text-center">
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-1`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.pct}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueBreakdown({ analytics }: { analytics: AgentAnalyticsData }) {
  const { pay_at_hotel, net_banking, upi, payment_gateway } = analytics.revenue.revenueByPaymentMethod;
  const items = [
    { label: 'Pay at Hotel', value: pay_at_hotel },
    { label: 'Net Banking', value: net_banking },
    { label: 'UPI', value: upi },
    { label: 'Payment Gateway', value: payment_gateway },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="text-lg sm:text-xl">Revenue by Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{formatValue(item.value, 'currency')}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<AgentAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    const response = await fetchAnalyticsService();
    if (response.success) {
      setAnalytics(response.data);
    } else {
      toast.error(response.message || 'Failed to fetch analytics');
    }
    setIsRefreshing(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAnalytics();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ButtonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's your performance overview.
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm" disabled={isRefreshing} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      {analytics && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statsConfig.map((stat, index) => (
            <StatCard
              key={stat.key}
              stat={stat}
              value={getValue(analytics, stat)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* ── Properties Performance ── */}
      {analytics?.propertiesBreakdown && analytics.propertiesBreakdown.length > 0 && (
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Properties Performance</CardTitle>
              <Badge variant="outline" className="text-xs">
                {analytics.propertiesBreakdown.length}{' '}
                {analytics.propertiesBreakdown.length === 1 ? 'Property' : 'Properties'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {analytics.propertiesBreakdown.map((property, index) => (
              <PropertyRow key={property.propertyId} property={property} index={index} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Guest & Revenue breakdowns ── */}
      {analytics && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <GuestBreakdown analytics={analytics} />
          <RevenueBreakdown analytics={analytics} />
        </div>
      )}

      {/* ── Quick Actions ── */}
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'New Booking', desc: 'Create a new reservation', icon: CalendarCheck, color: 'blue', path: '/property' },
              { label: 'View Properties', desc: 'Browse available properties', icon: Building2, color: 'green', path: '/property' },
              { label: 'View Reservations', desc: 'Check all bookings', icon: CalendarCheck, color: 'purple', path: '/reservations' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-${action.color}-50 hover:border-${action.color}-200 transition-all duration-200 text-left group`}
                >
                  <div className={`p-2.5 rounded-lg bg-${action.color}-50 shrink-0`}>
                    <Icon className={`h-5 w-5 text-${action.color}-600`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium text-foreground group-hover:text-${action.color}-700 transition-colors`}>{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}