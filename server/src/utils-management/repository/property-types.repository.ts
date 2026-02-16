import {prisma} from "../../config";
export class PropertyTypesDao {
  public static async getTypeByName(propertyTypeName: string) {
    try {
      return await prisma.masterPropertyType.findFirst({
        where: {
          propertyTypeName: propertyTypeName,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async createPropertyType(
    propertyTypeName: string,
    description: string
  ) {
    try {
      return await prisma.masterPropertyType.create({
        data: {
          propertyTypeName,
          propertyTypeDescription: description,
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async getPropertyType() {
    try {
      return await prisma.masterPropertyType.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public static async deletePropertyType(propertyTypeName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPropertyType.updateMany({
        where: { propertyTypeName: propertyTypeName },
        data: { isActive: false },
      });
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}