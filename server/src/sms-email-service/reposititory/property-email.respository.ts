import {prisma} from "../../config";
import { IPropertyEmails } from "../../pms/frontoffice/reservation/types/reservation.type";
export class PropertyEmailRepository {
    public async getPropertyEmails(propertyId: string): Promise<IPropertyEmails[]> {
        try {
            return await prisma.propertyEmails.findMany({
                where: { propertyId },
                select: {
                    email: true,
                },
            });
        }
        catch (error) {
            throw new Error(`Error fetching property emails`);
        }
    }
}