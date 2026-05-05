import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadReportService, getFilterOptionsService } from './services';
import { Download, Loader2 } from 'lucide-react';
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
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mb-8">Generated detailed insights and exports for your properties.</p>
            
            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Select a report type and date range to export data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Report Type <span className="text-red-500">*</span></Label>
                            <Select value={reportType} onValueChange={(val) => setReportType(val as ReportType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Role-based cascading filter dropdowns */}
                        {isLoadingFilters ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading filters...
                            </div>
                        ) : (
                            (showGroupFilter || showBrandFilter || showPropertyFilter) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {showGroupFilter && (
                                        <div className="space-y-2">
                                            <Label>Group</Label>
                                            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                                                <SelectTrigger>
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
                                        <div className="space-y-2">
                                            <Label>Brand</Label>
                                            <Select value={selectedBrandId} onValueChange={handleBrandChange}>
                                                <SelectTrigger>
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
                                        <div className="space-y-2">
                                            <Label>Property</Label>
                                            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                                <SelectTrigger>
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
                                </div>
                            )
                        )}
                    </div>

                    <Button 
                        onClick={handleDownload} 
                        disabled={isDownloading || !reportType}
                        className="w-full md:w-auto mt-4"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isDownloading ? "Downloading..." : "Download Report"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Report;