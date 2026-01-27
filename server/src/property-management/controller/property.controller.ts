import { CustomRequest } from '../../utils/customRequest';
import { Response } from 'express';
import { errorResponse } from '../../utils/return';
import {
  PropertyService,
  PropertyAddressService,
  PropertyAminityService,
} from '../services';
import type { IUpdatePropertyData } from '../types/propertyModel.types';
export class Property {
  public static async createProperty(req: CustomRequest, res: Response) {
    try {
      const requestUserLevel = req.user?.level;
      const requestUserId = req.user?.id;
      const creationId = req.body.creationId;
      if (!requestUserLevel || !requestUserId) {
        return res
          .status(400)
          .json(errorResponse('In Sufficient Data about user'));
      }
      if (!creationId) {
        return res.status(400).json(errorResponse('This user is not associated with any creation'));
      }

      const {
        propertyName,
        propertyEmail,
        propertyContact,
        propertyType,
        propertyCategory,
        description,
        image,
      } = req.body;
      if (
        !propertyName ||
        !propertyEmail ||
        !propertyContact ||
        !propertyType ||
        !propertyCategory 
      ) {
        return res
          .status(400)
          .json(errorResponse('Provide all the necessary field'));
      }
      if (!image || image.length == 0) {
        return res
          .status(400)
          .json(errorResponse('Must provide at least one image of property'));
      }
      console.log(propertyType,
        propertyCategory)
      const serviceRes = await PropertyService.createPropertyService(
        {
          propertyName,
          propertyEmail,
          propertyContact,
          propertyType,
          propertyCategory,
          description,
          image,
          createdById: requestUserId,
          starRating: "1.0",
          isDraft: false,
          isAvailable: true,
          isDeleted: false,
          creationId: creationId,
        },
        requestUserLevel,
        requestUserId
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        console.log(serviceRes);
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async getPropertyById(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property Id Not found'));
      }
      const serRes = await PropertyService.getPropertyById(id);
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updatePropertyById(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property Id Not found'));
      }
      const updateBody: IUpdatePropertyData = req.body;
      const serRes = await PropertyService.updatePropertyById(id, updateBody);
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deletePropertyById(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property Id Not found'));
      }
      const updateBody = req.body;
      const serRes = await PropertyService.deletePropertyById(id);
      if (serRes.success) {
        return res.status(200).json(serRes);
      } else {
        return res.status(400).json(serRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  // Controller


}
export class PropertyAddressController {
  public static async createPropertyAddressController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const propertyId = req.params.id;
      if (!propertyId) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const {
        addressLine1,
        addressLine2,
        country,
        state,
        city,
        location,
        landmark,
        zipCode,
        latitude,
        longitude,
      } = req.body;
      if (
        !addressLine1 ||
        !country ||
        !state ||
        !city ||
        !location ||
        !landmark ||
        !zipCode ||
        !latitude ||
        !longitude
      ) {
        return res
          .status(400)
          .json(errorResponse('Fill all the necessary fields'));
      }
      const serviceRes = await PropertyAddressService.createAddressService(propertyId,
        {
          addressLine1,
          addressLine2,
          country,
          state,
          city,
          location,
          landmark,
          zipCode,
          latitude:parseFloat(latitude),
          longitude:parseFloat(longitude),
        });
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async findAddressByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      console.log(req.params);
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const serviceRes =
        await PropertyAddressService.findAddressByPropertyId(id);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateAddressByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const {
        addressLine1,
        addressLine2,
        country,
        state,
        city,
        location,
        landmark,
        zipCode,
        latitude,
        longitude,
      } = req.body;
      const serviceRes = await PropertyAddressService.updateAddressByPropertyId(
        id,
        {
          addressLine1,
          addressLine2,
          country,
          state,
          city,
          location,
          landmark,
          zipCode,
          latitude:parseFloat(latitude),
          longitude:parseFloat(longitude),
        }
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deleteAddressByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const serviceRes =
        await PropertyAddressService.deleteAddressByPropertyId(id);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
export class PropertyAminityController {
  public static async createPropertyAminityController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const propertyId = req.params.id;
      if (!propertyId) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      console.log(req.body);
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(
            errorResponse('Aminity is required to create aminity for property')
          );
      }
      const serviceRes = await PropertyAminityService.createAminityService(
        propertyId,
        amenities
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async findAminityByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const serviceRes =
        await PropertyAminityService.findAminityByPropertyId(id);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async updateAminityByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const { amenities } = req.body;
      const serviceRes = await PropertyAminityService.updateAminityByPropertyId(
        id,
        amenities
      );
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deleteAminityByPropertyIdController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json(errorResponse('Property id not found'));
      }
      const serviceRes =
        await PropertyAminityService.deleteAminityByPropertyId(id);
      if (serviceRes?.success) {
        return res.status(200).json(serviceRes);
      } else {
        return res.status(400).json(serviceRes);
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
