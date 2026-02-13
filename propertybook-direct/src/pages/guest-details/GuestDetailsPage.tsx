import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useBooking } from '@/contexts/BookingContext';
import { PropertyHeader } from '@/components/booking/PropertyHeader';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { PriceSummary } from '@/components/booking/PriceSummary';

const guestDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().trim().email('Invalid email address').max(100, 'Email too long'),
  phone: z.string().trim().min(8, 'Phone number is required').max(20, 'Phone number too long'),
  specialRequest: z.string().trim().max(500, 'Special request too long').optional(),
});

type GuestDetailsFormData = z.infer<typeof guestDetailsSchema>;

export default function GuestDetailsPage() {
  const navigate = useNavigate();
  const { state, setGuestDetails } = useBooking();

  const form = useForm<GuestDetailsFormData>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      firstName: state.guestDetails?.firstName || '',
      lastName: state.guestDetails?.lastName || '',
      email: state.guestDetails?.email || '',
      phone: state.guestDetails?.phone || '',
      specialRequest: state.guestDetails?.specialRequest || '',
    },
  });

  useEffect(() => {
    // Redirect if no room selected
    if (!state.selectedRoom || !state.selectedRatePlan) {
      navigate('/rooms');
    }
  }, [state.selectedRoom, state.selectedRatePlan, navigate]);

  const onSubmit = (data: GuestDetailsFormData) => {
    setGuestDetails({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      specialRequest: data.specialRequest,
    });
    navigate('/payment');
  };

  if (!state.selectedRoom || !state.selectedRatePlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <PropertyHeader />
      <BookingProgress />

      <main className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1 max-w-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/rooms')}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to rooms
            </Button>

            <div className="bg-card rounded-xl border p-6 md:p-8 shadow-card">
              <h1 className="text-2xl font-bold mb-2">Guest Details</h1>
              <p className="text-muted-foreground mb-8">
                Please enter your information to complete the booking
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John" 
                              {...field} 
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Doe" 
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.doe@email.com" 
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRequest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requirements for your stay? (e.g., early check-in, dietary needs)"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="booking" size="xl" className="w-full">
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <PriceSummary />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Price Summary */}
      <PriceSummary variant="mobile" />
    </div>
  );
}
