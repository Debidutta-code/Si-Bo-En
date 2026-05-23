import { emailQueue } from '../..';
import { templateApplicationRejected } from '../../agency/templates/agency-cancellation';
import { templateApplicationApproved } from '../../agency/templates/agency-confirmation';
import { templateApplicationSubmitted } from '../../agency/templates/agent-application';
import { templateAgentDeleted } from '../../agency/templates/agent-deleted';
import { templateAgentCreated } from '../../agency/templates/agent.created';
import { IAgencyApplication, ICAgencyApplication } from '../../agency/types';

export class AgencyEmailService {
    public async applicationSubmitted(
        data: ICAgencyApplication & { id: string } // ← add id here
    ): Promise<void> {
        try {
            const htmlContent = templateApplicationSubmitted(data);
            await emailQueue.enqueueEmail({
                to: data.agencyEmail,
                bcc: [],
                subject: `Application Received – ${data.agencyName} | RevChill Tech`,
                htmlContent,
                priority: 'high',
                meta: {
                    template: 'agency_application_submitted',
                    event: 'agency_application_submitted',
                    correlationId: data.agencyEmail,
                },
            });
        } catch (error) {
            console.error(
                'Error sending agency application submitted email:',
                error
            );
        }
    }

    /**
     * Sends an approval email with partner portal credentials.
     * Sent to: agencyEmail (the applicant who becomes the initial agent)
     */
    public async applicationApproved(
        application: IAgencyApplication,
        agentEmail: string,
        agentPassword: string,
        loginUrl: string
    ): Promise<void> {
        try {
            const htmlContent = templateApplicationApproved({
                application,
                agentEmail,
                agentPassword,
                loginUrl,
            });
            await emailQueue.enqueueEmail({
                to: application.agencyEmail,
                bcc: [],
                subject: `Partnership Approved – Welcome to RevChill Tech, ${application.agencyName}!`,
                htmlContent,
                priority: 'critical',
                meta: {
                    template: 'agency_application_approved',
                    event: 'agency_application_approved',
                    correlationId: application.id,
                },
            });
        } catch (error) {
            console.error(
                'Error sending agency application approved email:',
                error
            );
        }
    }

    /**
     * Sends a rejection email with the reason and guidance to reapply.
     * Sent to: agencyEmail
     */
    public async applicationRejected(
        application: IAgencyApplication,
        rejectionReason: string
    ): Promise<void> {
        try {
            const htmlContent = templateApplicationRejected({
                application,
                rejectionReason,
            });
            await emailQueue.enqueueEmail({
                to: application.agencyEmail,
                bcc: [],
                subject: `Application Status Update – ${application.agencyName} | RevChill Tech`,
                htmlContent,
                priority: 'high',
                meta: {
                    template: 'agency_application_rejected',
                    event: 'agency_application_rejected',
                    correlationId: application.id,
                },
            });
        } catch (error) {
            console.error(
                'Error sending agency application rejected email:',
                error
            );
        }
    }

    /**
     * Sends a welcome email with login credentials when a new agent is added.
     * Sent to: agentEmail
     */
    public async agentCreated(
        agentName: string,
        agentEmail: string,
        agentPassword: string,
        agencyName: string,
        loginUrl: string,
        createdByName: string
    ): Promise<void> {
        try {
            const htmlContent = templateAgentCreated({
                agentName,
                agentEmail,
                agentPassword,
                agencyName,
                loginUrl,
                createdByName,
            });
            await emailQueue.enqueueEmail({
                to: agentEmail,
                bcc: [],
                subject: `Your Agent Account is Ready – ${agencyName} | RevChill Tech`,
                htmlContent,
                priority: 'high',
                meta: {
                    template: 'agent_created',
                    event: 'agent_created',
                    correlationId: agentEmail,
                },
            });
        } catch (error) {
            console.error('Error sending agent created email:', error);
        }
    }

    /**
     * Sends a notification email when an agent account is deleted/removed.
     * Sent to: agentEmail
     */
    public async agentDeleted(
        agentName: string,
        agentEmail: string,
        agencyName: string,
        deletedByName: string,
        reason?: string
    ): Promise<void> {
        try {
            const htmlContent = templateAgentDeleted({
                agentName,
                agentEmail,
                agencyName,
                deletedByName,
                reason,
            });
            await emailQueue.enqueueEmail({
                to: agentEmail,
                bcc: [],
                subject: `Account Removed – ${agencyName} | RevChill Tech`,
                htmlContent,
                priority: 'normal',
                meta: {
                    template: 'agent_deleted',
                    event: 'agent_deleted',
                    correlationId: agentEmail,
                },
            });
        } catch (error) {
            console.error('Error sending agent deleted email:', error);
        }
    }
}
