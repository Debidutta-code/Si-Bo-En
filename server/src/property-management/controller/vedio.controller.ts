import { CustomRequest, PropertyCustomRequest } from "../../utils";
import { errorResponse } from "../../utils";
import { Response } from "express";
import { ICRoomVideo,ICPropertyVideo,IPropertyVideo,IRoomVideo } from "../types";
import {
    PropertyVideoService,
    RoomVideoService
} from "../services";
export class PropertyVedioController{

    private propertyVideoService = new PropertyVideoService();
    constructor(){
        this.propertyVideoService = new PropertyVideoService();
    }
    public async createVideo(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            const {videoUrl, thumbnailUrl}=req.body;
            const propertyId=req.property?.id;
            if(!videoUrl){
                return res.status(400).json(errorResponse("Vedio Url is not provided"));
            }
            if(!propertyId){
                return res.status(400).json(errorResponse("Property Id is not provided"));
            }
            const response = await this.propertyVideoService.createVideo({propertyId, url:videoUrl, thumbnail:thumbnailUrl});
            return res.status(response.success?201:400).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
        
    }
    public async deletePropertyVideo(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.property?.id;
            if(!propertyId){
                return res.status(400).json(errorResponse("Property  is not selected"));
            }
            const response = await this.propertyVideoService.deletePropertyVideo(propertyId);
            return res.status(response.success?200:400).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getPropertyVideo(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.property?.id;
            if(!propertyId){
                return res.status(400).json(errorResponse("Property  is not selected"));
            }
            const response = await this.propertyVideoService.getPropertyVideo(propertyId);
            return res.status(response.success?200:400).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}


export class RoomVedioController{
    private roomVideoService = new RoomVideoService();
    constructor(){
        this.roomVideoService = new RoomVideoService();
    }
    public async createVideo(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const {videoUrl, thumbnailUrl}=req.body;
            const roomId=req.params?.roomId;
            //console.log(req.params);
            if(!videoUrl){
                return res.status(400).json(errorResponse("Video Url is not provided"));
            }
            if(!roomId){
                return res.status(400).json(errorResponse("Room is not selected"));
            }
            const response = await this.roomVideoService.createVideo({url:videoUrl, roomId:roomId, thumbnail:thumbnailUrl});
            return res.status(response.success?201:400).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }

    }
    public async deleteRoomVideo(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const roomId=req.params?.roomId;
            if(!roomId){
                return res.status(400).json(errorResponse("Room  is not selected"));
            }
            const response = await this.roomVideoService.deleteRoomVideo(roomId);
            return res.status(response.success?200:400).json(response);
            
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    public async getRoomVideo(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const roomId = req.params?.roomId;
            if(!roomId){
                return res.status(400).json(errorResponse("Room  is not selected"));
            }
            const response = await this.roomVideoService.getRoomVideo(roomId);
            return res.status(response.success?200:400).json(response);
        } catch (error) {
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}
