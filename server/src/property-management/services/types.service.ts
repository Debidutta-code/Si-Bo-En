import { errorResponse, successResponse } from '../../utils/return';
import {
  CategoryDao,
  PropertyTypesDao,
  RoomAminityDao,
  PropertyAminityDao,
  LoyaltyGuestFieldsDao
} from '../repository';
export class RoomAmenityServices {
  public static async createRoomAmenity(amenities: string[]) {
    try {
      const daoRes = await RoomAminityDao.addRoomAmenities(amenities);
      return successResponse('Aminity added successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getRoomAmenity() {
    try {
      const daoRes = await RoomAminityDao.getAllRoomAmenities();
      return successResponse('Aminity fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch aminity', error?.message);
    }
  }
  public static async deleteRoomAmenity(amenities: string[]) {
    try {
      const daoRes = await RoomAminityDao.deleteAmenities(amenities);
      return successResponse('Aminity Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete aminity', error?.message);
    }
  }
}
export class AminityServices {
  public static async createCategory(amenities: string[]) {
    try {
      const daoRes = await PropertyAminityDao.addPropertyAmenities(amenities);
      return successResponse('Aminity added successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getCategory(type: string = "property") {
    try {
      const daoRes = await PropertyAminityDao.getAllPropertyAmenities(type);
      return successResponse('Aminity fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch aminity', error?.message);
    }
  }
  public static async deleteCategory(amenities: string[]) {
    try {
      const daoRes = await PropertyAminityDao.deletePropertyAmenities(amenities);
      return successResponse('Aminity Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete aminity', error?.message);
    }
  }
}
export class CategoryService {
  public static async createCategory(categoryName: string, desription: string) {
    try {
      const isExists = await CategoryDao.getCategoryByName(categoryName);
      if (isExists) {
        return errorResponse('Catrgory with this name already exists');
      }
      const daoRes = await CategoryDao.createCategory(categoryName, desription);
      return successResponse('Category Created successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create category', error?.message);
    }
  }
  public static async getCategory() {
    try {
      const daoRes = await CategoryDao.getCategory();
      return successResponse('Category fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch category', error?.message);
    }
  }
  public static async deleteCategory(categoryName: string) {
    try {
      const daoRes = await CategoryDao.deleteCategory(categoryName);
      return successResponse('Category Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete category', error?.message);
    }
  }

}
export class PropertyTypeService {
  public static async createPropertyTypeService(
    propertyTypeName: string,
    description: string
  ) {
    try {
      const isExists = await PropertyTypesDao.getTypeByName(propertyTypeName);
      if (isExists) {
        return errorResponse('Property Type with this name already exists');
      }
      const daoRes = await PropertyTypesDao.createPropertyType(
        propertyTypeName,
        description
      );
      return successResponse('Property Type successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to Property Type', error?.message);
    }
  }
  public static async getPropertyTypeService() {
    try {
      const daoRes = await PropertyTypesDao.getPropertyType();
      return successResponse('Porperty Type fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch Property Type', error?.message);
    }
  }
  public static async deletePropertyTypeService(propertyTypeName: string) {
    try {
      const daoRes =
        await PropertyTypesDao.deletePropertyType(propertyTypeName);
      return successResponse('Property Type Deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete Property Type', error?.message);
    }
  }
}

export class LoyaltyGuestFields {
  public static async getLoyaltyGuestFields() {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.getGuestFields();
      return successResponse('Loyalty Guest Fields fetched Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to fetch Loyalty Guest Fields', error?.message);
    }
  }
  public static async createLoyaltyGuestFields(fields: string[]) {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.createGuestFilelds(fields);
      return successResponse('Loyalty Guest Fields created Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to create Loyalty Guest Fields', error?.message);
    }
  }
  public static async deleteLoyaltyGuestFields(fields: string) {
    try {
      const daoRes = await LoyaltyGuestFieldsDao.deleteGuestField(fields);
      return successResponse('Loyalty Guest Fields deleted Successfully', daoRes);
    } catch (error: any) {
      return errorResponse('Failed to delete Loyalty Guest Fields', error?.message);
    }
  
  }
}