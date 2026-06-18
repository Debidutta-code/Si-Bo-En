import {generateAccountCreatedTemplate} from "../templatesss";
import { emailQueue } from '../../index';

export class UserEmailService {
    public async sendAccountCreatedEmail( firstName:string,lastName:string, email: string, password: string) {
        try {

            const htmlContent = generateAccountCreatedTemplate(firstName, lastName, email, password);
            const subject = 'Welcome to RevChill - Your Account Has Been Created';
    
            await emailQueue.enqueueEmail({
                to: email,
                bcc: [],
                subject,
                htmlContent,
                priority: 'normal',
                meta: {
                    template: 'account_created',
                    event: 'account_created',
                },
            });
        } catch (error) {
            console.error('Error sending account created email:', error);
        }
    }
}
