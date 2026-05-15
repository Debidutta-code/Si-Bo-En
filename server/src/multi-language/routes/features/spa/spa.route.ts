import { Router } from 'express';
import { SpaTranslationController } from '../../controllers/features/spa/spa.controller';

const spaTranslationRouter = Router();
const spaTranslationController = new SpaTranslationController();

spaTranslationRouter.put('/:spaId', spaTranslationController.upsert.bind(spaTranslationController));
spaTranslationRouter.get('/:spaId', spaTranslationController.getTranslated.bind(spaTranslationController));
spaTranslationRouter.get('/:spaId/all', spaTranslationController.getAllTranslations.bind(spaTranslationController));
spaTranslationRouter.delete('/:spaId/:locale', spaTranslationController.deleteLocale.bind(spaTranslationController));

export { spaTranslationRouter };
