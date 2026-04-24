import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { serviceLogController } from '../controller/service-log.controller';

const router = Router();

// ── Middleware: attach requestId to every request ────────────

router.use((req: Request, _res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ?? uuidv4();
  next();
});

router.get('/', serviceLogController.getLogs);

router.get('/errors/summary', serviceLogController.getErrorSummary);

router.get('/trace/:requestId', serviceLogController.getRequestTrace);

router.get('/:id', serviceLogController.getLogById);

router.delete('/:id', serviceLogController.deleteLog);

export default router;