export type EmailJobPriority = 'critical' | 'high' | 'normal' | 'low';

export interface EmailJobData {
    to: string;
    cc: string[];
    subject: string;
    htmlContent: string;
    priority?: EmailJobPriority;
    meta?: {
        template?: string;
        event?: string;
        correlationId?: string;
        createdBy?: string;
    };
    createdAt: number;
}

export interface DeadLetterPayload {
    originalJobId: string | undefined;
    data: EmailJobData;
    failedReason: string;
    attemptsMade: number;
    failedAt: string;
}