import { Trophy, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ITopPerformingProperties } from '../interface';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { getCurrencySymbol } from '../utils/currencyUtils';

interface TopPropertiesStatsProps {
  data: ITopPerformingProperties;
  currencyCode:CurrencyCode
}

export default function TopPropertiesStats({ data , currencyCode }: TopPropertiesStatsProps) {
const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Top Performing Properties
        </h2>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topByRevenue.length > 0 ? (
                data?.topByRevenue.map((property, index) => (
                  <div 
                    key={property.propertyId}
                    className={`p-4 rounded-xl shadow-sm transition-all hover:shadow-md ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400' :
                      'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <span className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          {index >= 3 && (
                            <span className="text-sm font-bold bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full">
                              {index + 1}
                            </span>
                          )}
                          <div>
                            <div className="font-bold">{property.propertyName}</div>
                            <div className="text-xs text-muted-foreground font-medium">{property.propertyCode}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-lg">
                          {formatCurrency(property.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-blue-600" />
              Top by Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topByBookings.length > 0 ? (
                data?.topByBookings.map((property, index) => (
                  <div 
                    key={property.propertyId}
                    className={`p-3 rounded-lg border ${
                      index === 0 ? 'border-yellow-300 bg-yellow-50' :
                      index === 1 ? 'border-gray-300 bg-gray-50' :
                      index === 2 ? 'border-orange-300 bg-orange-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <span className={`text-lg ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-500' :
                              'text-orange-500'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <div>
                            <div className="font-semibold">{property.propertyName}</div>
                            <div className="text-xs text-muted-foreground">{property.propertyCode}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          {property.totalBookings}
                        </div>
                        <div className="text-xs text-muted-foreground">bookings</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Top by Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topByOccupancy.length > 0 ? (
                data?.topByOccupancy.map((property, index) => (
                  <div 
                    key={property.propertyId}
                    className={`p-3 rounded-lg border ${
                      index === 0 ? 'border-yellow-300 bg-yellow-50' :
                      index === 1 ? 'border-gray-300 bg-gray-50' :
                      index === 2 ? 'border-orange-300 bg-orange-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <span className={`text-lg ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-500' :
                              'text-orange-500'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <div>
                            <div className="font-semibold">{property.propertyName}</div>
                            <div className="text-xs text-muted-foreground">{property.propertyCode}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          {property.occupancyRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {property.occupiedRooms}/{property.totalRooms}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
