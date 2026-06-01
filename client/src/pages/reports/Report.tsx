import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadReportService, getFilterOptionsService } from './services';
import { Download, Loader2, FileBarChart, CalendarRange, Building2, Filter, DollarSign} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ReportType, IFilterOptionsResponse } from './interfaces';
import { currencies } from '@/components/currency-code/cuurency';

const isSelected = (val: string) => val && val !== 'all';

const Report = () => {
    const { t } = useTranslation();

    const REPORT_TYPES: { value: ReportType; label: string }[] = [
        { value: 'comparison', label: t('Report.reportTypes.comparison') },
        { value: 'reservation-overview', label: t('Report.reportTypes.reservationOverview') },
        { value: 'revenue-analytics', label: t('Report.reportTypes.revenueAnalytics') },
        { value: 'insights', label: t('Report.reportTypes.insights') },
        { value: 'top-properties', label: t('Report.reportTypes.topProperties') },
        { value: 'all-reservations', label: t('Report.reportTypes.allReservations') },
        { value: 'checkin-checkout', label: t('Report.reportTypes.checkinCheckout') },
        { value: 'loyalty-guests', label: t('Report.reportTypes.loyaltyGuests') },
    ];

    const [reportType, setReportType] = useState<ReportType>("comparison");
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('none');

    // Comparison-specific state
    const [comparisonType, setComparisonType] = useState<'date' | 'month' | 'year'>('month');
    const [comparisonDate, setComparisonDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    // Filter state
    const [filterOptions, setFilterOptions] = useState<IFilterOptionsResponse | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

    const showCurrencyFilter = reportType === 'all-reservations' || reportType === 'comparison' || reportType === 'top-properties';
    const showComparisonControls = reportType === 'comparison';
    const isLoyaltyReport = reportType === 'loyalty-guests';

    const handleReportTypeChange = (val: string) => {
        setReportType(val as ReportType);
        if (val !== 'all-reservations' && val !== 'comparison' && val !== 'top-properties') {
            setSelectedCurrency('none');
        }
    };

    // Fetch filter options on mount
    useEffect(() => {
        const fetchFilters = async () => {
            setIsLoadingFilters(true);
            const result = await getFilterOptionsService();
            if (result.success && result.data) {
                setFilterOptions(result.data);
            }
            setIsLoadingFilters(false);
        };
        fetchFilters();
    }, []);

    // Reset brand & property when group changes
    const handleGroupChange = (val: string) => {
        setSelectedGroupId(val);
        setSelectedBrandId('all');
        setSelectedPropertyId('all');
    };

    // Reset property when brand changes
    const handleBrandChange = (val: string) => {
        setSelectedBrandId(val);
        setSelectedPropertyId('all');
    };

    // ─── Cascading filter logic ─────────────────────────────────────────────────

    // Brands filtered by selected group
    const filteredBrands = useMemo(() => {
        if (!filterOptions) return [];
        if (!isSelected(selectedGroupId)) return filterOptions.brands;
        return filterOptions.brands.filter(b => b.groupId === selectedGroupId);
    }, [filterOptions, selectedGroupId]);

    // Properties filtered by selected group and/or brand
    const filteredProperties = useMemo(() => {
        if (!filterOptions) return [];
        let props = filterOptions.properties;

        if (isSelected(selectedGroupId)) {
            // Get brand IDs that belong to this group
            const groupBrandIds = filterOptions.brands
                .filter(b => b.groupId === selectedGroupId)
                .map(b => b.id);

            // Keep properties directly under this group OR under this group's brands
            props = props.filter(p =>
                p.groupId === selectedGroupId || groupBrandIds.includes(p.brandId || '')
            );
        }

        if (isSelected(selectedBrandId)) {
            props = props.filter(p => p.brandId === selectedBrandId);
        }

        return props;
    }, [filterOptions, selectedGroupId, selectedBrandId]);

    const showGroupFilter = filterOptions && filterOptions.groups.length > 0;
    const showBrandFilter = filterOptions && filterOptions.brands.length > 0;
    const showPropertyFilter = filterOptions && filterOptions.properties.length > 0;

    const handleDownload = async () => {
        if (!reportType) {
            toast.error(t('Report.toast.selectReportType'));
            return;
        }
        setIsDownloading(true);
        try {
            const result = await downloadReportService({
                reportType,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                groupId: isSelected(selectedGroupId) ? selectedGroupId : undefined,
                brandId: isSelected(selectedBrandId) ? selectedBrandId : undefined,
                propertyId: isSelected(selectedPropertyId) ? selectedPropertyId : undefined,
                targetCurrency: selectedCurrency && selectedCurrency !== 'none' ? selectedCurrency : undefined,
                // Comparison-specific
                comparisonType: reportType === 'comparison' ? comparisonType : undefined,
                selectedDate: reportType === 'comparison' ? new Date(comparisonDate).toISOString() : undefined,
            });

            if (result.success) {
                toast.success(t('Report.toast.downloadSuccess'));
            } else {
                toast.error(t('Report.toast.downloadFailed'));
            }
        } catch (error) {
            toast.error(t('Report.toast.errorOccurred'));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
                        <FileBarChart className="w-10 h-10 text-primary" />
                        {t('Report.title')}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">{t('Report.subtitle')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Report Settings */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50/50 border-b pb-6">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <CalendarRange className="w-5 h-5 text-gray-500" />
                            {t('Report.reportSettings.title')}
                        </CardTitle>
                        <CardDescription>{t('Report.reportSettings.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">
                                {t('Report.reportSettings.reportType')} <span className="text-red-500">*</span>
                            </Label>
                            <Select value={reportType} onValueChange={handleReportTypeChange}>
                                <SelectTrigger className="w-full h-12 text-base">
                                    <SelectValue placeholder={t('Report.reportSettings.selectReportType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value} className="py-3">
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {showComparisonControls ? (
                            /* Comparison controls: type selector + date/month/year picker */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        {t('Report.reportSettings.comparisonType')}
                                    </Label>
                                    <Select value={comparisonType} onValueChange={(v) => setComparisonType(v as 'date' | 'month' | 'year')}>
                                        <SelectTrigger className="w-full h-12 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date">{t('Dashboard.byDate')}</SelectItem>
                                            <SelectItem value="month">{t('Dashboard.byMonth')}</SelectItem>
                                            <SelectItem value="year">{t('Dashboard.byYear')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        {t('Report.reportSettings.selectPeriod')}
                                    </Label>
                                    {comparisonType === 'year' ? (
                                        <Select
                                            value={new Date(comparisonDate).getFullYear().toString()}
                                            onValueChange={(yr) => setComparisonDate(`${yr}-01-01`)}
                                        >
                                            <SelectTrigger className="w-full h-12 text-base">
                                                <SelectValue placeholder={t('Dashboard.selectYear')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 10 }, (_, i) => {
                                                    const yr = new Date().getFullYear() - i;
                                                    return <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>;
                                                })}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            type={comparisonType === 'date' ? 'date' : 'month'}
                                            value={
                                                comparisonType === 'date'
                                                    ? comparisonDate
                                                    : `${new Date(comparisonDate).getFullYear()}-${String(new Date(comparisonDate).getMonth() + 1).padStart(2, '0')}`
                                            }
                                            onChange={(e) => setComparisonDate(e.target.value)}
                                            className="h-12"
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Normal date range for all other reports */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        {isLoyaltyReport ? 'Enrollment Start Date' : t('Report.reportSettings.startDate')}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        {isLoyaltyReport ? 'Enrollment End Date' : t('Report.reportSettings.endDate')}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                            </div>
                        )}

 

                        {showCurrencyFilter && (
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {t('Report.reportSettings.convertCurrency')}
                                    <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                                </Label>
                                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                    <SelectTrigger className="w-full h-12 text-base">
                                        <SelectValue placeholder={t('Report.reportSettings.noCurrencyConversion')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('Report.reportSettings.noCurrencyConversion')}</SelectItem>
                                        {currencies.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCurrency && selectedCurrency !== 'none' && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        ⚠ {t('Report.reportSettings.indicativePriceNote', { currency: selectedCurrency })}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b pb-6">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                {t('Report.portfolioFilters.title')}
                            </CardTitle>
                            <CardDescription>{t('Report.portfolioFilters.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {isLoadingFilters ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">{t('Report.portfolioFilters.loadingPortfolio')}</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(showGroupFilter || showBrandFilter || showPropertyFilter) ? (
                                        <>
                                            {showGroupFilter && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        {t('Report.portfolioFilters.group')}
                                                    </Label>
                                                    <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder={t('Report.portfolioFilters.allGroups')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">{t('Report.portfolioFilters.allGroups')}</SelectItem>
                                                            {filterOptions!.groups.map((group) => (
                                                                <SelectItem key={group.id} value={group.id}>
                                                                    {group._translations?.name ?? group.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {showBrandFilter && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-gray-700">{t('Report.portfolioFilters.brand')}</Label>
                                                    <Select value={selectedBrandId} onValueChange={handleBrandChange}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder={t('Report.portfolioFilters.allBrands')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">{t('Report.portfolioFilters.allBrands')}</SelectItem>
                                                            {filteredBrands.map((brand) => (
                                                                <SelectItem key={brand.id} value={brand.id}>
                                                                    {brand.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {showPropertyFilter && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-gray-700">{t('Report.portfolioFilters.property')}</Label>
                                                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder={t('Report.portfolioFilters.allProperties')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">{t('Report.portfolioFilters.allProperties')}</SelectItem>
                                                            {filteredProperties.map((prop) => (
                                                                <SelectItem key={prop.id} value={prop.id}>
                                                                    {prop.property?._translations?.propertyName ?? prop.property?.propertyName ?? prop.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-sm text-muted-foreground">
                                            {t('Report.portfolioFilters.noFiltersAvailable')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button 
                        onClick={handleDownload} 
                        disabled={isDownloading || !reportType}
                        className="w-full h-14 text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                        size="lg"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t('Report.actions.generating')}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                {t('Report.actions.exportReport')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Report;