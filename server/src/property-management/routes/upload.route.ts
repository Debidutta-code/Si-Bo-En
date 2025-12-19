import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions } from '../../middlewares/checkRole.middleware';
import { uploadHandler } from '../controller/upload.controller';
import { upload } from '../../utils/multer';
const router = Router();
router
  .route('/')
  .post(
    protect,
    checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
    upload.array('file'),
    uploadHandler
  );

export default router;
