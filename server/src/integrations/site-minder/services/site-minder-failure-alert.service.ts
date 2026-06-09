// integrations/site-minder/services/site-minder-failure-alert.service.ts

import { emailQueue } from '../../..';
import { config } from '../../../config';
import { SiteMinderDayJobData } from '../../../queue/site-minder.queus';
import { templateSiteMinderFailure } from '../../templates/integration-failure.template';

const ALERT_RECIPIENTS = config.alertReceipeints;

export class SiteMinderFailureAlertService {
    public static async sendPermanentFailureAlert(record: {
        originalJobId: string | undefined;
        data: SiteMinderDayJobData;
        reason: string;
        attemptsMade: number;
        failedAt: string;
    }): Promise<void> {
        try {
            const { data, originalJobId, reason, attemptsMade, failedAt } = record;
            const roomTypeCode = data.roomTypeCode ?? 'N/A';
            const ratePlanCode = data.ratePlanCode ?? 'N/A';

            const htmlContent = templateSiteMinderFailure({
                type: data.type as 'availability' | 'rates',
                hotelCode: data.hotelCode,
                date: data.date,
                roomTypeCode,
                ratePlanCode,
                reason,
                failedAt,
                attemptsMade,
                originalJobId,
                rawData: data,
            });

            for (const recipient of ALERT_RECIPIENTS) {
                await emailQueue.enqueueEmail({
                    to: recipient,
                    bcc: [],
                    subject: `🚨 SiteMinder ${data.type === 'rates' ? 'Rate' : 'Availability'} Push Failed — ${data.hotelCode} | ${data.date}`,
                    htmlContent,
                    priority: 'critical',
                    meta: {
                        template: 'siteminder_permanent_failure',
                        event: 'siteminder_permanent_failure',
                        correlationId: `${data.hotelCode}-${data.date}-${originalJobId}`,
                    },
                });
            }

            console.warn(`📧 Failure alert sent for job ${originalJobId} — ${data.hotelCode} ${data.date}`);
        } catch (err) {
            console.error('❌ Failed to send SiteMinder failure alert email:', err);
        }
    }
}