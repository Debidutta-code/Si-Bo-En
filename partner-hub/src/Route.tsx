import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import SearchLayout from './Layout/SearchLayout';
import LoginPage from './pages/login/page';
import DashboardPage from './pages/dashboard/page';
import PropertyPage from './pages/property/Property';
import PropertyRoomsPage from './pages/property/rooms/Room';
import BookingPage from './pages/bookings/page';
import ReservationsPage from './pages/reservations/Reservations';
import NotFoundPage from './pages/not-found/page';
import PaymentSuccessPage from './pages/payment/page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/reservations',
        element: <ReservationsPage />,
      },
      {
        path: '/property/:propertyId/rooms/:roomId/booking',
        element: <BookingPage />,
      },
       {
        path: '/payment-success',
        element: <PaymentSuccessPage />,
      },
      
    ],
  },
  {
    element: <SearchLayout />,
    children: [
      {
        path: '/property',
        element: <PropertyPage />,
      },
      {
        path: '/property/:propertyId/rooms',
        element: <PropertyRoomsPage />,
      },
      
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
