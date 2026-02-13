import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gift, ChevronDown, ChevronUp, Percent, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import type { ILoyaltyProgramConfig } from '@/types/booking';

// Build dynamic zod schema based on field configs
const buildSchema = (fieldConfigs: ILoyaltyProgramConfig['CreationLoyaltyConfig']['LoyaltyProgramFieldConfig']) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  fieldConfigs
    .filter(field => field.visibleInRegistration)
    .forEach((field) => {
      let fieldSchema: z.ZodTypeAny;
      
      // Determine field type based on field name
      if (field.fieldName.includes('email')) {
        fieldSchema = z.string().email('Please enter a valid email');
      } else {
        fieldSchema = z.string();
      }
      
      if (field.required) {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.fieldName} is required`);
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      shape[field.fieldName] = fieldSchema;
    });
  
  // Add terms acceptance
  shape['acceptTerms'] = z.boolean().refine(val => val === true, { 
    message: 'You must accept the terms and conditions' 
  });
  
  return z.object(shape);
};

interface LoyaltySignupProps {
  className?: string;
}

export function LoyaltySignup({ className }: LoyaltySignupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { state, applyLoyaltyDiscount } = useBooking();
  
  const loyaltyConfig = state.propertyDetails?.loyaltyProgramConfig;

  if (!loyaltyConfig || !loyaltyConfig.isActive || !loyaltyConfig.CreationLoyaltyConfig) {
    return null;
  }

  const { CreationLoyaltyConfig } = loyaltyConfig;
  const visibleFields = CreationLoyaltyConfig.LoyaltyProgramFieldConfig.filter(
    field => field.visibleInRegistration
  );

  const schema = buildSchema(CreationLoyaltyConfig.LoyaltyProgramFieldConfig);
  
  const defaultValues = visibleFields.reduce((acc, field) => {
    acc[field.fieldName] = '';
    return acc;
  }, {} as Record<string, string | boolean>);
  defaultValues['acceptTerms'] = false;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: Record<string, string | boolean>) => {
    console.log('Loyalty signup data:', data);
    
    // Apply loyalty discount
    applyLoyaltyDiscount({
      isApplied: true,
      programId: CreationLoyaltyConfig.id,
      programName: loyaltyConfig.propertyName,
      discountType: CreationLoyaltyConfig.loyaltyDiscountType,
      discountValue: CreationLoyaltyConfig.discountValue,
      currencyCode: CreationLoyaltyConfig.currencyCode,
      logo: CreationLoyaltyConfig.BasicLoyaltyProgram?.logo,
    });
    
    setIsSubmitted(true);
  };

  const programName = loyaltyConfig.propertyName || 'Loyalty Program';
  const discountValue = CreationLoyaltyConfig.discountValue;
  const discountType = CreationLoyaltyConfig.loyaltyDiscountType;
  const discountDisplay = discountType === 'percentage' 
    ? `${discountValue}%` 
    : `${CreationLoyaltyConfig.currencyCode} ${discountValue}`;

  if (isSubmitted) {
    return (
      <Card className={cn("border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">
                Welcome to {programName}!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your {discountDisplay} discount has been applied.
              </p>
            </div>
            <div className="text-right">
              {CreationLoyaltyConfig.BasicLoyaltyProgram?.logo?.[0] && (
                <img 
                  src={CreationLoyaltyConfig.BasicLoyaltyProgram.logo[0]} 
                  alt={programName}
                  className="h-8 object-contain"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5 overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">
              Join {programName}
            </p>
            <p className="text-sm text-muted-foreground">
              Get {discountDisplay} off your booking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {CreationLoyaltyConfig.BasicLoyaltyProgram?.logo?.[0] && (
            <img 
              src={CreationLoyaltyConfig.BasicLoyaltyProgram.logo[0]} 
              alt={programName}
              className="h-6 object-contain hidden sm:block"
            />
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {discountType === 'percentage' ? (
              <>
                <Percent className="h-3 w-3" />
                Save {discountValue}%
              </>
            ) : (
              <>Save {discountDisplay}</>
            )}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="p-4 pt-0 border-t border-primary/10">
            {/* Show loyalty conditions if available */}
            {CreationLoyaltyConfig.loyaltyConditions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Program Benefits:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {CreationLoyaltyConfig.loyaltyConditions
                    .filter(condition => condition.isActive && !condition.isDeleted)
                    .map((condition) => (
                      <li key={condition.id} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{condition.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Show special conditions if available */}
            {CreationLoyaltyConfig.loyaltySpecialConditions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">Special Offers:</p>
                <div className="space-y-2">
                  {CreationLoyaltyConfig.loyaltySpecialConditions
                    .filter(condition => condition.isActive && !condition.isDeleted)
                    .map((condition) => (
                      <div key={condition.id} className="bg-primary/5 p-2 rounded">
                        <p className="text-sm font-medium text-foreground">{condition.title}</p>
                        {condition.subTitle && (
                          <p className="text-xs text-muted-foreground">{condition.subTitle}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleFields.map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.fieldName}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={field.fieldName.includes('email') ? 'email' : 'text'}
                              placeholder={`Enter ${field.fieldName.replace(/_/g, ' ')}`}
                              {...formField}
                              value={formField.value as string}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Terms and conditions checkbox */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I agree to the loyalty program terms and conditions
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg">
                  <Gift className="h-4 w-4 mr-2" />
                  Join & Get {discountDisplay} Discount
                </Button>
              </form>
            </Form>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
