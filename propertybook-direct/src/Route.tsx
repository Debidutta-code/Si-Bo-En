import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from '@/contexts/BookingContext';
import NotFound from './pages/NotFound';
import LandingPage from './pages/landing/LandingPage';
import RoomsPage from './pages/rooms/RoomsPage';
import GuestDetailsPage from './pages/guest-details/GuestDetailsPage';
import AddOnsPage from './pages/addons/AddOnsPage';
import PaymentPage from './pages/payment/PaymentPage';
import ConfirmationPage from './pages/confirmation/ConfirmationPage';


// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
    <BookingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/add-ons" element={<AddOnsPage />} />
              <Route path="/guest-details" element={<GuestDetailsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </BookingProvider>
);

export default App;
