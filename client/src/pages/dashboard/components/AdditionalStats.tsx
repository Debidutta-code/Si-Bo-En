import { ShoppingBag, Globe } from 'lucide-react';
import DonutChart from './DonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IAddonAnalytics, IBookingSourceAnalytics, IPaymentMethodAnalytics } from '../interface';

interface AdditionalStatsProps {
  addonData: IAddonAnalytics;
  bookingSourceData: IBookingSourceAnalytics;
  paymentMethodData: IPaymentMethodAnalytics;
}

export default function AdditionalStats({ 
  addonData, 
  bookingSourceData, 
  paymentMethodData 
}: AdditionalStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Additional Insights
        </h2>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Add-on Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(addonData?.totalAddonRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  From {addonData?.addonCount} add-ons
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold">Top 5 Popular Add-ons</div>
                {addonData?.popularAddons.length > 0 ? (
                  addonData?.popularAddons.map((addon, index) => (
                    <div 
                      key={addon.addonId} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="truncate">{addon.addonId}</span>
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(addon.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {addon.bookingCount} bookings
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    No add-on data
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Sources with enhanced styling */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              Booking Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingSourceData?.sourceBreakdown?.map((source) => (
                <div key={source.source} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-semibold">{source.source.replace('_', ' ')}</span>
                    <span className="font-bold text-purple-600">{source.count} bookings</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">
                    Revenue: {formatCurrency(source.revenue)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        source.source === 'ota' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 
                        source.source === 'walk_in' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ 
                        width: `${(source.count / bookingSourceData?.sourceBreakdown?.reduce((sum, s) => sum + s.count, 0) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods with Donut Chart */}
        <DonutChart
          data={paymentMethodData?.methodBreakdown?.map((method, index) => {
            const colors = ['#3b82f6', '#10b981', '#a855f7', '#f97316'];
            return {
              label: method.method.replace('_', ' '),
              value: method.count,
              color: colors[index % colors.length]
            };
          })}
          title="Payment Methods"
          centerLabel="Total Payments"
        />
      </div>
    </div>
  );
}
