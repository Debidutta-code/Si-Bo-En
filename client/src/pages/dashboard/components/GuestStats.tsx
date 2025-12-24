import { Users, UserCheck, Globe, Shield } from 'lucide-react';
import StatCard from './StatCard';
import DonutChart from './DonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IGuestAnalytics } from '../interface';

interface GuestStatsProps {
  data: IGuestAnalytics;
}

export default function GuestStats({ data }: GuestStatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
          <Users className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Guest Analytics
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Guests"
          value={data?.totalGuests}
          icon={Users}
          description="All time guests"
        />
        <StatCard
          title="Repeat Guests"
          value={data?.repeatGuestsCount}
          icon={UserCheck}
          description={`${data?.repeatGuestRate}% repeat rate`}
        />
        <StatCard
          title="Recent Guests"
          value={data?.recentGuests}
          icon={Users}
          description="Last 30 days"
        />
        <StatCard
          title="Verified Guests"
          value={data?.verifiedGuests}
          icon={Shield}
          description={`${data?.verificationRate}% verified`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Type Donut Chart */}
        <DonutChart
          data={data?.guestTypeBreakdown.map((guestType, index) => {
            const colors = ['#3b82f6', '#10b981', '#a855f7'];
            return {
              label: guestType.type,
              value: guestType.count,
              color: colors[index % colors.length]
            };
          })}
          title="Guest Type Distribution"
          centerLabel="Total Guests"
        />

        {/* Top Countries */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Top Guest Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.topCountries.length > 0 ? (
                data?.topCountries.map((country, index) => (
                  <div 
                    key={country.country} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{country.country}</span>
                    </div>
                    <span className="font-bold text-primary">{country.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No country data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {data?.repeatGuestsCount}
              </div>
              <div className="text-sm text-blue-600 font-medium mt-1">Loyal Customers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {data?.repeatGuestRate}%
              </div>
              <div className="text-sm text-blue-600 font-medium mt-1">Return Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {data?.verificationRate}%
              </div>
              <div className="text-sm text-blue-600 font-medium mt-1">ID Verification</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
