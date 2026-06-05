import { ShoppingBag, Globe } from 'lucide-react';
import DonutChart from './DonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IAddonAnalytics, IBookingSourceAnalytics, IPaymentMethodAnalytics } from '../interface';
import { capitalizeFirstLetter } from '@/lib/utils';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { useTranslation } from 'react-i18next';

interface AdditionalStatsProps {
  addonData: IAddonAnalytics;
  bookingSourceData: IBookingSourceAnalytics;
  paymentMethodData: IPaymentMethodAnalytics;
  currencyCode:CurrencyCode
}

export default function AdditionalStats({ 
  addonData, 
  bookingSourceData, 
  paymentMethodData,
  currencyCode
}: AdditionalStatsProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    const symbol = currencyCode;
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('DashboardStats.additionalInsights')}
        </h2>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t('DashboardStats.addonRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(addonData?.totalAddonRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('DashboardStats.fromAddons', { count: addonData?.addonCount })}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold">{t('DashboardStats.top5PopularAddons')}</div>
                {addonData?.popularAddons.length > 0 ? (
                  addonData?.popularAddons.map((addon, index) => (
                    <div 
                      key={addon.addonId} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="truncate">{addon._translations?addon._translations.name:addon.addonName}</span>
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(addon.revenue)}</div>
                        <div className="text-xs text-muted-foreground">
                          {addon.bookingCount} {t('DashboardStats.bookings')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    {t('DashboardStats.noAddonData')}
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
              {t('DashboardStats.bookingSources')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingSourceData?.sourceBreakdown?.map((source) => (
                <div key={source.source} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-semibold">{source.source.replace('_', ' ')}</span>
                    <span className="font-bold text-purple-600">{source.count} {t('DashboardStats.bookings')}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">
                    {t('DashboardStats.totalRevenue')}: {formatCurrency(source.revenue)}
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
              label: method.method.split('_').map(capitalizeFirstLetter).join(' '),
              value: method.count,
              color: colors[index % colors.length]
            };
          })}
          title={t('DashboardStats.paymentMethods')}
          centerLabel={t('DashboardStats.totalPayments')}
        />
      </div>
    </div>
  );
}
