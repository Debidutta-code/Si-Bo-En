import { Router } from 'express';
import CurrencyController from '../controllers/currency.controller';
import { bullMQHelper } from '../../index'; 

const router = Router();

// No connection config, no init — all handled in server.ts
const currencyController = new CurrencyController(bullMQHelper);

router.get('/rates', currencyController.getAllRates.bind(currencyController));
router.get('/rates/:currency', currencyController.getCurrencyRate.bind(currencyController));
router.get('/rates-hash', currencyController.getAllRatesFromHash.bind(currencyController));
router.post('/fetch', currencyController.triggerManualFetch.bind(currencyController));
router.get('/queue-status', currencyController.getQueueStatus.bind(currencyController));
router.get('/metadata', currencyController.getMetadata.bind(currencyController));

export default router;