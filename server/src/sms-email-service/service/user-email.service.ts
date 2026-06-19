import {generateAccountCreatedTemplate} from "../templatesss";
import { emailQueue } from '../../index';
import { config } from "../../config";

export class UserEmailService {
    public async sendAccountCreatedEmail(
        firstName:string,
        lastName:string,
         email: string,
          password: string,
          propertyName: string,
        ) {
        try {

            const htmlContent = generateAccountCreatedTemplate(firstName, lastName, email, password, propertyName, `${config.bookingEngineUrl}/login`);
            const subject = `Your RevChill Account Has Been Created for ${propertyName} `
    
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
