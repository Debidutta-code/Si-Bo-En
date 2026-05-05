import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ChevronRight } from "lucide-react";

interface LoyaltyCardProps {
  loyaltyName?: string;
  discountType: string;
  discountValue: number;
  currencyCode?: string;
  isActive: boolean;
  onClick: () => void;
}

export default function LoyaltyCard({
  loyaltyName = "Loyalty Program",
  discountType,
  discountValue,
  currencyCode = "USD",
  isActive,
  onClick
}: LoyaltyCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all ${!isActive ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{loyaltyName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Discount</p>
            <p className="text-xl font-semibold">
              {discountType === "percentage" 
                ? `${discountValue}%` 
                : `${currencyCode} ${discountValue}`}
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="text-sm font-medium capitalize">{discountType}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
