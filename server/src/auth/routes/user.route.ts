import { Router, RequestHandler } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import { UserController } from '../controller/user.controller';
import { addRoleBasedDetails } from '../../middlewares/checkRole.middleware';
const router = Router();

router.route("/")
  .get(protect, addRoleBasedDetails(), UserController.getUsersController);
router
  .route('/getUsersForMapping')
  .get(
    protect as RequestHandler,
    addRoleBasedDetails(),
    UserController.getUserForMappingController
  );

router.route('/me').get(protect as RequestHandler, UserController.getMe as any);
router.route("/assignUserToProperty").post(
  protect as RequestHandler,
  restrictTo(
    "super_admin", "group_manager", "hotel_manager", "brand_manager"
  ) as RequestHandler,
  UserController.mapUser
);
router
  .route('/:id')
  .get(
    protect as RequestHandler,
    restrictTo(
      "super_admin", "group_manager", "hotel_manager", "brand_manager", "staff", "revenue_manager"
    ) as RequestHandler,
    UserController.getUserById as any
  );

router
  .route('/update/:id')
  .put(
    protect as RequestHandler,
    restrictTo(
      "super_admin", "group_manager", "hotel_manager", "brand_manager"
    ) as RequestHandler,
    addRoleBasedDetails(),
    UserController.updateUserById as any
  );

// Delete user endpoint with role-based restrictions
router
  .route('/delete/:id')
  .delete(
    protect as RequestHandler,
    restrictTo(
      "super_admin", "group_manager", "hotel_manager", "brand_manager"
    ) as RequestHandler,
    addRoleBasedDetails(),
    UserController.deleteUser as any
  );


export default router;
