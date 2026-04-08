import { Queue, Worker, Job } from 'bullmq';
import { config, RedisClient } from '../config';
import { sendEmail } from '../sms-email-service/utils';
import { DeadLetterPayload, EmailJobData, EmailJobPriority } from '.';


interface PermanentFailureRecord {
    originalJobId: string | undefined;
    payload: DeadLetterPayload;
    reason: string;
    failedAt: string;
}


const QUEUE_NAMES = {
    critical: 'email-critical', // OTP, password reset, alerts
    normal: 'email-normal',     // transactional, account emails
    bulk: 'email-bulk',         // newsletters, marketing
    deadLetter: config.deadLetterQueue,
} as const;

const CONCURRENCY = {
    critical: 5,
    normal: 3,
    bulk: 1, //  prevents starvation
} as const;

const AGING_INTERVAL_MS = 2 * 60 * 1000;       // run aging check every 2 min
const STARVATION_THRESHOLD_MS = 10 * 60 * 1000; // escalate if waiting > 10 min


export class EmailQueue {

    // Separate queues per priority tier
    private criticalQueue: Queue;
    private normalQueue: Queue;
    private bulkQueue: Queue;
    private deadLetterQueue: Queue;

    // Each tier has its own dedicated worker with proportional concurrency
    private criticalWorker: Worker;
    private normalWorker: Worker;
    private bulkWorker: Worker;
    private deadLetterWorker: Worker;

    private agingTimer: ReturnType<typeof setInterval> | null = null;

    private redisClient: ReturnType<typeof RedisClient.getInstance>;

    constructor(connection: {
        host: string;
        port: number;
        password: string;
        maxRetriesPerRequest: null;
        connectTimeout: number;
        retryStrategy: (times: number) => number;
    }) {
        this.redisClient = RedisClient.getInstance();


        this.criticalQueue = this.createQueue(QUEUE_NAMES.critical, connection);
        this.normalQueue   = this.createQueue(QUEUE_NAMES.normal,   connection);
        this.bulkQueue     = this.createQueue(QUEUE_NAMES.bulk,     connection);
        this.deadLetterQueue = this.createQueue(QUEUE_NAMES.deadLetter, connection);


        const emailProcessor = async (job: Job<EmailJobData>) => {
            await this.processEmailJob(job);
        };

        this.criticalWorker  = this.createEmailWorker(QUEUE_NAMES.critical,  emailProcessor, CONCURRENCY.critical,  connection);
        this.normalWorker    = this.createEmailWorker(QUEUE_NAMES.normal,    emailProcessor, CONCURRENCY.normal,    connection);
        this.bulkWorker      = this.createEmailWorker(QUEUE_NAMES.bulk,      emailProcessor, CONCURRENCY.bulk,      connection);

        this.deadLetterWorker = new Worker(
            QUEUE_NAMES.deadLetter,
            async (job: Job<DeadLetterPayload>) => {
                await this.processDeadLetterJob(job);
            },
            { connection, concurrency: 1 }
        );

        this.attachDeadLetterWorkerListeners();

        this.startAgingWorker();
    }

    private createQueue(
        name: string,
        connection: object
    ): Queue {
        const queue = new Queue(name, { connection });
        queue.on('error', (err) => {
            console.error(`❌ Queue [${name}] connection error:`, err);
        });
        return queue;
    }

    private createEmailWorker(
        queueName: string,
        processor: (job: Job<EmailJobData>) => Promise<void>,
        concurrency: number,
        connection: object
    ): Worker {
        const worker = new Worker(queueName, processor, { connection, concurrency });

        worker.on('error', (err) => {
            console.error(`❌ Worker [${queueName}] error:`, err);
        });

        worker.on('completed', (job) => {
            console.log(`✅ [${queueName}] Job ${job.id} completed at ${new Date().toISOString()}`);
        });

        worker.on('failed', async (job, err) => {
            console.error(`❌ [${queueName}] Job ${job?.id} failed: ${err.message}`);

            if (job && job.attemptsMade >= (job.opts.attempts ?? 5)) {
                await this.moveToDeadLetter(job, err);
            }
        });

        return worker;
    }

    /**
     * Routes to the correct queue based on priority tier.
     */
    private getQueueForPriority(priority: EmailJobPriority = 'normal'): Queue {
        switch (priority) {
            case 'critical':
            case 'high':
                return this.criticalQueue;
            case 'normal':
                return this.normalQueue;
            case 'low':
            default:
                return this.bulkQueue;
        }
    }

    public async enqueueEmail(
        payload: Omit<EmailJobData, 'createdAt'>,
        options?: { jobId?: string }
    ) {
        const queue = this.getQueueForPriority(payload.priority);

        const job = await queue.add(
            'send-email',
            { ...payload, createdAt: Date.now() },
            {
                jobId: options?.jobId,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: 10,
            }
        );

        console.log(
            `📧 Enqueued email job ${job.id} → [${queue.name}] | to: ${payload.to} | priority: ${payload.priority ?? 'normal'}`
        );

        return job;
    }


    private async processEmailJob(job: Job<EmailJobData>): Promise<void> {
        const data = job.data;

        if (!data?.to || !data?.subject || !data?.htmlContent) {
            throw new Error('Invalid email job payload — missing required fields');
        }

        const ok = await sendEmail(data.to, data.cc ?? [], data.subject, data.htmlContent);
        if (!ok) {
            throw new Error('sendEmail returned false');
        }
    }

    private async moveToDeadLetter(job: Job<EmailJobData>, err: Error): Promise<void> {
        try {
            const payload: DeadLetterPayload = {
                originalJobId: job.id,
                data: job.data,
                failedReason: err.message,
                attemptsMade: job.attemptsMade,
                failedAt: new Date().toISOString(),
            };

            await this.deadLetterQueue.add('dead-email', payload, {
                delay: 60 * 60 * 1000, 
                attempts: 2,            
                backoff: { type: 'exponential', delay: 10000 },
                removeOnComplete: true,
                removeOnFail: true,
            });

            console.warn(`⚠️ Job ${job.id} moved to dead-letter queue after ${job.attemptsMade} attempts`);
        } catch (dlErr) {
            console.error(`❌ Failed to move job ${job.id} to dead-letter:`, dlErr);
        }
    }

    private async processDeadLetterJob(job: Job<DeadLetterPayload>): Promise<void> {
        const { data, originalJobId } = job.data;

        console.log(`🔁 Final retry for dead-letter job (original: ${originalJobId})`);

        if (!data?.to || !data?.subject || !data?.htmlContent) {
            throw new Error('Invalid dead-letter payload — missing required fields');
        }

        const ok = await sendEmail(data.to, data.cc ?? [], data.subject, data.htmlContent);
        if (!ok) {
            throw new Error('Final retry failed — sendEmail returned false');
        }
    }

    private attachDeadLetterWorkerListeners(): void {
        this.deadLetterWorker.on('error', (err) => {
            console.error('❌ Dead-letter worker error:', err);
        });

        this.deadLetterWorker.on('completed', (job) => {
            console.log(`✅ Dead-letter job ${job.id} succeeded on final retry`);
        });

        this.deadLetterWorker.on('failed', async (job, err) => {
            console.error(`🗑️  Dead-letter job ${job?.id} exhausted all retries: ${err.message}`);
            await this.persistPermanentFailure(job, err);
        });
    }

    private async persistPermanentFailure(
        job: Job<DeadLetterPayload> | undefined,
        err: Error
    ): Promise<void> {
        const record: PermanentFailureRecord = {
            originalJobId: job?.data?.originalJobId,
            payload: job?.data as DeadLetterPayload,
            reason: err.message,
            failedAt: new Date().toISOString(),
        };

        console.error('🚨 PERMANENT EMAIL FAILURE — manual intervention required:', JSON.stringify(record, null, 2));
    }

    // ─── Aging Worker ─────────────────────────────────────────────────────────

    private startAgingWorker(): void {
        this.agingTimer = setInterval(async () => {
            try {
                const waitingJobs = await this.bulkQueue.getJobs(['waiting']);

                for (const job of waitingJobs) {
                    const ageMs = Date.now() - job.timestamp;

                    if (ageMs > STARVATION_THRESHOLD_MS) {
                        console.warn(
                            `⏫ Escalating starved bulk job ${job.id} ` +
                            `(waited ${Math.round(ageMs / 1000)}s) → normal queue`
                        );

                        await this.normalQueue.add('send-email', job.data, {
                            attempts: job.opts.attempts,
                            backoff: job.opts.backoff,
                            removeOnComplete: true,
                            removeOnFail: 10,
                        });

                        await job.remove();
                    }
                }
            } catch (err) {
                console.error('❌ Aging worker error:', err);
            }
        }, AGING_INTERVAL_MS);
    }

    async getEmailQueueStatus() {
        const [critical, normal, bulk] = await Promise.all([
            this.criticalQueue.getJobCounts('active', 'waiting', 'completed', 'failed', 'delayed', 'paused'),
            this.normalQueue.getJobCounts(  'active', 'waiting', 'completed', 'failed', 'delayed', 'paused'),
            this.bulkQueue.getJobCounts(    'active', 'waiting', 'completed', 'failed', 'delayed', 'paused'),
        ]);

        return {
            [QUEUE_NAMES.critical]: critical,
            [QUEUE_NAMES.normal]:   normal,
            [QUEUE_NAMES.bulk]:     bulk,
        };
    }

    async getDeadLetterQueueStatus() {
        const jobCounts = await this.deadLetterQueue.getJobCounts(
            'active', 'waiting', 'delayed', 'completed', 'failed'
        );
        return { queue: QUEUE_NAMES.deadLetter, jobCounts };
    }

    async cleanup(gracePeriodMs: number = 24 * 60 * 60 * 1000): Promise<void> {
        await Promise.all([
            this.criticalQueue.clean(gracePeriodMs, 1000, 'completed'),
            this.criticalQueue.clean(gracePeriodMs, 1000, 'failed'),
            this.normalQueue.clean(gracePeriodMs, 1000, 'completed'),
            this.normalQueue.clean(gracePeriodMs, 1000, 'failed'),
            this.bulkQueue.clean(gracePeriodMs, 1000, 'completed'),
            this.bulkQueue.clean(gracePeriodMs, 1000, 'failed'),
            this.deadLetterQueue.clean(gracePeriodMs, 1000, 'completed'),
        ]);
        console.log('✅ Email queue cleanup completed');
    }

    async close(): Promise<void> {
        if (this.agingTimer) {
            clearInterval(this.agingTimer);
            this.agingTimer = null;
        }

        await Promise.all([
            this.criticalWorker.close(),
            this.normalWorker.close(),
            this.bulkWorker.close(),
            this.deadLetterWorker.close(),
            this.criticalQueue.close(),
            this.normalQueue.close(),
            this.bulkQueue.close(),
            this.deadLetterQueue.close(),
        ]);

        console.log('✅ All email queues and workers closed');
    }
}