import { v4 as uuidv4 } from 'uuid';
import { ILogMessage, IRepoCall, ServiceLogModel } from '../model/service-logger.model';
import { errorResponse, generatePaginationMeta, IApiResponse, paginatedSuccessResponse, successResponse } from '../../utils';
import { IGetLogsFilter, ServiceLogRepository } from '../repository/service-log.repository';


export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const R = '\x1b[0m';
const B = '\x1b[1m';
const D = '\x1b[2m';
const LEVEL_COLOR: Record<LogLevel, string> = {
  info: '\x1b[36m', debug: '\x1b[35m', warn: '\x1b[33m', error: '\x1b[31m',
};
const LABEL_COLOR: Record<string, string> = {
  '➤ INCOMING':      '\x1b[34m',
  '📦 REPO CALL':    '\x1b[36m',
  '✔ REPO':          '\x1b[32m',
  '✘ REPO':          '\x1b[31m',
  '💬 MESSAGES':     '\x1b[33m',
  '✔ SERVICE RESP':  '\x1b[32m',
  '✘ SERVICE RESP':  '\x1b[31m',
  '⚠ ERROR':         '\x1b[31m',
};
const cl = (t: string, code: string) => `${code}${t}${R}`;
const pj = (v: unknown) => JSON.stringify(v, null, 2);


export class LogBuilder {
  private requestId: string;
  private service: string;
  private method: string;
  private level: LogLevel = 'info';

  private incomingData?: unknown;
  private repoCalls: IRepoCall[] = [];
  private messages: ILogMessage[] = [];
  private serviceResponse?: IApiResponse;
  private errorDetail?: { message: string; stack?: string; code?: string | number };
  private meta?: Record<string, unknown>;

  constructor(service: string, method: string, requestId?: string) {
    this.service   = service;
    this.method    = method;
    this.requestId = requestId ?? uuidv4();
  }

  // ── setters ──────────────────────────────────

  setIncoming(data: unknown): this {
    this.incomingData = data;
    return this;
  }

  setLevel(level: LogLevel): this {
    this.level = level;
    return this;
  }

  setMeta(meta: Record<string, unknown>): this {
    this.meta = meta;
    return this;
  }

  setServiceResponse(response: IApiResponse<unknown>): this {
    this.serviceResponse = response;
    // auto-elevate level on failure
    if (!response.success && this.level === 'info') this.level = 'warn';
    return this;
  }

  setError(err: unknown): this {
    const e = err as any;
    this.errorDetail = {
      message: e?.message ?? String(err),
      stack:   e?.stack,
      code:    e?.code,
    };
    this.level = 'error';
    return this;
  }


  addRepoCall(call: IRepoCall): this {
    this.repoCalls.push(call);
    return this;
  }

  // ── open message trail ────────────────────────

  /**
   * Push a step message.
   *
   * Usage:
   *   builder.pushMessage('User fetched successfully');
   *   builder.pushMessage('Password mismatched', 'warn', { providedHash: '...' });
   */
  pushMessage(
    text: string,
    level: LogLevel = 'info',
    data?: Record<string, unknown>
  ): this {
    this.messages.push({ text, level, timestamp: new Date(), data });
    return this;
  }

  // ── save to DB + console ──────────────────────

  /**
   * Fire-and-forget: does NOT block the caller.
   * The service returns immediately; the MongoDB write happens in the background.
   *
   * Usage (no await needed):
   *   log.save();
   *   return response;
   */
  save(): void {
    this.persist();
  }

  private persist(): void {
    ServiceLogModel.create({
      requestId:       this.requestId,
      timestamp:       new Date(),
      service:         this.service,
      method:          this.method,
      level:           this.level,
      incomingData:    this.incomingData    ?? null,
      repoCalls:       this.repoCalls,
      messages:        this.messages,
      serviceResponse: this.serviceResponse ?? null,
      error:           this.errorDetail     ?? null,
      meta:            this.meta            ?? null,
    }).catch((dbErr) => {
      console.error('[ServiceLogger] ⚠ Failed to persist log to MongoDB:', dbErr);
    });
  }

  // ── console printer ───────────────────────────

  private printToConsole(): void {
    const lc = LEVEL_COLOR[this.level];
    console.log(
      `\n${B}${'─'.repeat(72)}${R}\n` +
      `${cl(`[${this.level.toUpperCase()}]`, lc)} ` +
      `${B}${this.service}${R}${D}::${R}${B}${this.method}${R}  ` +
      `${D}requestId=${this.requestId}${R}`
    );

    if (this.incomingData !== undefined)
      console.log(cl('  ➤ INCOMING', LABEL_COLOR['➤ INCOMING']), pj(this.incomingData));

    // Repo calls
    this.repoCalls.forEach((call, i) => {
      const statusLabel = call.success ? '✔ REPO' : '✘ REPO';
      console.log(
        cl(`\n  📦 REPO CALL [${i + 1}] ${call.repoName}::${call.method}`, LABEL_COLOR['📦 REPO CALL']) +
        (call.durationMs != null ? D + `  (${call.durationMs}ms)` + R : '')
      );
      if (call.input    !== undefined) console.log(`    ${D}input   :${R}`, pj(call.input));
      if (call.response !== undefined) console.log(`    ${cl(statusLabel, LABEL_COLOR[statusLabel])} :`, pj(call.response));
      if (call.error)                  console.log(`    ${cl('⚠ error', LABEL_COLOR['⚠ ERROR'])} : ${call.error.message}`);
    });

    // Messages trail
    if (this.messages.length > 0) {
      console.log(cl('\n  💬 MESSAGES', LABEL_COLOR['💬 MESSAGES']));
      this.messages.forEach((m, i) => {
        const mc = LEVEL_COLOR[m.level];
        console.log(
          `    ${D}[${i + 1}]${R} ${cl(m.level.toUpperCase(), mc)} ${m.text}` +
          (m.data ? `  ${D}${pj(m.data)}${R}` : '')
        );
      });
    }

    // Service response
    if (this.serviceResponse !== undefined) {
      const label = this.serviceResponse.success ? '✔ SERVICE RESP' : '✘ SERVICE RESP';
      console.log(cl(`\n  ${label}`, LABEL_COLOR[label]), pj(this.serviceResponse));
    }

    // Top-level error
    if (this.errorDetail) {
      console.log(cl('  ⚠ ERROR', LABEL_COLOR['⚠ ERROR']));
      console.log(`    message : ${this.errorDetail.message}`);
      if (this.errorDetail.code)  console.log(`    code    : ${this.errorDetail.code}`);
      if (this.errorDetail.stack) console.log(`    stack   :\n${D}${this.errorDetail.stack}${R}`);
    }

    if (this.meta) console.log(`${D}  meta :${R}`, pj(this.meta));
    console.log(`${B}${'─'.repeat(72)}${R}`);
  }
}


export class ServiceLogger {
  private service: string;

  constructor(serviceName: string) {
    this.service = serviceName;
  }

  start(method: string, requestId?: string): LogBuilder {
    return new LogBuilder(this.service, method, requestId);
  }
}

const logger = new ServiceLogger('ServiceLogService');

export class ServiceLogService {
  private repo: ServiceLogRepository;

  constructor() {
    this.repo = new ServiceLogRepository();
  }


  async getLogById(id: string, requestId: string): Promise<IApiResponse> {

    try {
      const t = Date.now();
      const entry = await this.repo.findById(id);

      if (!entry) {
        const res = errorResponse('Log entry not found');
        return res;
      }

      const res = successResponse('Log entry fetched successfully', entry, undefined, requestId);
      return res;

    } catch (error) {
      const res = error instanceof Error
        ? errorResponse(error.message)
        : errorResponse('An unexpected error occurred');
      return res;
    }
  }


  async getLogs(filters: IGetLogsFilter, requestId: string): Promise<IApiResponse> {

    try {
      const t = Date.now();
      const { logs, totalCount, totalPages, currentPage } = await this.repo.findMany(filters);


      const pagination = generatePaginationMeta(
        currentPage,
        totalPages,
        totalCount,
        filters.limit ?? 20
      );

      const res = paginatedSuccessResponse('Logs fetched successfully', logs, pagination, requestId);
      return res;

    } catch (error) {
      const res = error instanceof Error
        ? errorResponse(error.message)
        : errorResponse('An unexpected error occurred');
      return res;
    }
  }


  async getRequestTrace(requestId: string, callerRequestId: string): Promise<IApiResponse> {
    try {
      const t = Date.now();
      const entries = await this.repo.findByRequestId(requestId);

      const res = successResponse('Request trace fetched successfully', entries, undefined, callerRequestId);
      return res;

    } catch (error) {
      const res = error instanceof Error
        ? errorResponse(error.message)
        : errorResponse('An unexpected error occurred');
      return res;
    }
  }


  async getErrorSummary(requestId: string): Promise<IApiResponse> {

    try {
      const t = Date.now();
      const summary = await this.repo.getErrorSummary();

      const res = successResponse('Error summary fetched successfully', summary, undefined, requestId);
      return res;

    } catch (error) {
      const res = error instanceof Error
        ? errorResponse(error.message)
        : errorResponse('An unexpected error occurred');
      return res;
    }
  }

  // ── Delete a log entry ───────────────────────────────────

  async deleteLog(id: string, requestId: string): Promise<IApiResponse> {
    try {
      const t = Date.now();
      const deleted = await this.repo.deleteById(id);

      if (!deleted) {
        const res = errorResponse('Log entry not found');
        return res;
      }
      const res = successResponse('Log entry deleted successfully', undefined, undefined, requestId);
      return res;

    } catch (error) {
      const res = error instanceof Error
        ? errorResponse(error.message)
        : errorResponse('An unexpected error occurred');
      return res;
    }
  }
}