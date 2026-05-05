import { Router, RequestHandler } from 'express';
import { AuthController } from '../controller/authentication.controller';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import { addRoleBasedDetails } from '../../middlewares/checkRole.middleware';

const router = Router();

router.route('/login').post(AuthController.login);
router
  .route('/create-user')
  .post(
    protect as any,
    restrictTo("super_admin", "group_manager", "hotel_manager", "brand_manager") as RequestHandler,
    addRoleBasedDetails() as any,
    AuthController.createUser as unknown as RequestHandler
  );
router.route('/logout').post(AuthController.logout as RequestHandler);

export default router;
