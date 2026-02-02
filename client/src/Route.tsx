import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import AuthLayout from "./Layout/Auth.layout.tsx";
import PropertyLayout from "./Layout/Property.layout.tsx";
import Login from "@/pages/login/page.tsx";
import Dashboard from "./pages/dashboard/page.tsx";
import Property from "@/pages/property/page.tsx";
import MembersPage from "./pages/members/page.tsx";
import LogsPage from "./pages/logs/page.tsx";
import Inventory from "./pages/inventory/page.tsx";
import PropertyById from "./pages/property/id/page.tsx";
import RatePlan from "./pages/rate-plan/page.tsx";
import CreateProperty from "./pages/property/create/page.tsx";
import AccessControlPage from "./pages/access-control/page.tsx";
import NotFound from "./pages/not-found/Page.tsx";
import GroupId from "./pages/property/group/page.tsx";
import BrandId from "./pages/property/brand/page.tsx";
import PropertyId from "./pages/property/property/page.tsx";
import MappedRatePlans from "./pages/map-rate-plan/page.tsx";
import Policies from "./pages/policies/page.tsx";
import PromoCode from "./pages/promocode/page.tsx";
import AddOn from "./pages/add-on/page.tsx";
import TaxSystem from "./pages/tax-system/page.tsx";
import BookingEngineConfig from "./pages/property/booking-engine-config/page.tsx";
import StartStopSell from "./pages/start-stop-sell/page.tsx";
import SeasonsManagement from "./pages/price-management/seasons/SeasonsManagement.tsx";
import CalendarView from "./pages/price-management/calendar/CalendarView.tsx";
import PeriodsManagement from "./pages/price-management/periods/PeriodsManagement.tsx";
import TableView from "./pages/price-management/table/TableView.tsx";
import Bookings from "./pages/bookings/page.tsx";
import RestrictionsPageWrapper from "./pages/cta-ctd/page.tsx";
import InventoryPage from "./pages/calender-view/page.tsx";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.tsx";
import LinkVerification from "./components/auth/LinkVerification.tsx";
import ContactSupport from "./pages/contact-support/ContactSupport.tsx";
import ManagementPage from "./pages/management/Management.tsx";
import GeoRatePlanList from "./pages/promotions/geo/page.tsx";
import MLOSRuleList from "./pages/promotions/mlos/page.tsx";
import MobilePromotionList from "./pages/promotions/mobile-only/page.tsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPasswordForm />} />
        <Route path="reset-password" element={<LinkVerification />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/property/create" element={<CreateProperty />} />
      </Route>
      <Route path="/app" element={<AuthLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="property">

          <Route path="super/:superId" element={<Property />} />
          <Route path="group/:groupId" element={<GroupId />} />
          <Route path="brand/:brandId" element={<BrandId />} />
          <Route path="property/:propertyId" element={<PropertyId />} />

        </Route>
        <Route path="members" element={<MembersPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="access-control" element={<AccessControlPage />} />
        <Route path="bookings" element={<Bookings />} />
         <Route path="utils-management" element={<ManagementPage />} />

      </Route>
      <Route path="/property" element={<PropertyLayout />}>
        <Route path=":propertyId" element={<PropertyById />} />
        <Route path="rate-plan/:propertyId" element={<RatePlan />} />
        <Route path="rate-plan/map/:propertyId" element={<MappedRatePlans />} />
        <Route path="calender-view/:propertyId" element={<InventoryPage />} />
        <Route path="inventory/:propertyId" element={<Inventory />} />
        <Route path="policy/:propertyId" element={<Policies />} />
        <Route path="promo-code/:propertyId" element={<PromoCode />} />
        <Route path="add-on/:propertyId" element={<AddOn />} />
        <Route path="tax-system/:propertyId" element={<TaxSystem />} />
        <Route path="start-stop-sell/:propertyId" element={<StartStopSell />} />
        <Route path="cta-ctd/:propertyId" element={<RestrictionsPageWrapper />} />
        <Route path="booking-engine-config/:propertyId" element={<BookingEngineConfig />} />
        <Route path="price-management/seasons/:propertyId" element={<SeasonsManagement />} />
        <Route path="price-management/calendar/:propertyId" element={<CalendarView />} />
        <Route path="price-management/periods/:propertyId" element={<PeriodsManagement />} />
        <Route path="price-management/table/:propertyId" element={<TableView />} />
        <Route path="promotion/geo/:propertyId" element={<GeoRatePlanList />} />
        <Route path="promotion/mlos/:propertyId" element={<MLOSRuleList />} />
        <Route path="promotion/mobile-only/:propertyId" element={<MobilePromotionList />} />
      </Route>
      <Route path="members" element={<MembersPage />} />
      <Route path="logs" element={<LogsPage />} />
      <Route path="access-control" element={<AccessControlPage />} />
      <Route path="bookings" element={<AccessControlPage />} />
      <Route path="contact-support" element={<ContactSupport />} />

      <Route path="*" element={<NotFound />} />

    </>
  )
);