import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { UploadController } from '../controllers';

const uploadRouter = Router();
const uploadController = new UploadController();
uploadRouter
    .route('/generate-url')
    .post(protect, uploadController.generatePresetUrl.bind(uploadController));

export { uploadRouter };
