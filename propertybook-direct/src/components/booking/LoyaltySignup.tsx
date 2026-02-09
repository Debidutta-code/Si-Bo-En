import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gift, ChevronDown, ChevronUp, Percent, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Dynamic field types that can come from API
export interface LoyaltyField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface LoyaltyConfig {
  enabled: boolean;
  programName: string;
  discountPercentage: number;
  description: string;
  fields: LoyaltyField[];
}

// Mock loyalty config - this would come from API
const mockLoyaltyConfig: LoyaltyConfig = {
  enabled: true,
  programName: 'Elite Rewards',
  discountPercentage: 10,
  description: 'Join our loyalty program and get exclusive discounts on your stay!',
  fields: [
    { id: 'firstName', name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter your first name' },
    { id: 'lastName', name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter your last name' },
    { id: 'email', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
    { id: 'phone', name: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 000-0000' },
    { id: 'dateOfBirth', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false },
    { id: 'preferredContact', name: 'preferredContact', label: 'Preferred Contact Method', type: 'select', required: true, options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'sms', label: 'SMS' },
    ]},
    { id: 'newsletter', name: 'newsletter', label: 'Subscribe to newsletter for exclusive offers', type: 'checkbox', required: false },
    { id: 'terms', name: 'terms', label: 'I agree to the terms and conditions', type: 'checkbox', required: true },
  ],
};

// Build dynamic zod schema based on fields
const buildSchema = (fields: LoyaltyField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;
    
    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email('Please enter a valid email');
        break;
      case 'checkbox':
        fieldSchema = z.boolean();
        break;
      default:
        fieldSchema = z.string();
    }
    
    if (field.required) {
      if (field.type === 'checkbox') {
        fieldSchema = z.boolean().refine(val => val === true, { message: 'This field is required' });
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }
    
    shape[field.name] = fieldSchema;
  });
  
  return z.object(shape);
};

interface LoyaltySignupProps {
  loyaltyConfig?: LoyaltyConfig;
}

export function LoyaltySignup({ loyaltyConfig = mockLoyaltyConfig }: LoyaltySignupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { applyLoyaltyDiscount } = useBooking();
  
  const schema = buildSchema(loyaltyConfig.fields);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: loyaltyConfig.fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {} as Record<string, string | boolean>),
  });

  if (!loyaltyConfig.enabled) {
    return null;
  }

  const onSubmit = (data: Record<string, string | boolean>) => {
    console.log('Loyalty signup data:', data);
    // Apply discount to booking context
    applyLoyaltyDiscount(loyaltyConfig.discountPercentage, loyaltyConfig.programName);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">
                Welcome to {loyaltyConfig.programName}!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your {loyaltyConfig.discountPercentage}% discount has been applied.
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold text-sm">
                <Percent className="h-3 w-3" />
                {loyaltyConfig.discountPercentage}% OFF
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
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
              Join {loyaltyConfig.programName}
            </p>
            <p className="text-sm text-muted-foreground">
              Get {loyaltyConfig.discountPercentage}% off your booking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            <Percent className="h-3 w-3" />
            Save {loyaltyConfig.discountPercentage}%
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
            <p className="text-sm text-muted-foreground mb-4">
              {loyaltyConfig.description}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loyaltyConfig.fields.map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem
                          className={cn(
                            field.type === 'checkbox' && 'md:col-span-2 flex flex-row items-start space-x-3 space-y-0'
                          )}
                        >
                          {field.type === 'checkbox' ? (
                            <>
                              <FormControl>
                                <Checkbox
                                  checked={formField.value as boolean}
                                  onCheckedChange={formField.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </>
                          ) : (
                            <>
                              <FormLabel>
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                              </FormLabel>
                              <FormControl>
                                {field.type === 'select' ? (
                                  <Select
                                    value={formField.value as string}
                                    onValueChange={formField.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options?.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...formField}
                                    value={formField.value as string}
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Gift className="h-4 w-4 mr-2" />
                  Join & Get {loyaltyConfig.discountPercentage}% Discount
                </Button>
              </form>
            </Form>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
