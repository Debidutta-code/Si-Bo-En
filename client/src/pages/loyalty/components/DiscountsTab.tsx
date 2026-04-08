import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Percent  } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Discounts</CardTitle>
        <CardDescription>
          Manage discount settings for your loyalty program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Configuration Display */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Loyalty configuration is active for this creation
          </AlertDescription>
        </Alert>

        {/* Discount Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select value={discountType} onValueChange={(value) => setDiscountType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  <span>Percentage Discount</span>
                </div>
              </SelectItem>
              {/* <SelectItem value="fixed">
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4" />
                  <span>Fixed Amount</span>
                </div>
              </SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value {discountType === "percentage" ? "(%)" : "(Amount)"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            min="0"
            max={discountType === "percentage" ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 50"}
          />
          <p className="text-sm text-muted-foreground">
            {discountType === "percentage" 
              ? "Enter percentage between 0-100" 
              : "Enter fixed discount amount"}
          </p>
        </div>

        {/* Currency Code (for fixed amount) */}
        {discountType === "fixed" && (
          <div className="space-y-2">
            <Label htmlFor="currencyCode">Currency Code</Label>
            <Input
              id="currencyCode"
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              placeholder="e.g., USD, EUR, INR"
              maxLength={3}
            />
            <p className="text-sm text-muted-foreground">
              Enter 3-letter currency code (ISO 4217)
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onUpdate}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Discounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
