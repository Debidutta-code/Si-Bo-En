import {prisma} from "../../config";
import {ICSpaPricingR,ISpaPricing} from "../types";
export class SpaPricingRepository {

    public async createSpaPricing(data: ICSpaPricingR): Promise<ISpaPricing> {
        try {
            return await prisma.spaPricing.create({
                data: data
            });
        } catch (error) {
            throw new Error("Error while adding spa slot pricing")
        }
    }
}