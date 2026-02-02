import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertCircle, Percent, DollarSign } from "lucide-react";

interface CreateLoyaltyFormProps {
  onSubmit: (data: { discountType: string; discountValue: number; currencyCode: string }) => void;
}

export default function CreateLoyaltyForm({ onSubmit }: CreateLoyaltyFormProps) {
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("USD");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">Loyalty Configuration</CardTitle>
          <CardDescription>No loyalty configuration found for this creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Create a loyalty configuration to start offering discounts and benefits to your customers
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>Percentage Discount</span>
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Fixed Amount</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          </div>

          {discountType === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="currencyCode">Currency Code</Label>
              <Input
                id="currencyCode"
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="USD, EUR, GBP"
                maxLength={3}
              />
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button onClick={() => onSubmit({ discountType, discountValue, currencyCode })} size="lg" className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Loyalty Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
