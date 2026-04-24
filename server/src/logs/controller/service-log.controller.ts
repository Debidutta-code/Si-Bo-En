import { Request, Response } from 'express';
import { ServiceLogService } from '../services/service-log.service';
import { IGetLogsFilter } from '../repository/service-log.repository';

const serviceLogService = new ServiceLogService();

const getRequestId = (req: Request): string => req.headers['x-request-id'] as string;

export class ServiceLogController {
  public async getLogs(req: Request, res: Response): Promise<Response> {
    const {
      service, method, level, requestId,
      repoName, repoSuccess, messageText,
      fromDate, toDate, page, limit,
    } = req.query;

    const filters: IGetLogsFilter = {
      ...(service     && { service:     String(service) }),
      ...(method      && { method:      String(method) }),
      ...(level       && { level:       String(level) as IGetLogsFilter['level'] }),
      ...(requestId   && { requestId:   String(requestId) }),
      ...(repoName    && { repoName:    String(repoName) }),
      ...(messageText && { messageText: String(messageText) }),
      ...(repoSuccess !== undefined && { repoSuccess: repoSuccess === 'true' }),
      ...(fromDate    && { fromDate: new Date(String(fromDate)) }),
      ...(toDate      && { toDate:   new Date(String(toDate)) }),
      page:  page  ? Math.max(1, parseInt(String(page)))          : 1,
      limit: limit ? Math.min(100, parseInt(String(limit))) : 20,
    };

    const result = await serviceLogService.getLogs(filters, getRequestId(req));
    return res.status(result.success ? 200 : 400).json(result);
  }

  public async getErrorSummary(req: Request, res: Response): Promise<Response> {
    const result = await serviceLogService.getErrorSummary(getRequestId(req));
    return res.status(result.success ? 200 : 400).json(result);
  }

  public async getRequestTrace(req: Request, res: Response): Promise<Response> {
    const result = await serviceLogService.getRequestTrace(
      req.params.requestId,
      getRequestId(req)
    );
    return res.status(result.success ? 200 : 404).json(result);
  }

  public async getLogById(req: Request, res: Response): Promise<Response> {
    const result = await serviceLogService.getLogById(req.params.id, getRequestId(req));
    return res.status(result.success ? 200 : 404).json(result);
  }

  public async deleteLog(req: Request, res: Response): Promise<Response> {
    const result = await serviceLogService.deleteLog(req.params.id, getRequestId(req));
    return res.status(result.success ? 200 : 404).json(result);
  }
}

export const serviceLogController = new ServiceLogController();
