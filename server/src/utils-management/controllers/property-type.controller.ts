import { CustomRequest } from "../../utils/customRequest";
import { errorResponse } from "../../utils/return";
import { PropertyTypeService } from "../services";
import { Response } from "express";

export class PropertyType {
  private propertyTypeService: PropertyTypeService;
  constructor() {
    this.propertyTypeService = new PropertyTypeService();
  }
  public  async createPropertyTypeController(
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
      const serRes = await this.propertyTypeService.createPropertyTypeService(
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
  public  async getPropertyTypeController(
    req: CustomRequest,
    res: Response
  ) {
    try {
      const serRes = await this.propertyTypeService.getPropertyTypeService();
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
  public  async deletePropertyTypeController(
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
        await this.propertyTypeService.deletePropertyTypeService(propertyTypeName);
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