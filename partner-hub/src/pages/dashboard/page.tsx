import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { mockDashboardStats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarCheck, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  LogIn, 
  LogOut,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const statsConfig = [
  { 
    key: 'totalBookings', 
    label: 'Total Bookings', 
    icon: CalendarCheck, 
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    trend: '+12%',
    trendUp: true
  },
  { 
    key: 'totalRevenue', 
    label: 'Total Revenue', 
    icon: IndianRupee, 
    color: 'text-success',
    bgColor: 'bg-success/10',
    format: 'currency',
    trend: '+8%',
    trendUp: true
  },
  { 
    key: 'occupancyRate', 
    label: 'Occupancy Rate', 
    icon: TrendingUp, 
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    format: 'percentage',
    trend: '-2%',
    trendUp: false
  },
  { 
    key: 'pendingBookings', 
    label: 'Pending Bookings', 
    icon: Clock, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    trend: '+3',
    trendUp: true
  },
  { 
    key: 'todayCheckIns', 
    label: "Today's Check-ins", 
    icon: LogIn, 
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  { 
    key: 'todayCheckOuts', 
    label: "Today's Check-outs", 
    icon: LogOut, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
];

const formatValue = (value: number, format?: string) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === 'percentage') {
    return `${value}%`;
  }
  return value.toLocaleString();
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your property overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat, index) => {
          const value = mockDashboardStats[stat.key as keyof typeof mockDashboardStats];
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-foreground">
                      {formatValue(value, stat.format)}
                    </div>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trendUp ? 'text-success' : 'text-destructive'
                      }`}>
                        {stat.trendUp ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {stat.trend}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/property')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <CalendarCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">New Booking</p>
                <p className="text-sm text-muted-foreground">Create a new reservation</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/property')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">View Properties</p>
                <p className="text-sm text-muted-foreground">Manage your properties</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">View Reservations</p>
                <p className="text-sm text-muted-foreground">Check all bookings</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
