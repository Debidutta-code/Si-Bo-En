import { FilterQuery } from 'mongoose';
import { IServiceLog, ServiceLogModel } from '../model/service-logger.model';

export interface IGetLogsFilter {
  requestId?: string;
  service?: string;
  method?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  fromDate?: Date;
  toDate?: Date;
  messageText?: string;
  repoName?: string;
  repoSuccess?: boolean;
  page?: number;
  limit?: number;
}

export class ServiceLogRepository {

  // ── Create ───────────────────────────────────────────────

  async create(data: Partial<IServiceLog>): Promise<IServiceLog> {
    return ServiceLogModel.create(data);
  }


  async findById(id: string): Promise<IServiceLog | null> {
    return ServiceLogModel.findById(id).lean() as unknown as IServiceLog | null;
  }

  // ── Fetch many with filters + pagination ─────────────────

  async findMany(filters: IGetLogsFilter): Promise<{
    logs: IServiceLog[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      requestId, service, method, level,
      fromDate, toDate, messageText, repoName, repoSuccess,
      page = 1, limit = 20,
    } = filters;

    const query: FilterQuery<IServiceLog> = {};

    if (requestId)              query.requestId       = requestId;
    if (service)                query.service         = service;
    if (method)                 query.method          = method;
    if (level)                  query.level           = level;
    if (repoName)               query['repoCalls.repoName'] = repoName;
    if (repoSuccess !== undefined) query['repoCalls.success'] = repoSuccess;
    if (messageText)            query['messages.text'] = { $regex: messageText, $options: 'i' };

    if (fromDate || toDate) {
      query.timestamp = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate   && { $lte: toDate }),
      };
    }

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      ServiceLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean() as unknown as IServiceLog[],
      ServiceLogModel.countDocuments(query),
    ]);

    return {
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }


  async findByRequestId(requestId: string): Promise<IServiceLog[]> {
    return ServiceLogModel.find({ requestId }).sort({ timestamp: 1 }).lean() as unknown as IServiceLog[];
  }


  async getErrorSummary(): Promise<any[]> {
    return ServiceLogModel.aggregate([
      { $match: { level: 'error' } },
      {
        $group: {
          _id:        { service: '$service', method: '$method' },
          errorCount: { $sum: 1 },
          lastSeen:   { $max: '$timestamp' },
          sample:     { $first: '$error' },
        },
      },
      { $sort: { errorCount: -1 } },
    ]);
  }

  // ── Delete one ───────────────────────────────────────────

  async deleteById(id: string): Promise<boolean> {
    const result = await ServiceLogModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}