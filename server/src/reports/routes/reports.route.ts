// In your routes file

import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { ReportsController } from "../controllers";

const reportsController = new ReportsController();
export const reportsRouter = Router();

// Generate voucher
reportsRouter.get('/booking-voucher/:bookingCode', 
    protect, 
    reportsController.getBookingVoucher
);

// Generate invoice
reportsRouter.get('/booking-invoice/:bookingCode',
    protect,
    reportsController.getBookingInvoice
);


// Get filter options (groups, brands, properties) based on user role
reportsRouter.get('/filter-options', protect, reportsController.getFilterOptions);

reportsRouter.get('/generate', protect, reportsController.generateV2Report);


