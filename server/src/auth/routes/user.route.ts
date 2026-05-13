import { Router, RequestHandler } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import { UserController } from '../controller/user.controller';
import { addRoleBasedDetails } from '../../middlewares/checkRole.middleware';
const router = Router();

router.route('/forgot-password').post(UserController.forgotPassword);
router.route('/verify-reset-otp').post(UserController.verifyResetOTP);
router.route('/reset-password').post(UserController.resetPassword);

router
    .route('/')
    .get(protect, addRoleBasedDetails(), UserController.getUsersController);
router
    .route('/getUsersForMapping')
    .get(
        protect ,
        addRoleBasedDetails(),
        UserController.getUserForMappingController
    );

router.route('/me').get(protect , UserController.getMe );
router
    .route('/assignUserToProperty')
    .post(
        protect ,
        restrictTo(
            'super_admin',
            'group_manager',
            'hotel_manager',
            'brand_manager'
        ) ,
        UserController.mapUser
    );
router
    .route('/:id')
    .get(
        protect ,
        restrictTo(
            'super_admin',
            'group_manager',
            'hotel_manager',
            'brand_manager',
            'staff',
            'revenue_manager'
        ) ,
        UserController.getUserById 
    );

router
    .route('/update/:id')
    .put(
        protect ,
        restrictTo(
            'super_admin',
            'group_manager',
            'hotel_manager',
            'brand_manager'
        ) ,
        addRoleBasedDetails(),
        UserController.updateUserById 
    );

// Delete user endpoint with role-based restrictions
router
    .route('/delete/:id')
    .delete(
        protect ,
        restrictTo(
            'super_admin',
            'group_manager',
            'hotel_manager',
            'brand_manager'
        ) ,
        addRoleBasedDetails(),
        UserController.deleteUser 
    );

export default router;
