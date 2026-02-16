import { CustomRequest } from "../../utils/customRequest";
import { errorResponse } from "../../utils/return";
import { CategoryService } from "../services";
import { Response } from "express";
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