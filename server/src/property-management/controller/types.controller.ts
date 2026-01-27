import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import {
  CategoryService,
  PropertyTypeService,
  AminityServices,
  RoomAmenityServices,
} from '../services';

export class RoomAminityControllerManagement {
  public static async createRoomAminity(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities || amenities.length == 0) {
        return res.status(400).json(errorResponse('Aminity is empty'));
      }
      const serRes = await RoomAmenityServices.createRoomAmenity(amenities);
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
  public static async getRoomAmenities(req: CustomRequest, res: Response) {
    try {
      const serRes = await RoomAmenityServices.getRoomAmenity();
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
  public static async deleteRoomAmenities(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(errorResponse('Aminity is required to delete'));
      }
      const serRes = await RoomAmenityServices.deleteRoomAmenity(amenities);
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
}
export class AminityController {
  public static async createAminity(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities || amenities.length == 0) {
        return res.status(400).json(errorResponse('Aminity is empty'));
      }
      const serRes = await AminityServices.createCategory(amenities);
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
  public static async getAmenities(req: CustomRequest, res: Response) {
    try {
      const type=req.query.type as string | "property"
      const serRes = await AminityServices.getCategory(type);
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
  public static async deleteAmenities(req: CustomRequest, res: Response) {
    try {
      const { amenities } = req.body;
      if (!amenities) {
        return res
          .status(400)
          .json(errorResponse('Aminity is required to delete'));
      }
      const serRes = await AminityServices.deleteCategory(amenities);
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
}
export class Category {
  public static async createCategory(req: CustomRequest, res: Response) {
    try {
      const { categoryName, description } = req.body;
      if (!categoryName || !description) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Category Name and description required to create category'
            )
          );
      }
      const serRes = await CategoryService.createCategory(
        categoryName,
        description
      );
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
  public static async getCategory(req: CustomRequest, res: Response) {
    try {
      const serRes = await CategoryService.getCategory();
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
  public static async deleteCategory(req: CustomRequest, res: Response) {
    try {
      const categoryName = req.params.categoryName;
      if (!categoryName) {
        return res
          .status(400)
          .json(errorResponse('Category Name is required to delete category'));
      }
      const serRes = await CategoryService.deleteCategory(categoryName);
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
}
export class PropertyType {
  public static async createPropertyTypeController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const { propertyTypeName, description } = req.body;
      if (!propertyTypeName || !description) {
        return res
          .status(400)
          .json(
            errorResponse(
              'Category Name and description required to create category'
            )
          );
      }
      const serRes = await PropertyTypeService.createPropertyTypeService(
        propertyTypeName,
        description
      );
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
  public static async getPropertyTypeController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const serRes = await PropertyTypeService.getPropertyTypeService();
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
  public static async deletePropertyTypeController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const propertyTypeName = req.params.propertyTypeName;
      if (!propertyTypeName) {
        return res
          .status(400)
          .json(errorResponse('Category Name is required to delete category'));
      }
      const serRes =
        await PropertyTypeService.deletePropertyTypeService(propertyTypeName);
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
}
