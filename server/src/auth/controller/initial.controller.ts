// import { Request,Response } from "express";
// import { errorResponse } from "../../utils/return";
// import {InitDbService} from "../services";

// export class InitDbController{
//     inidbs:InitDbService
//     constructor(){
//         this.inidbs=new InitDbService()
//     }
//     public async initDbController(req:Request,res:Response){
//         try {
//             const serRes=await this.inidbs.initDbService()
//             if(!serRes.success){
//                 return res.status(500).json(serRes)
//             }
//             return res.status(200).json(serRes)

//         } catch (error) {
//             return res.status(500).json(errorResponse("Failed to init db"))
//         }
//     }
// }
