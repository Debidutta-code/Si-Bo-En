// queues/site-minder.queue.ts

import { Queue, Worker, Job } from 'bullmq';
import { ServiceLogger } from '../logs/services/service-log.service';
import { SiteMinderDao } from '../integrations/site-minder/dao/site-minder.dao';
import { config } from '../config';
import { SiteMinderFailureAlertService } from '../integrations/site-minder/services/site-minder-failure-alert.service';

const logger = new ServiceLogger('SiteMinderQueue');

// ─── Job Payload Types ────────────────────────────────────────────────────────

// One job = one specific day for one availability message
export interface SiteMinderAvailDayJobData {
    type: 'availability';
    hotelCode: string;
    propertyCode: string;
    echoToken: string;
    date: string; // ISO date string e.g. "2026-06-05"
    roomTypeCode: string;
    ratePlanCode: string;
    bookingLimit?: number;
    lengthsOfStay?: Array<{ minMaxMessageType: string; time: string }>;
    restrictionStatuses?: Array<{ restriction?: string; status: string }>;
    enqueuedAt: number;
}

// One job = one specific day for one rates message
export interface SiteMinderRateDayJobData {
    type: 'rates';
    hotelCode: string;
    propertyCode: string;
    propertyId: string;
    echoToken: string;
    date: string; // ISO date string e.g. "2026-06-05"
    roomTypeCode: string;
    ratePlanCode: string;
    ratePlanName: string;
    roomTypeName: string;
    rates: any;
    enqueuedAt: number;
}

export type SiteMinderDayJobData = SiteMinderAvailDayJobData | SiteMinderRateDayJobData;

export interface SiteMinderDeadLetterPayload {
    originalJobId: string | undefined;
    data: SiteMinderDayJobData;
    failedReason: string;
    attemptsMade: number;
    failedAt: string;
}



const QUEUE_NAMES = {
    ari: config.siteMinderAriQueue,
    deadLetter: config.siteMinderDeadLetterQueue,
} as const;

const MAX_ATTEMPTS = 3;
const BACKOFF_DELAY_MS = 60_000; // 1min → 2min → 4min (exponential)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Expand a start→end range into an array of ISO date strings.
 * e.g. "2026-06-06" → "2026-06-09" = ["2026-06-06","2026-06-07","2026-06-08","2026-06-09"]
 */
function expandDateRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// ─── SiteMinderQueue ──────────────────────────────────────────────────────────

export class SiteMinderQueue {
    private ariQueue: Queue;
    private deadLetterQueue: Queue;
    private ariWorker: Worker;
    private deadLetterWorker: Worker;

    constructor(connection: {
        host: string;
        port: number;
        password: string;
        maxRetriesPerRequest: null;
        connectTimeout: number;
        retryStrategy: (times: number) => number;
    }) {
        this.ariQueue = this.createQueue(QUEUE_NAMES.ari, connection);
        this.deadLetterQueue = this.createQueue(QUEUE_NAMES.deadLetter, connection);
        this.ariWorker = this.createAriWorker(connection);
        this.deadLetterWorker = this.createDeadLetterWorker(connection);
    }


    private createQueue(name: string, connection: object): Queue {
        const queue = new Queue(name, { connection });
        queue.on('error', err => {
            console.error(`❌ SiteMinderQueue [${name}] error:`, err);
        });
        return queue;
    }


    private createAriWorker(connection: object): Worker {
        const worker = new Worker<SiteMinderDayJobData>(
            QUEUE_NAMES.ari,
            async (job: Job<SiteMinderDayJobData>) => {
                await this.processDayJob(job);
            },
            {
                connection,
                concurrency: 10,
            }
        );

        worker.on('error', err => {
            console.error(`❌ SiteMinder ARI worker error:`, err);
        });

        worker.on('completed', job => {
            console.log(
                `✅ [${job.data.type}] job ${job.id} done — hotelCode: ${job.data.hotelCode} date: ${job.data.date}`
            );
        });

        worker.on('failed', async (job, err) => {
            console.error(
                `❌ [${job?.data?.type}] job ${job?.id} failed (attempt ${job?.attemptsMade}/${MAX_ATTEMPTS}) — hotelCode: ${job?.data?.hotelCode} date: ${job?.data?.date} — ${err.message}`
            );

            // Only move to dead letter after ALL attempts exhausted
            if (job && job.attemptsMade >= MAX_ATTEMPTS) {
                await this.moveToDeadLetter(job, err);
            }
        });

        return worker;
    }

    // ─── Day Job Processor ────────────────────────────────────────────────────

    private async processDayJob(job: Job<SiteMinderDayJobData>): Promise<void> {
        const { type } = job.data;

        if (type === 'availability') {
            await this.processAvailDayJob(job.data as SiteMinderAvailDayJobData);
        } else if (type === 'rates') {
            await this.processRateDayJob(job.data as SiteMinderRateDayJobData);
        } else {
            throw new Error(`Unknown SiteMinder job type: ${(job.data as any).type}`);
        }
    }


    private async processAvailDayJob(data: SiteMinderAvailDayJobData): Promise<void> {
        const {
            propertyCode, roomTypeCode, ratePlanCode,
            date, bookingLimit, lengthsOfStay, restrictionStatuses,
        } = data;

        // Parse LOS
        let minLos: number | undefined;
        let maxLos: number | undefined;
        if (lengthsOfStay && lengthsOfStay.length > 0) {
            for (const los of lengthsOfStay) {
                if (los.minMaxMessageType === 'SetMinLOS' || los.minMaxMessageType === 'SetForwardMinStay')
                    minLos = parseInt(los.time) || 1;
                if (los.minMaxMessageType === 'SetMaxLOS' || los.minMaxMessageType === 'SetForwardMaxStay')
                    maxLos = los.time ? parseInt(los.time) : 0;
            }
        }

        // Parse restrictions
        let isSaleStopped: boolean | undefined;
        let isClosedToArrival: boolean | undefined;
        let isClosedToDeparture: boolean | undefined;
        if (restrictionStatuses && restrictionStatuses.length > 0) {
            for (const r of restrictionStatuses) {
                if (!r.restriction || r.restriction === 'Master') isSaleStopped = r.status === 'Close';
                if (r.restriction === 'Arrival') isClosedToArrival = r.status === 'Close';
                if (r.restriction === 'Departure') isClosedToDeparture = r.status === 'Close';
            }
        }

        // Upsert inventory + restrictions for this single day
        await SiteMinderDao.upsertInventoryAndRestrictions({
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date: new Date(date),
            bookingLimit,
            isSaleStopped,
            isClosedToArrival,
            isClosedToDeparture,
        });

        // Upsert LOS if present
        if ((minLos !== undefined || maxLos !== undefined) && ratePlanCode) {
            await SiteMinderDao.upsertLengthOfStay({
                propertyCode,
                ratePlanCode,
                startDate: new Date(date),
                endDate: new Date(date),
                minLos,
                maxLos,
            });
        }
    }

    // ─── Rates Day Processor ──────────────────────────────────────────────────

    private async processRateDayJob(data: SiteMinderRateDayJobData): Promise<void> {
        const {
            propertyCode, roomTypeCode, ratePlanCode,
            ratePlanName, roomTypeName, date, rates,
        } = data;

        await SiteMinderDao.upsertCharge({
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            ratePlanName,
            roomTypeName,
            date: new Date(date),
            currencyCode: rates.currencyCode,
            baseByGuestAmounts: rates.baseByGuestAmounts,
            additionalGuestAmounts: rates.additionalGuestAmounts,
        });
    }

    // ─── Dead Letter Worker ───────────────────────────────────────────────────

    private createDeadLetterWorker(connection: object): Worker {
        const worker = new Worker<SiteMinderDeadLetterPayload>(
            QUEUE_NAMES.deadLetter,
            async (job: Job<SiteMinderDeadLetterPayload>) => {
                await this.processDeadLetterJob(job);
            },
            { connection, concurrency: 1 }
        );

        worker.on('error', err => {
            console.error('❌ SiteMinder dead-letter worker error:', err);
        });

        worker.on('completed', job => {
            console.log(
                `✅ Dead-letter job ${job.id} recovered — original: ${job.data.originalJobId} date: ${job.data.data.date}`
            );
        });

        worker.on('failed', async (job, err) => {
            console.error(
                `🗑️  Dead-letter job ${job?.id} exhausted all retries: ${err.message}`
            );
            await this.persistPermanentFailure(job, err);
        });

        return worker;
    }

    // ─── Dead Letter Processor ────────────────────────────────────────────────

    private async processDeadLetterJob(job: Job<SiteMinderDeadLetterPayload>): Promise<void> {
        const { data, originalJobId } = job.data;

        console.warn(
            `🔁 Final retry — original: ${originalJobId} [${data.type}] hotelCode: ${data.hotelCode} date: ${data.date}`
        );

        if (data.type === 'availability') {
            await this.processAvailDayJob(data as SiteMinderAvailDayJobData);
        } else if (data.type === 'rates') {
            await this.processRateDayJob(data as SiteMinderRateDayJobData);
        } else {
            throw new Error(`Unknown type in dead-letter: ${(data as any).type}`);
        }
    }

    // ─── Move to Dead Letter ──────────────────────────────────────────────────

    private async moveToDeadLetter(job: Job<SiteMinderDayJobData>, err: Error): Promise<void> {
        try {
            const payload: SiteMinderDeadLetterPayload = {
                originalJobId: job.id,
                data: job.data,
                failedReason: err.message,
                attemptsMade: job.attemptsMade,
                failedAt: new Date().toISOString(),
            };

            await this.deadLetterQueue.add('dead-siteminder', payload, {
                delay: 60 * 60 * 1000, // 1hr before final retry
                attempts: 2,
                backoff: { type: 'exponential', delay: 10_000 },
                removeOnComplete: true,
                removeOnFail: false,
            });

            console.warn(
                `⚠️ Job ${job.id} → dead-letter after ${job.attemptsMade} attempts — hotelCode: ${job.data.hotelCode} date: ${job.data.date}`
            );
        } catch (dlErr) {
            console.error(`❌ Failed to move job ${job.id} to dead-letter:`, dlErr);
        }
    }

    // ─── Persist Permanent Failure ────────────────────────────────────────────

    private async persistPermanentFailure(
        job: Job<SiteMinderDeadLetterPayload> | undefined,
        err: Error
    ): Promise<void> {
        const record = {
            originalJobId: job?.data?.originalJobId,
            data: job?.data?.data as SiteMinderDayJobData,
            reason: err.message,
            attemptsMade: job?.data?.attemptsMade ?? 0,
            failedAt: new Date().toISOString(),
        };

        console.error(
            '🚨 PERMANENT SITEMINDER FAILURE — manual intervention required:',
            JSON.stringify(record, null, 2)
        );

        await SiteMinderFailureAlertService.sendPermanentFailureAlert(record);
    }

    public async enqueueAvailabilityMessages(params: {
        hotelCode: string;
        propertyCode: string;
        echoToken: string;
        availStatusMessages: Array<{
            start: string;
            end: string;
            invTypeCode: string;
            ratePlanCode: string;
            bookingLimit?: number;
            lengthsOfStay?: Array<{ minMaxMessageType: string; time: string }>;
            restrictionStatuses?: Array<{ restriction?: string; status: string }>;
        }>;
    }): Promise<void> {
        const { hotelCode, propertyCode, echoToken, availStatusMessages } = params;

        const jobs: Promise<any>[] = [];

        for (const message of availStatusMessages) {
            const dates = expandDateRange(message.start, message.end);

            for (const date of dates) {
                const jobData: SiteMinderAvailDayJobData = {
                    type: 'availability',
                    hotelCode,
                    propertyCode,
                    echoToken,
                    date,
                    roomTypeCode: message.invTypeCode,
                    ratePlanCode: message.ratePlanCode,
                    bookingLimit: message.bookingLimit,
                    lengthsOfStay: message.lengthsOfStay,
                    restrictionStatuses: message.restrictionStatuses,
                    enqueuedAt: Date.now(),
                };

                jobs.push(
                    this.ariQueue.add(
                        // Unique job name per hotel+room+ratePlan+date prevents duplicates
                        `avail-${hotelCode}-${message.invTypeCode}-${message.ratePlanCode}-${date}`,
                        jobData,
                        {
                            attempts: MAX_ATTEMPTS,
                            backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
                            removeOnComplete: true,
                            removeOnFail: false,
                        }
                    )
                );
            }
        }

        await Promise.all(jobs);
        console.log(
            `📥 Availability: enqueued ${jobs.length} day-level jobs — hotelCode: ${hotelCode}`
        );
    }


    public async enqueueRatesMessages(params: {
        hotelCode: string;
        propertyCode: string;
        propertyId: string;
        echoToken: string;
        rateAmountMessages: Array<{
            start: string;
            end: string;
            roomTypeCode: string;
            ratePlanCode: string;
            ratePlanName: string;
            roomTypeName: string;
            rates: any;
        }>;
    }): Promise<void> {
        const { hotelCode, propertyCode, propertyId, echoToken, rateAmountMessages } = params;

        const jobs: Promise<any>[] = [];

        for (const message of rateAmountMessages) {
            const dates = expandDateRange(message.start, message.end);

            for (const date of dates) {
                const jobData: SiteMinderRateDayJobData = {
                    type: 'rates',
                    hotelCode,
                    propertyCode,
                    propertyId,
                    echoToken,
                    date,
                    roomTypeCode: message.roomTypeCode,
                    ratePlanCode: message.ratePlanCode,
                    ratePlanName: message.ratePlanName,
                    roomTypeName: message.roomTypeName,
                    rates: message.rates,
                    enqueuedAt: Date.now(),
                };

                jobs.push(
                    this.ariQueue.add(
                        // Unique job name per hotel+room+ratePlan+date prevents duplicates
                        `rate-${hotelCode}-${message.roomTypeCode}-${message.ratePlanCode}-${date}`,
                        jobData,
                        {
                            attempts: MAX_ATTEMPTS,
                            backoff: { type: 'exponential', delay: BACKOFF_DELAY_MS },
                            removeOnComplete: true,
                            removeOnFail: false,
                        }
                    )
                );
            }
        }

        await Promise.all(jobs);
        console.log(
            `📥 Rates: enqueued ${jobs.length} day-level jobs — hotelCode: ${hotelCode}`
        );
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    public async getQueueStatus() {
        const [ari, deadLetter] = await Promise.all([
            this.ariQueue.getJobCounts('active', 'waiting', 'completed', 'failed', 'delayed'),
            this.deadLetterQueue.getJobCounts('active', 'waiting', 'delayed', 'completed', 'failed'),
        ]);
        return {
            [QUEUE_NAMES.ari]: ari,
            [QUEUE_NAMES.deadLetter]: deadLetter,
        };
    }

    public async close(): Promise<void> {
        await Promise.all([
            this.ariWorker.close(),
            this.deadLetterWorker.close(),
            this.ariQueue.close(),
            this.deadLetterQueue.close(),
        ]);
        console.log('✅ SiteMinder queues and workers closed');
    }
}