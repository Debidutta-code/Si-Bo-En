import { Router } from 'express';
import CurrencyController from '../controllers/currency.controller';
import { getBullMQHelper } from '../helpers';

const router = Router();

// Controller is created lazily on first request to avoid circular import / init-order issues
let _controller: CurrencyController | null = null;
function getController(): CurrencyController {
    if (!_controller) {
        _controller = new CurrencyController(getBullMQHelper());
    }
    return _controller;
}

router.get('/rates',         (req, res) => getController().getAllRates(req, res));
router.get('/rates/:currency', (req, res) => getController().getCurrencyRate(req, res));
router.get('/rates-hash',    (req, res) => getController().getAllRatesFromHash(req, res));
router.post('/fetch',        (req, res) => getController().triggerManualFetch(req, res));
router.get('/queue-status',  (req, res) => getController().getQueueStatus(req, res));
router.get('/metadata',      (req, res) => getController().getMetadata(req, res));
router.get('/health',        (req, res) => getController().healthCheck(req, res));

export default router;
