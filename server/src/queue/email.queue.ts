import { Queue, Worker, Job } from 'bullmq';
import { config, RedisClient } from '../config';
import { sendEmail } from '../sms-email-service/utils';
import { DeadLetterPayload, EmailJobData,EmailJobPriority } from '.';

export class EmailQueue {
    private emailQueue: Queue;
    private emailWorker: Worker;
    private deadLetterQueue: Queue;
    private deadLetterWorker: Worker;
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

        this.emailQueue = new Queue(config.emailQueue, { connection });
        this.emailQueue.on('error', (err) => {
            // console.error('❌ Email queue connection error:', err);
        });

        this.deadLetterQueue = new Queue(config.deadLetterQueue, { connection });
        this.deadLetterQueue.on('error', (err) => {
            // console.error('❌ Dead-letter queue connection error:', err);
        });

        this.emailWorker = new Worker(
            config.emailQueue,
            async (job: Job<EmailJobData>) => {
                await this.processEmailJob(job);
            },
            { connection, concurrency: 2 } // 2 EMAILS WILL BE PROCESSED AT A TIME
        );

        this.emailWorker.on('error', (err) => {
            // console.error('❌ Email worker connection error:', err);
        });

        this.emailWorker.on('completed', (job) => {
            console.log(`✅ Email job ${job.id} completed at ${new Date()}`);
        });

        // On permanent failure → move to dead-letter queue with 1hr delay
        this.emailWorker.on('failed', async (job, err) => {
            console.error(`❌ Email job ${job?.id} failed:`, err.message);

            if (job && job.attemptsMade >= (job.opts.attempts ?? 5)) {
                await this.moveToDeadLetter(job, err);
            }
        });

        this.deadLetterWorker = new Worker(
            config.deadLetterQueue,
            async (job: Job<DeadLetterPayload>) => {
                await this.processDeadLetterJob(job);
            },
            { connection, concurrency: 1 }
        );

        this.deadLetterWorker.on('error', (err) => {
            // console.error('❌ Dead-letter worker connection error:', err);
        });

        this.deadLetterWorker.on('completed', (job) => {
            console.log(`✅ Dead-letter job ${job.id} succeeded on final retry`);
        });

        this.deadLetterWorker.on('failed', (job, err) => {
            console.error(
                `🗑️  Dead-letter job ${job?.id} failed final retry, removing permanently:`,
                err.message
            );
        });
    }


    private mapPriority(priority: EmailJobPriority = 'normal'): number {
        const map: Record<EmailJobPriority, number> = {
            critical: 1,
            high: 2,
            normal: 3,
            low: 4,
        };
        return map[priority] ?? 3;
    }


    public async enqueueEmail(
        payload: Omit<EmailJobData, 'createdAt'>,
        options?: { jobId?: string }
    ) {
        const job = await this.emailQueue.add(
            'send-email',
            { ...payload, createdAt: Date.now() },
            {
                jobId: options?.jobId,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                priority: this.mapPriority(payload.priority),
                removeOnComplete: true,
                removeOnFail: 10,
            }
        );
        return job;
    }

    private async processEmailJob(job: Job<EmailJobData>) {
        const data = job.data;

        if (!data?.to || !data?.subject || !data?.htmlContent) {
            throw new Error('Invalid email job payload');
        }

        const ok = await sendEmail(data.to, data.cc ?? [], data.subject, data.htmlContent);
        if (!ok) {
            throw new Error('sendEmail returned false');
        }

        return { success: true };
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
                attempts: 1,
                removeOnComplete: true,
                removeOnFail: true,
            });
        } catch (dlErr) {
            console.error(`❌ Failed to move job ${job.id} to dead-letter:`, dlErr);
        }
    }


    private async processDeadLetterJob(job: Job<DeadLetterPayload>): Promise<void> {
        const { data, originalJobId } = job.data;

        console.log(`🔁 Final retry for dead-letter job (original: ${originalJobId})`);

        if (!data?.to || !data?.subject || !data?.htmlContent) {
            throw new Error('Invalid dead-letter job payload');
        }

        const ok = await sendEmail(data.to, data.cc ?? [], data.subject, data.htmlContent);
        if (!ok) {
            throw new Error('Final retry failed — sendEmail returned false');
        }
    }


    async getEmailQueueStatus() {
        const jobCounts = await this.emailQueue.getJobCounts(
            'active',
            'waiting',
            'completed',
            'failed',
            'delayed',
            'paused'
        );
        return { queue: config.emailQueue, jobCounts };
    }

    async getDeadLetterQueueStatus() {
        const jobCounts = await this.deadLetterQueue.getJobCounts(
            'active',
            'waiting',
            'delayed',
            'completed',
            'failed'
        );
        return { queue: config.deadLetterQueue, jobCounts };
    }


    async cleanup(gracePeriodMs: number = 24 * 60 * 60 * 1000) {
        await this.emailQueue.clean(gracePeriodMs, 1000, 'completed');
        await this.emailQueue.clean(gracePeriodMs, 1000, 'failed');
        await this.deadLetterQueue.clean(gracePeriodMs, 1000, 'completed');
        console.log('✅ Email queue cleanup completed');
    }

    async close() {
        await this.emailWorker.close();
        await this.emailQueue.close();
        await this.deadLetterWorker.close();
        await this.deadLetterQueue.close();
        console.log('✅ Email queues closed');
    }
}