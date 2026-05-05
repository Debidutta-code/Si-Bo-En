// import { successResponse, errorResponse } from "../../utils/return";
// import { IApiResponse } from "../../utils/return.types";
// import { InitializeDB } from "../repository";
// export class InitDbService {
//     initDb:InitializeDB
//     constructor(){
//         this.initDb=new InitializeDB();
//     }
//     public async initDbService(): Promise<IApiResponse> {
//         try {
//             const daoRes=await this.initDb.initDb();
//             if(!daoRes){
//                 return errorResponse("Failed to Init Db")
//             }
//             return successResponse("DB Initialized successfully")
//         } catch (error) {
//             if (error instanceof Error) {
//                 return errorResponse("Failed to init Db", error.message)
//             }
//             return errorResponse("Failed to init Db")
//         }
//     }
// }