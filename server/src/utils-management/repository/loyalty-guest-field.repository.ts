import {prisma} from "../../config";
    
export class LoyaltyGuestFieldsDao {
  public  async createGuestFilelds(name: string[]) {
    try {
      return await prisma.masterLoyaltyRegistrationFields.createMany({
        data: name.map(fieldName => ({ fieldName })),
      });
    } catch (error) {
      throw new Error(`Error creating loyalty guest field`);
    }
  }
  public  async deleteGuestField(id: string) {
    try {
      return await prisma.masterLoyaltyRegistrationFields.delete({
        where: {
          id: id
        }
      })
    } catch (error) {
      throw new Error(`Error deleting loyalty guest field`);
    }
  }
  public  async getGuestFields() {
    try {
      return await prisma.masterLoyaltyRegistrationFields.findMany();
    } catch (error) {
      throw new Error(`Error fetching loyalty guest fields`);
    }
  }
}