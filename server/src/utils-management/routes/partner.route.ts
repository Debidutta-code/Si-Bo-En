import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import { IntegrationPartnerController, IntegrationPartnerRequiredFieldsController, IntegrationPartnerUrlFieldsController } from '../controllers';
const partnerIntegrationRoute = Router();
const integrationPartnerController = new IntegrationPartnerController();
const integrationPartnerRequiredFieldsController =
    new IntegrationPartnerRequiredFieldsController();
const integrationPartnerUrlFieldsController =
    new IntegrationPartnerUrlFieldsController();
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
        export { partnerIntegrationRoute };
