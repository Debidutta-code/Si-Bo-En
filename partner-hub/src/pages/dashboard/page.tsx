import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarCheck, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  LogIn, 
  LogOut,
  Users,
  Building2,
  XCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAnalyticsService } from './services';
import type { AgentAnalyticsData } from './interface';
import toast from 'react-hot-toast';
import { ButtonLoader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconColor: string;
  source: 'reservation' | 'revenue' | 'guest' | 'bookingSource';
  format?: 'currency';
}

const statsConfig: StatConfig[] = [
  { 
    key: 'totalReservations', 
    label: 'Total Reservations', 
    icon: CalendarCheck, 
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    source: 'reservation'
  },
  { 
    key: 'confirmedReservations', 
    label: 'Confirmed', 
    icon: CheckCircle, 
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    source: 'reservation'
  },
  { 
    key: 'pendingReservations', 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    source: 'reservation'
  },
  { 
    key: 'cancelledReservations', 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    source: 'reservation'
  },
  { 
    key: 'totalRevenue', 
    label: 'Total Revenue', 
    icon: IndianRupee, 
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    format: 'currency',
    source: 'revenue'
  },
  { 
    key: 'averageBookingValue', 
    label: 'Avg. Booking Value', 
    icon: TrendingUp, 
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    format: 'currency',
    source: 'revenue'
  },
  { 
    key: 'todayCheckIns', 
    label: "Today's Check-ins", 
    icon: LogIn, 
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    source: 'reservation'
  },
  { 
    key: 'todayCheckOuts', 
    label: "Today's Check-outs", 
    icon: LogOut, 
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    source: 'reservation'
  },
  { 
    key: 'totalGuests', 
    label: 'Total Guests', 
    icon: Users, 
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    source: 'guest'
  },
];

const formatValue = (value: number, format?: 'currency'): string => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value.toLocaleString('en-IN');
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [analytics, setAnalytics] = useState<AgentAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (): Promise<void> => {
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
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [user, navigate]);

  const getValue = (stat: StatConfig): number => {
    if (!analytics) return 0;
    const source = analytics[stat.source];
    return (source as any)?.[stat.key] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ButtonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's your agency overview.
          </p>
        </div>
        <Button
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statsConfig.map((stat: StatConfig, index: number) => {
          const value: number = getValue(stat);
          const Icon: LucideIcon = stat.icon;
          
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02]" style={{ borderLeftColor: stat.iconColor.replace('text-', '') }}>
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
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {analytics?.propertiesBreakdown && analytics.propertiesBreakdown.length > 0 && (
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Properties Performance</CardTitle>
              <Badge variant="outline" className="text-xs">
                {analytics.propertiesBreakdown.length} {analytics.propertiesBreakdown.length === 1 ? 'Property' : 'Properties'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {analytics.propertiesBreakdown.map((property, index) => (
                <motion.div
                  key={property.propertyId}
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
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Bookings</p>
                      <p className="font-semibold text-foreground">{property.totalReservations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-emerald-600">
                        {formatValue(property.totalRevenue, 'currency')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/property')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors shrink-0">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground group-hover:text-blue-700 transition-colors">New Booking</p>
                <p className="text-sm text-muted-foreground">Create a new reservation</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/property')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-green-50 hover:border-green-200 transition-all duration-200 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors shrink-0">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground group-hover:text-green-700 transition-colors">View Properties</p>
                <p className="text-sm text-muted-foreground">Browse available properties</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 text-left group"
            >
              <div className="p-2.5 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors shrink-0">
                <CalendarCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground group-hover:text-purple-700 transition-colors">View Reservations</p>
                <p className="text-sm text-muted-foreground">Check all bookings</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
