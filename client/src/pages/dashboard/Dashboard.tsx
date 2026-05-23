import Loader from '@/components/Loader/Loader';
import { useEffect, useState } from 'react';
import { fetchAnaltyticsService, fetchPropertiesService, fetchStatisticsComparisonService } from "./services";
import toast from 'react-hot-toast';
import type { IAnalyticsData, IPropertyCodeAndIds, ILoader, IStatisticsComparison } from "./interface";
import ReservationStats from './components/ReservationStats';
import RevenueStats from './components/RevenueStats';
// import GuestStats from './components/GuestStats';
import AdditionalStats from './components/AdditionalStats';
import TopPropertiesStats from './components/TopPropertiesStats';
import StatisticsStats from './components/StatisticsStats'; // 🆕 NEW IMPORT
import { AlertCircle, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from '@/redux/hooks';
import type { CurrencyCode } from '@/components/currency-code/currency-code.type';
import { currencies } from '@/components/currency-code/cuurency';
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    const { t } = useTranslation();

  const { user } = useAppSelector((state) => state.user);
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: t('Dashboard.fetchingAnalytics')
  });

  const [analyticsData, setAnalyticsData] = useState<IAnalyticsData | null>(null);
  const [statisticsData, setStatisticsData] = useState<IStatisticsComparison | null>(null);
  const [comparisonType, setComparisonType] = useState<'date' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [error, setError] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<IPropertyCodeAndIds[]>([])
  const [selectedProperty, setSelectedProperty] = useState<IPropertyCodeAndIds>({
    id: "",
    code: "",
    name: "",
    currencyCode: "USD"
  })

  useEffect(() => {
    if (!user) return;
    fetchProperties();
  }, [user?.role]);

  useEffect(() => {
    if (allProperties.length > 0 || !selectedProperty.id) {
      if(!comparisonType)return
      fetchStatistics(selectedCurrency, selectedProperty?.id, selectedProperty?.code, selectedProperty?.name,);
      fetchAnalytics(selectedCurrency, selectedProperty?.id, selectedProperty?.code, selectedProperty?.name,)
    }
  }, [comparisonType,selectedCurrency]);

  const handlePropertyChange = (propertyId: string) => {
    if (propertyId === "all") {
      setSelectedProperty({ id: "", code: "", name: "", currencyCode: "USD" });
      setSelectedCurrency("USD")
      fetchAnalytics(selectedCurrency);
      fetchStatistics(selectedCurrency);
    } else {
      const property = allProperties.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
        setSelectedCurrency(property.currencyCode)
        fetchAnalytics(property.currencyCode, property.id, property.code, property.name,);
        fetchStatistics(property.currencyCode, property.id, property.code, property.name);
      }
    }
  };

  const fetchStatistics = async (selectedCurrency: CurrencyCode, propertyId?: string, propertyCode?: string, propertyName?: string) => {
    // console.log(selectedCurrency)
    if (!selectedCurrency) return
    try {
      setError(null);
      // console.log(selectedCurrency)
      const response = await fetchStatisticsComparisonService(
        comparisonType,
        selectedDate.toISOString(),
        propertyId,
        propertyCode,
        propertyName,
        selectedCurrency
      );

      if (response.success && response.data) {
        setStatisticsData(response.data);
      } else {
        setError(response.message || t('Toast.failedToFetchStatistics'));
        toast.error(response.message || t('Toast.failedToFetchStatistics'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Toast.unexpectedError');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching statistics:", err);
    }
  };

  const fetchAnalytics = async (selectedCurrency: CurrencyCode, propertyId?: string, propertyCode?: string, propertyName?: string,) => {
    try {
      if (!selectedCurrency) return
      setLoader({ isLoading: true, message: t('Dashboard.fetchingAnalytics') });
      setError(null);

      const response = await fetchAnaltyticsService(propertyId, propertyCode, propertyName, selectedCurrency);

      if (response.success && response.data) {
        setAnalyticsData(response.data.analytics);
        toast.success(t('Toast.analyticsFetchedSuccessfully'));
      } else {
        setError(response.message || t('Toast.failedToFetchAnalytics'));
        toast.error(response.message || t('Toast.failedToFetchAnalytics'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Toast.unexpectedError');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching analytics:", err);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };


  const fetchProperties = async () => {
    try {
      setLoader({ isLoading: true, message: t('Dashboard.fetchingPropertyNames') });
      setError(null);
      const response = await fetchPropertiesService();

      if (response.success) {
        setAllProperties(response.data);

        // Resolve currency synchronously before calling fetch functions
        const isSingleProperty = response.data.length === 1 &&
          (user?.role === "hotel_manager" || user?.role === "staff");

        const resolvedCurrency: CurrencyCode = isSingleProperty
          ? (response.data[0].currencyCode ?? 'USD') as CurrencyCode
          : selectedCurrency;

        setSelectedCurrency(resolvedCurrency); // for future renders

        await fetchAnalytics(resolvedCurrency, undefined, undefined, undefined,);
        await fetchStatistics(resolvedCurrency, undefined, undefined, undefined,);
      } else {
        setError(response.message || t('Toast.failedToFetchProperties'));
        toast.error(response.message || t('Toast.failedToFetchProperties'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Toast.unexpectedError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  if (loader.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">{t('Dashboard.errorLoadingAnalytics')}</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchAnalytics(selectedCurrency);
              fetchStatistics(selectedCurrency);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {t('Common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('Dashboard.noAnalyticsDataAvailable')}</p>
          <button
            onClick={() => {
              fetchAnalytics(selectedCurrency);
              fetchStatistics(selectedCurrency); // 🆕 NEW
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {t('Dashboard.loadAnalytics')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('Dashboard.dashboardAnalytics')}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* 🆕 NEW: Comparison Type Selector */}
            <Select
              value={comparisonType}
              onValueChange={(value: 'date' | 'month' | 'year') => setComparisonType(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('Dashboard.byDate')}</SelectItem>
                <SelectItem value="month">{t('Dashboard.byMonth')}</SelectItem>
                <SelectItem value="year">{t('Dashboard.byYear')}</SelectItem>
              </SelectContent>
            </Select>

            {/* 🆕 NEW: Date/Month Picker */}
            {/* 🆕 UPDATED: Date / Month / Year Picker */}
            {comparisonType === 'year' ? (
              <Select
                value={selectedDate.getFullYear().toString()}
                onValueChange={(year) =>
                  setSelectedDate(new Date(`${year}-01-01`))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('Dashboard.selectYear')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <input
                type={comparisonType === 'date' ? 'date' : 'month'}
                value={
                  comparisonType === 'date'
                    ? selectedDate.toISOString().split('T')[0]
                    : `${selectedDate.getFullYear()}-${String(
                      selectedDate.getMonth() + 1
                    ).padStart(2, '0')}`
                }
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 w-[140px] border rounded-md text-sm"
              />
            )}

            {allProperties.length > 1 && (
              <Select
                value={selectedProperty.id || "all"}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger className="w-[200px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('Dashboard.selectAll')}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('Dashboard.selectAll')}</SelectItem>
                  {allProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{property.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={selectedCurrency}
              onValueChange={(value: CurrencyCode) => setSelectedCurrency(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (selectedProperty.id) {
                  fetchAnalytics(selectedCurrency, selectedProperty.id, selectedProperty.code, selectedProperty.name,);
                  fetchStatistics(selectedCurrency, selectedProperty.id, selectedProperty.code, selectedProperty.name,); // 🆕 NEW
                } else {
                  fetchAnalytics(selectedCurrency);
                  fetchStatistics(selectedCurrency);
                }
              }}
              variant={"terciary"}
            >
              <RefreshCw className='h-3 mr-2 w-3' />
             {t('Common.refresh')}
            </Button>
          </div>
        </div>

        {/* 🆕 NEW: Statistics Comparison Section */}
        {statisticsData && (
          <StatisticsStats data={statisticsData} currencyCode={statisticsData.currencyCode} />
        )}
        {/* Reservation Analytics */}
        <ReservationStats data={analyticsData.reservation} />

        {/* Revenue Analytics */}
        <RevenueStats data={analyticsData.revenue}
          currencyCode={analyticsData.currencyCode} />

        {/* Guest Analytics */}
        {/* <GuestStats data={analyticsData.guest} /> */}

        {/* Additional Stats */}
        <AdditionalStats
          addonData={analyticsData.addon}
          bookingSourceData={analyticsData.bookingSource}
          paymentMethodData={analyticsData.paymentMethod}
          currencyCode={analyticsData.currencyCode}
        />

        {/* Top Performing Properties */}
        {analyticsData.topPerformingProperties && (
          <TopPropertiesStats data={analyticsData.topPerformingProperties}
            currencyCode={analyticsData.currencyCode} />
        )}
      </div>
    </div>
  );
}