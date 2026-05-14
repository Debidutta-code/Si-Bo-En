import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadReportService, getFilterOptionsService } from './services';
import { Download, Loader2, FileBarChart, CalendarRange, Building2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ReportType, IFilterOptionsResponse } from './interfaces';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
    { value: 'comparison', label: 'Comparison' },
    { value: 'reservation-overview', label: 'Reservation Overview' },
    { value: 'revenue-analytics', label: 'Revenue Analytics' },
    { value: 'insights', label: 'Insights' },
    { value: 'top-properties', label: 'Top Properties' },
    { value: 'all-reservations', label: 'All Reservations' },
    { value: 'checkin-checkout', label: 'Check-in/Check-out' },
    { value: 'status-breakdown', label: 'Status Breakdown' },
    { value: 'loyalty-guests', label: 'Loyalty Guests' },
    { value: 'payment-status', label: 'Payment Status' },
];

const isSelected = (val: string) => val && val !== 'all';

const Report = () => {
    const [reportType, setReportType] = useState<ReportType>("comparison");
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);

    // Filter state
    const [filterOptions, setFilterOptions] = useState<IFilterOptionsResponse | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

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
            toast.error("Please select a report type");
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
            });

            if (result.success) {
                toast.success("Report downloaded successfully");
            } else {
                toast.error("Failed to download report");
            }
        } catch (error) {
            toast.error("An error occurred");
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
                        Reports Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">Generate and export detailed analytical insights for your properties.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Report Settings */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50/50 border-b pb-6">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <CalendarRange className="w-5 h-5 text-gray-500" />
                            Report Settings
                        </CardTitle>
                        <CardDescription>Select the type of data and date range you want to analyze.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700">Report Type <span className="text-red-500">*</span></Label>
                            <Select value={reportType} onValueChange={(val) => setReportType(val as ReportType)}>
                                <SelectTrigger className="w-full h-12 text-base">
                                    <SelectValue placeholder="Select report type" />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">End Date</Label>
                                <Input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-8">
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b pb-6">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                Portfolio Filters
                            </CardTitle>
                            <CardDescription>Filter data by specific properties or groups.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {isLoadingFilters ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Loading portfolio data...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(showGroupFilter || showBrandFilter || showPropertyFilter) ? (
                                        <>
                                            {showGroupFilter && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        Group
                                                    </Label>
                                                    <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="All Groups" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Groups</SelectItem>
                                                            {filterOptions!.groups.map((group) => (
                                                                <SelectItem key={group.id} value={group.id}>
                                                                    {group.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {showBrandFilter && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-gray-700">Brand</Label>
                                                    <Select value={selectedBrandId} onValueChange={handleBrandChange}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="All Brands" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Brands</SelectItem>
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
                                                    <Label className="text-sm font-semibold text-gray-700">Property</Label>
                                                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="All Properties" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Properties</SelectItem>
                                                            {filteredProperties.map((prop) => (
                                                                <SelectItem key={prop.id} value={prop.id}>
                                                                    {prop.property?.propertyName || prop.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-sm text-muted-foreground">
                                            No portfolio filters available
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
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Export Report
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Report;