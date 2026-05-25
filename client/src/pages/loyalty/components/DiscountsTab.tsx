import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Percent  } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DiscountsTabProps {
  discountType: string;
  setDiscountType: (value: string) => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  currencyCode: string;
  setCurrencyCode: (value: string) => void;
  onUpdate: () => void;
}

export default function DiscountsTab({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  currencyCode,
  setCurrencyCode,
  onUpdate
}: DiscountsTabProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("LoyaltyDiscounts.title")}</CardTitle>
        <CardDescription>
          {t("LoyaltyDiscounts.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Configuration Display */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {t("LoyaltyDiscounts.activeConfig")}
          </AlertDescription>
        </Alert>

        {/* Discount Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="discountType">{t("LoyaltyDiscounts.discountType")}</Label>
          <Select value={discountType} onValueChange={(value) => setDiscountType(value)}>
            <SelectTrigger>
              <SelectValue placeholder={t("LoyaltyDiscounts.selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span>{t("LoyaltyDiscounts.percentage")}</span>
                </div>
              </SelectItem>
              {/* <SelectItem value="fixed">
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4" />
                  <span>{t("LoyaltyDiscounts.fixed")}</span>
                </div>
              </SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            {t("LoyaltyDiscounts.discountValue")} {discountType === "percentage" ? t("LoyaltyDiscounts.percentageUnit") : t("LoyaltyDiscounts.amountUnit")}
          </Label>
          <Input
            id="discountValue"
            type="number"
            min="0"
            max={discountType === "percentage" ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            placeholder={discountType === "percentage" ? t("LoyaltyDiscounts.placeholderPercentage") : t("LoyaltyDiscounts.placeholderAmount")}
          />
          <p className="text-sm text-muted-foreground">
            {discountType === "percentage" 
              ? t("LoyaltyDiscounts.percentageHint") 
              : t("LoyaltyDiscounts.amountHint")}
          </p>
        </div>

        {/* Currency Code (for fixed amount) */}
        {discountType === "fixed" && (
          <div className="space-y-2">
            <Label htmlFor="currencyCode">{t("LoyaltyDiscounts.currencyCode")}</Label>
            <Input
              id="currencyCode"
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              placeholder={t("LoyaltyDiscounts.placeholderCurrency")}
              maxLength={3}
            />
            <p className="text-sm text-muted-foreground">
              {t("LoyaltyDiscounts.currencyHint")}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onUpdate}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("LoyaltyDiscounts.updateButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
