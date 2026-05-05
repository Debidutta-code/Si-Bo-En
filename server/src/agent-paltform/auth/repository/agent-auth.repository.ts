import {prisma } from "../../../config";
import {
    IAgentsWA,
    IAgentsWOP
} from "../types"
export class AgentAuthRepository{
    public async findAgentByEmail(email:string):Promise<IAgentsWOP | null>{
        try {
            return await prisma.agents.findUnique({
                where: { agentEmail: email ,isDeleted:false},
                include:{
                    agency:true
                }
            });
        } catch (error) {
            throw new Error("Error finding agent by email");
        }
    }
    public async getById(id:string):Promise<IAgentsWA | null>{
        try {
            return await prisma.agents.findUnique({
                where: { id,isDeleted:false },
                include:{
                    agency:true
                }
            });
        } catch (error) {
            throw new Error("Error finding agent by ID");
        }
    }
}