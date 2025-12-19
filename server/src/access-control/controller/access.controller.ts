import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { AccessService } from '../services';
export default class AccessControl {
  public static async createNewRole(req: CustomRequest, res: Response) {
    try {
      const { data } = req.body;
      if (data.level < 0 || data.level > 4) {
        return res.status(400).json(errorResponse('Hierarchy not defined'));
      }
      if (!data.role || data.role == '') {
        return res.status(400).json(errorResponse('Role must be defined'));
      }
      const serviceRes = await AccessService.createNewRoleService(data);
      if (serviceRes.success) {
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
  public static async getAllAccesses(req: CustomRequest, res: Response) {
    try {
      const serviceRes = await AccessService.getAllAccessesService();
      if (serviceRes.success) {
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
  public static async getAccessForRole(req: CustomRequest, res: Response) {
    try {
      const role = req.params.role.toString() as "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager";
      if (!role) {
        return res.status(400).json(errorResponse('Specify a Role'));
      }
      const serviceRes = await AccessService.getAccessForLevel(role);
      if (serviceRes.success) {
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
  public static async updateAccessForLevel(req: CustomRequest, res: Response) {
    try {
      const role = req.params.role.toString() as "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager";
      if (!role) {
        return res.status(400).json(errorResponse('Specify a Role'));
      }
      const { data } = req.body;
      const serviceRes = await AccessService.updateAccessForLevel(role, data);
      if (serviceRes.success) {
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
  public static async getAllRoles(req: CustomRequest, res: Response){
    try {
      const roles=await AccessService.getAllRoles()
      if(roles.success){
        return res.status(200).json(roles)
      }else{
        return res.status(400).json(roles)
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
  public static async deleteRoleController(req:CustomRequest,res:Response){
    try {
      const role=req.params.role.toString() as "staff" | "super_admin" | "group_manager" | "hotel_manager" | "brand_manager" | "revenue_manager";
      if(!role){
        return res.status(400).json(errorResponse(`Role not found`))
      }
      const serRes=await AccessService.deleteRole(role)
      if(serRes.success){
        return res.status(200).json(serRes)
      }else{
        return res.status(400).json(serRes)
      }
    } catch (error: any) {
      return res
        .status(500)
        .json(errorResponse('Internal Server Error', error?.message));
    }
  }
}
