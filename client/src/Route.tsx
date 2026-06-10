import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import AuthLayout from "./Layout/Auth.layout.tsx";
import PropertyLayout from "./Layout/Property.layout.tsx";
import Login from "@/pages/login/page.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Property from "@/pages/property/Super.tsx";
import MembersPage from "./pages/members/Members.tsx";
import LogsPage from "./pages/logs/ApiLogs.tsx";
import Inventory from "./pages/inventory/Inventory.tsx";
import PropertyById from "./pages/property/id/PropertyD.tsx";
import RatePlan from "./pages/rate-plan/RatePlan.tsx";
import CreateProperty from "./pages/property/create/page.tsx";
import AccessControlPage from "./pages/access-control/AccessControll.tsx";
import NotFound from "./pages/not-found/NotFound.tsx";
import GroupId from "./pages/property/group/Group.tsx";
import BrandId from "./pages/property/brand/Brand.tsx";
import PropertyId from "./pages/property/property/Property.tsx";
import MappedRatePlans from "./pages/map-rate-plan/RateAllortment.tsx";
import Policies from "./pages/policies/Policies.tsx";
import PromoCode from "./pages/promocode/Promocode.tsx";
import AddOn from "./pages/add-on/Addon.tsx";
import TaxSystem from "./pages/tax-system/TaxSystem.tsx";
import BookingEngineConfig from "./pages/property/booking-engine-config/CPanel.tsx";
import StartStopSell from "./pages/start-stop-sell/Start-Stop-Sell.tsx";
import SeasonsManagement from "./pages/price-management/seasons/SeasonsManagement.tsx";
import CalendarView from "./pages/price-management/calendar/CalendarView.tsx";
import PeriodsManagement from "./pages/price-management/periods/PeriodsManagement.tsx";
import TableView from "./pages/price-management/table/TableView.tsx";
import Bookings from "./pages/bookings/Bookings.tsx";
import RestrictionsPageWrapper from "./pages/cta-ctd/CTA-CTD.tsx";
import InventoryPage from "./pages/calender-view/Calender.tsx";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.tsx";
import LinkVerification from "./components/auth/LinkVerification.tsx";
import ContactSupport from "./pages/contact-support/ContactSupport.tsx";
import ManagementPage from "./pages/management/Management.tsx";
import Loyalty from "./pages/loyalty/Loyalty.tsx";

import GeoRatePlanList from "./pages/promotions/geo/Geo.tsx";
import MLOSRuleList from "./pages/promotions/mlos/MLOS.tsx";
import { DeviceSpecificPromotionList } from "./pages/promotions/device-specific/DeviceSpecific.tsx";
import { EarlyBirdPromotionList } from "./pages/promotions/early-bird/Early-Bird.tsx";
import { OfferForTonightList } from "./pages/promotions/offer-for-tonight/Offer-For-Tonight.tsx";
import CustomizablePromotionList from "./pages/promotions/customizable-promotion/Customizable-Deals.tsx";
import LoyaltyForm from "./pages/loyalty/LoyaltyForm.tsx";
import LoyaltyGuest from "./pages/loyalty/LoyaltyGuest.tsx";
import LoyaltyContent from "./pages/loyalty/LoyaltyContent.tsx";
import PropertyLoyalityManagement from "./pages/loyalty/PropertyLoyalties.tsx";
import PropertyLoyaltyGuests from "./pages/loyalty/PropertyLoyaltyGuests.tsx";
import ActivePropertyLoyalty from "./pages/loyalty/ActivepropertyLoyaty.tsx";
import LoyaltyLevels from "./pages/loyalty/LoyaltyLevels.tsx";
import AgenciesListPage from "./pages/agency/AgenciesListPage.tsx";
import AgencyDetailsPage from "./pages/agency/AgencyDetailsPage.tsx";
import AgencyAgentsPage from "./pages/agency/AgencyAgentsPage.tsx";
import AgenticPropertyDetailsPage from "./pages/agency/AgenticPropertyDetailsPage.tsx";
import AgencyApplicationsPage from "./pages/agency/AgencyApplicationsPage.tsx";
import PropertyAgenciesPage from "./pages/property-agencies/PropertyAgenciesPage.tsx";
import AgencyReservationsPage from "./pages/property-agencies/AgencyReservationsPage.tsx";
import BookingOffset from "./pages/booking-offset/BookingOffset.tsx";
import CustomId from "./pages/property/Regional/Regional.tsx";
import CustomerSupport from "./pages/customer-support/CustomerSupport.tsx";
import Spa from "./pages/spa/Spa.tsx";
import ServiceLog from "./pages/service-logs/ServiceLog.tsx";
import MySpa from "./pages/spa/My-Spa.tsx";
import Report from "./pages/reports/Report.tsx";
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
          <Route path="super/:creationId" element={<Property />} />
          <Route path="group/:creationId" element={<GroupId />} />
          <Route path="brand/:creationId" element={<BrandId />} />
          <Route path="regional/:creationId" element={<CustomId />} />

          <Route path="property/:creationId" element={<PropertyId />} />

        </Route>
        <Route path="loyalty">
          <Route path=":creationId" index element={<Loyalty />} />
          <Route
            path="register-form/:creationId"
            index
            element={<LoyaltyForm />}
          />
          <Route
            path="content-config/:creationId"
            index
            element={<LoyaltyContent />}
          />
          <Route
            path="loyalty-guests/:creationId"
            index
            element={<LoyaltyGuest />}
          />
          <Route
            path="levels/:creationId"
            element={<LoyaltyLevels />}
          />
        </Route>
        <Route path="members" element={<MembersPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="service-logs" element={<ServiceLog />} />

        <Route path="access-control" element={<AccessControlPage />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="utils-management" element={<ManagementPage />} />
        <Route path="contact-support" element={<ContactSupport />} />
        <Route path="reports" element={<Report />} />

        {/* Agency Routes - Super Admin Only */}
        <Route path="agency">
          <Route index element={<AgenciesListPage />} />
          <Route path="applications" element={<AgencyApplicationsPage />} />
          <Route path=":agencyId">
            <Route index element={<AgencyDetailsPage />} />
            <Route path="agents" element={<AgencyAgentsPage />} />
            <Route
              path="property/:propertyId"
              element={<AgenticPropertyDetailsPage />}
            />
          </Route>
        </Route>
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
        <Route path="booking-offset/:propertyId" element={<BookingOffset />} />
        <Route path="customer-support/:propertyId" element={<CustomerSupport />} />
        <Route path="spa/:propertyId" element={<Spa />} />
        <Route path="spa/:propertyId/:spaId" element={<Spa />} />
        <Route path="spa/me/:propertyId" element={<MySpa />} />

        <Route
          path="cta-ctd/:propertyId"
          element={<RestrictionsPageWrapper />}
        />
        <Route
          path="booking-engine-config/:propertyId"
          element={<BookingEngineConfig />}
        />
        <Route
          path="price-management/seasons/:propertyId"
          element={<SeasonsManagement />}
        />
        <Route
          path="price-management/calendar/:propertyId"
          element={<CalendarView />}
        />
        <Route
          path="price-management/periods/:propertyId"
          element={<PeriodsManagement />}
        />
        <Route
          path="price-management/table/:propertyId"
          element={<TableView />}
        />

        {/* Property Agencies Routes */}
        <Route path=":propertyId/agencies" element={<PropertyAgenciesPage />} />
        <Route
          path=":propertyId/agencies/:agencyId/reservations"
          element={<AgencyReservationsPage />}
        />

        <Route path="loyalty/:propertyId">
          <Route path="" index element={<PropertyLoyalityManagement />} />
          <Route
            path="active/:loyaltyConfigId"
            element={<ActivePropertyLoyalty />}
          />
          <Route
            path="guests/:loyalityId"
            element={<PropertyLoyaltyGuests />}
          />
        </Route>

        <Route path="promotion/">
          <Route path="geo/:propertyId" element={<GeoRatePlanList />} />
          <Route path="mlos/:propertyId" element={<MLOSRuleList />} />
          <Route
            path="device-specific/:propertyId"
            element={<DeviceSpecificPromotionList />}
          />
          <Route
            path="early-bird/:propertyId"
            element={<EarlyBirdPromotionList />}
          />
          <Route
            path="offer-for-tonight/:propertyId"
            element={<OfferForTonightList />}
          />
          <Route
            path="customizable-deal/:propertyId"
            element={<CustomizablePromotionList />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </>,
  ),
);
