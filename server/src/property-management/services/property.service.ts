import { errorResponse, successResponse } from '../../utils/return';
import {
  PropertyDao,
  PropertyAddressDao,
  PropertyAmenityDao,

} from '../repository/property.repository';
import { AddCreationToCreation, UserAuthRepository } from "../../auth/repository"
import { generateUniquePropertyCode } from '../utils/generatePropertyCode';
import type { IPropertyInfoType, IUpdatePropertyData, IPropertyAddress } from '../types/propertyModel.types';
export class PropertyService {
  public static async createPropertyService(
    {
      propertyName,
      propertyEmail,
      propertyContact,
      propertyType,
      propertyCategory,
      description = '',
      image,
      createdById,
      starRating,
      isDraft,
      creationId,
      isAvailable,
      isDeleted
    }: Omit<
      IPropertyInfoType,
      'propertyCode' | 'level1Id' | 'level2Id' | 'level3Id'
    >,
    requestUserLevel: number,
    requestUserId: string,
  ) {
    try {
      const requestingUser = await UserAuthRepository.findUserById(requestUserId);
      if (!requestingUser) {
        return errorResponse('Requesting user not found');
      }

      const propertyCode = await generateUniquePropertyCode();

      const createData: IPropertyInfoType = {
        propertyName,
        propertyEmail,
        propertyContact,
        propertyType,
        propertyCategory,
        description,
        image,
        starRating,
        isDraft,
        isAvailable,
        isDeleted,
        propertyCode,
        createdById: createdById.toString(),
        creationId: creationId
      };
      //console.log('Creating property with data:', createData);
      const property = await PropertyDao.createProperty(createData);
      if (!property || !property.id) {
        return errorResponse('Failed to create property');
      }
      //console.log(creationId, property.id)
      await AddCreationToCreation.addToProperty(creationId, property.id)
      return successResponse('Property created successfully', {
        id: property.id,
        propertyName: property.propertyName,
        propertyCode: property.propertyCode,
        isDraft: property.isDraft,
      });
    } catch (error: any) {
      return errorResponse('Failed to create property', error.message);
    }
  }
  public static async getPropertyById(
    propertyId: string,
    isDraft: boolean = true
  ) {
    try {
      let property = await PropertyDao.getPropertyById(
        propertyId,
        isDraft
      );
      if (!property) {
        property = await PropertyDao.getPropertyById(
          propertyId,
          !isDraft
        );
      }
      if (!property) {
        return errorResponse('Property Not found');
      } else {
        return successResponse('Property found', property);
      }
    } catch (error: any) {
      return errorResponse('Failed to get property', error.message);
    }
  }
  public static async updatePropertyById(
    propertyId: string | string,
    data: IUpdatePropertyData
  ) {
    try {
      const getProperty = await PropertyDao.getProperty(propertyId);
      if (!getProperty) {
        return errorResponse('Property not found');
      }
      
      const daoRes = await Promise.all([
        PropertyDao.updatePropertyById(
          propertyId,
          data
        ),
        PropertyDao.updatePropertyCategory(
          {
            propertyId: propertyId,
            masterCategoryId: data.propertyCategory.masterCategory.id
          }
        ),
        PropertyDao.updatePropertyType(
          {
            propertyId: propertyId,
            masterTypeId: data.propertyType.masterPropertyType.id
          }
        )
      ]);
      if (daoRes) {
        return successResponse(
          'property details  updated successfully',
          daoRes
        );
      } else {
        return errorResponse('Failed to  update property');
      }
    } catch (error: any) {
      return errorResponse('Failed to update property', error.message);
    }
  }
  public static async deletePropertyById(propertyId: string | string) {
    try {
      const daoRes = await PropertyDao.deletePropertyById(
        propertyId
      );
      if (daoRes) {
        return successResponse('property deleted successfully', daoRes);
      } else {
        return errorResponse('Failed to  delete property');
      }
    } catch (error: any) {
      return errorResponse('Failed to update property', error.message);
    }
  }

}
export class PropertyAddressService {
  public static async createAddressService(propertyId: string, data: any) {
    try {
      const daoRes = await PropertyAddressDao.createAddress(propertyId, data);
      if (daoRes) {
        return successResponse('Property Address created successfully', daoRes);
      } else {
        return errorResponse('Failed to add property address');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findAddressByPropertyId(
    propertyId: string
  ) {
    try {
      const daoRes = await PropertyAddressDao.findByPropertyId(propertyId);
      if (daoRes) {
        return successResponse('Property Address fetched successfully', daoRes);
      } else {
        return errorResponse('Failed to fetch property address');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async updateAddressByPropertyId(
    propertyId: string,
    data: Partial<any>
  ) {
    try {
      const daoRes = await PropertyAddressDao.updateByPropertyId(
        propertyId,
        data
      );
      if (daoRes) {
        return successResponse('Property Address updated successfully', daoRes);
      } else {
        return errorResponse('Failed to update property address');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async deleteAddressByPropertyId(
    propertyId: string
  ) {
    try {
      const daoRes = await PropertyAddressDao.deleteByPropertyId(propertyId);
      if (daoRes) {
        return successResponse('Property Address deleted successfully', daoRes);
      } else {
        return errorResponse('Failed to delete property address');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
}
export class PropertyAminityService {
  public static async createAminityService(
    propertyId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      const daoRes = await PropertyAmenityDao.createAmenities(
        propertyId,
        amenities
      );
      if (daoRes) {
        return successResponse('Property aminity created successfully', daoRes);
      } else {
        return errorResponse('Failed to add property aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async findAminityByPropertyId(
    propertyId: string
  ) {
    try {
      const daoRes = await PropertyAmenityDao.getActiveAmenities(propertyId);
      console.log(daoRes)
      if (daoRes) {
        return successResponse('Property Aminity fetched successfully', daoRes);
      } else {
        return errorResponse('Failed to fetch property aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async updateAminityByPropertyId(
    propertyId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      const daoRes = await PropertyAmenityDao.updateByPropertyId(
        propertyId,
        amenities
      );
      if (daoRes) {
        return successResponse('Property Aminity Updated successfully', daoRes);
      } else {
        return errorResponse('Failed to update property aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
  public static async deleteAminityByPropertyId(
    propertyId: string
  ) {
    try {
      const daoRes = await PropertyAmenityDao.deleteByPropertyId(propertyId);
      if (daoRes) {
        return successResponse('Property Aminity deleted successfully', daoRes);
      } else {
        return errorResponse('Failed to fetch property aminity');
      }
    } catch (error: any) {
      return errorResponse(error?.message);
    }
  }
}
