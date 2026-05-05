import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions, checkRoleBased } from '../../middlewares/checkRole.middleware';
import {AccessControl} from '../controller';
const router = Router();

router
  .route('/createNewRole')
  .post(
    protect as any,
    // checkRoleBased('canCreateNewRole'),
    AccessControl.createNewRole
  );
router
  .route('/modify/:role')
  .put(
    protect,
    checkRoleBased('canModifyAccess'),
    AccessControl.updateAccessForLevel
  );
router
  .route('/get-all')
  .get(protect, checkRoleBased('canViewAccess'), AccessControl.getAllAccesses);
router
  .route('/get-all-roles')
  .get(protect, AccessControl.getAllRoles);
router
  .route('/get/:role')
  .get(
    protect,
    checkRoleBased('canViewAccess'),
    AccessControl.getAccessForRole
  );
router
  .route('/delete/:role')
  .delete(
    protect,
    checkMultiplePermissions(['canViewAccess',"canModifyAccess"]),
    AccessControl.deleteRoleController
  );

export default router;
