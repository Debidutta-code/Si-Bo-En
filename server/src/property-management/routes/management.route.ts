import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import {
    checkRoleBased,
    checkMultiplePermissions,
} from '../../middlewares/checkRole.middleware';
import {
    AminityController,
    Category,
    LoyaltyGuestFieldControllers,
    PaymentIntegrationController,
    PropertyType,
    RoomAminityControllerManagement,
    IntegrationPartnerController,
    IntegrationPartnerRequiredFieldsController,
    IntegrationPartnerUrlFieldsController,
} from '../../utils-management/controllers';

const managementRoute = Router();
const categoryRouter = Router();
const propertyTypeRouter = Router();
const destinationRouter = Router();
const aminityRouter = Router();
const roomAminityRouteM = Router();
const paymentIntegrationRouter = Router();
const loyaltyGuestFieldRouter = Router();
const partnerIntegrationRoute = Router();

const integrationPartnerController = new IntegrationPartnerController();
const integrationPartnerRequiredFieldsController =
    new IntegrationPartnerRequiredFieldsController();
const integrationPartnerUrlFieldsController =
    new IntegrationPartnerUrlFieldsController();

managementRoute.use('/category', categoryRouter);
managementRoute.use('/amenity', aminityRouter);
managementRoute.use('/type', propertyTypeRouter);
managementRoute.use('/destination-type', destinationRouter);
managementRoute.use('/loyalty-guest-field', loyaltyGuestFieldRouter);
managementRoute.use('/payment-integrations', paymentIntegrationRouter);
managementRoute.use('/integration-partner', partnerIntegrationRoute);

categoryRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        Category.getCategory
    );

categoryRouter
    .route('/create')
    .post(protect, checkRoleBased('canCDCategory'), Category.createCategory);

categoryRouter
    .route('/delete/:categoryName')
    .delete(protect, checkRoleBased('canCDCategory'), Category.deleteCategory);
propertyTypeRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        PropertyType.getPropertyTypeController
    );

propertyTypeRouter
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDPropertyType'),
        PropertyType.createPropertyTypeController
    );

propertyTypeRouter
    .route('/delete/:propertyTypeName')
    .delete(
        protect,
        checkRoleBased('canCDPropertyType'),
        PropertyType.deletePropertyTypeController
    );

aminityRouter
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        AminityController.getAmenities
    );

aminityRouter
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDAmenity'),
        AminityController.createAminity
    );

aminityRouter
    .route('/update')
    .patch(
        protect,
        checkRoleBased('canCDAmenity'),
        AminityController.deleteAmenities
    );

aminityRouter.use('/room', roomAminityRouteM);
roomAminityRouteM
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        RoomAminityControllerManagement.getRoomAmenities
    );

roomAminityRouteM
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDAmenity'),
        RoomAminityControllerManagement.createRoomAminity
    );

roomAminityRouteM
    .route('/update')
    .patch(
        protect,
        checkRoleBased('canCDAmenity'),
        RoomAminityControllerManagement.deleteRoomAmenities
    );

loyaltyGuestFieldRouter
    .route('/')
    .post(LoyaltyGuestFieldControllers.createLoyaltyGuestFields)
    .get(LoyaltyGuestFieldControllers.getLoyaltyGuestFields);
loyaltyGuestFieldRouter
    .route('/:id')
    .post(LoyaltyGuestFieldControllers.deleteLoyaltyGuestFields);

paymentIntegrationRouter
    .route('/')
    .get(protect, PaymentIntegrationController.getPaymentIntegrations)
    .post(protect, PaymentIntegrationController.createPaymentIntegration);

paymentIntegrationRouter
    .route('/:id')
    .patch(protect, PaymentIntegrationController.updatePaymentIntegration)
    .delete(protect, PaymentIntegrationController.deletePaymentIntegration);

paymentIntegrationRouter
    .route('/master-payment-integrations')
    .get(protect, PaymentIntegrationController.getMasterPaymentIntegrations);
partnerIntegrationRoute
    .route('/')
    .post(
        protect,
        restrictTo('super_admin'),
        integrationPartnerController.createPartner.bind(
            integrationPartnerController
        )
    )
    .get(
        protect,
        restrictTo('super_admin'),
        integrationPartnerController.getAllPartners.bind(
            integrationPartnerController
        )
    );
partnerIntegrationRoute
    .route('/:id')
    .delete(
        protect,
        restrictTo('super_admin'),
        integrationPartnerController.deletePartner.bind(
            integrationPartnerController
        )
    );

partnerIntegrationRoute
    .route('/required-fields')
    .post(
        protect,
        restrictTo('super_admin'),
        integrationPartnerRequiredFieldsController.createFields.bind(
            integrationPartnerRequiredFieldsController
        )
    );

partnerIntegrationRoute
    .route('/required-fields/:id')
    .delete(
        protect,
        restrictTo('super_admin'),
        integrationPartnerRequiredFieldsController.deleteField.bind(
            integrationPartnerRequiredFieldsController
        )
    );
partnerIntegrationRoute
    .route('/url-fields')
    .post(
        protect,
        restrictTo('super_admin'),
        integrationPartnerUrlFieldsController.createField.bind(
            integrationPartnerUrlFieldsController
        )
    );
partnerIntegrationRoute
    .route('/url-fields/:id')
    .delete(
        protect,
        restrictTo('super_admin'),
        integrationPartnerUrlFieldsController.deleteField.bind(
            integrationPartnerUrlFieldsController
        )
    );

export { managementRoute };
