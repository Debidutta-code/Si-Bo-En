import {prisma} from "../../config";
export class PropertyTypesDao {
  public  async getTypeByName(propertyTypeName: string) {
    try {
      return await prisma.masterPropertyType.findFirst({
        where: {
          propertyTypeName: propertyTypeName.toLocaleLowerCase(),
          isActive: true,
        },
      });
    } catch (error) {
      throw new Error("Failed to get property type");
    }
  }

  public  async createPropertyType(
    propertyTypeName: string,
    description: string
  ) {
    try {
      return await prisma.masterPropertyType.create({
        data: {
          propertyTypeName: propertyTypeName.toLocaleLowerCase(),
          propertyTypeDescription: description,
          isActive: true,
        },
      });
    } catch (error) {
      throw new Error("Failed to create property type");
    }
  }

  public  async getPropertyType() {
    try {
      return await prisma.masterPropertyType.findMany({
        where: {
          isActive: true,
        },
      });
    } catch (error) {
      throw new Error("Failed to get property types");
    }
  }

  public  async deletePropertyType(propertyTypeName: string) {
    try {
      // Soft delete by setting isActive to false
      return await prisma.masterPropertyType.updateMany({
        where: { propertyTypeName: propertyTypeName.toLocaleLowerCase() },
        data: { isActive: false },
      });
    } catch (error) {
      throw new Error("Failed to delete property type");
    }
  }
}