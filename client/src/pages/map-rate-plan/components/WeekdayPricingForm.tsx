import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface WeekdayPricingFormProps {
    showWeekdayForm: boolean;
    setShowWeekdayForm: (show: boolean) => void;
    weekdayPrices: Record<string, string>;
    handleWeekdayPriceChange: (day: string, value: string) => void;
}

const WEEKDAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

export default function WeekdayPricingForm({
    showWeekdayForm,
    setShowWeekdayForm,
    weekdayPrices,
    handleWeekdayPriceChange,
}: WeekdayPricingFormProps) {
    const { t } = useTranslation();
    return (
        <Card className="shadow-lg mb-6">
            <CardHeader
                className="border-b bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowWeekdayForm(!showWeekdayForm)}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">{t("MapRatePlan.weekdayPricing.title")}</CardTitle>
                        <CardDescription>{t("MapRatePlan.weekdayPricing.desc")}</CardDescription>
                    </div>
                    {showWeekdayForm ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>
            {showWeekdayForm && (
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {WEEKDAYS.map(({ key }) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="text-sm font-semibold">
                                    {t(`MapRatePlan.weekdayPricing.${key}`)}
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        id={key}
                                        type="number"
                                        placeholder={t("MapRatePlan.weekdayPricing.placeholder")}
                                        value={weekdayPrices[key]}
                                        onChange={(e) => handleWeekdayPriceChange(key, e.target.value)}
                                        className="pl-7 h-11"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
