import { Router } from 'express';
import CurrencyController from '../controllers/currency.controller';
import { currencyQueue } from '../../index'; 

const router = Router();

router.route('/rates').get((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.getAllRates(req, res);
});
router.route('/rates/:currency').get((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.getCurrencyRate(req, res);
});
router.route('/rates-hash').get((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.getAllRatesFromHash(req, res);
});
router.route('/fetch').post((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.triggerManualFetch(req, res);
});
router.route('/queue-status').get((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.getQueueStatus(req, res);
});
router.route('/metadata').get((req, res) => {
    const currencyController = new CurrencyController(currencyQueue);
    return currencyController.getMetadata(req, res);
});

export default router;