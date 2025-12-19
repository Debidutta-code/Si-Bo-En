import { Response } from "express";
import { CustomRequest } from "../../../../utils/customRequest";
import { successResponse,errorResponse } from "../../../../utils/return";
import {validateGuest} from "../utils";
import {GuestService} from "../services";
export class GuestController{
    guestServices:GuestService;
    constructor(){
        this.guestServices= new GuestService();
    }
    public async createGuest(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {guestData} =req.body;
            const validationResponse=validateGuest(guestData)
            if(validationResponse){
                return res.status(400).json(errorResponse(validationResponse))
            }
            const serRes=await this.guestServices.createGuest(guestData);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to create Guests",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async findGuestByEmail(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {email} = req.query;
            if(typeof email !== 'string' || !email.trim()){
                return res.status(400).json(errorResponse("Email is required and must be a string"));
            }
            const serRes=await this.guestServices.getGuestByEmail(email as string);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to get Guests",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getGuestById(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {guestId} = req.params;
            if(!guestId){
                return res.status(400).json(errorResponse("Guest ID is required"));
            }
            const serRes=await this.guestServices.getGuestDetailsById(guestId);
            return res.status(serRes.success?200:400).json(serRes)
        
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to get Guests",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateGuest(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {guestId} = req.params;
            const updatedData = req.body;
            if(!guestId){
                return res.status(400).json(errorResponse("Guest ID is required"));
            }
            const serRes=await this.guestServices.updateGuest(guestId, updatedData);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to update Guest",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getGuestForProperty(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {propertyId} = req.params;
            if(!propertyId){
                return res.status(400).json(errorResponse("Property ID is required"));
            }
            const serRes=await this.guestServices.getGuestsForProperty(propertyId);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to get Guests for property",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getTotalReservationsForAGuest(req:CustomRequest,res:Response):Promise<Response>{
        try {
            console.log("Reached Controller");
            const {email} = req.query;
            if(typeof email !== 'string' || !email.trim()){
                return res.status(400).json(errorResponse("Email is required and must be a string"));
            }
            const serRes=await this.guestServices.getTotalReservationsForAGuest(email as string);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to get total reservations for guest",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    
    }
    public async deleteGuest(req:CustomRequest,res:Response):Promise<Response>{
        try {
            const {guestId} = req.params;
            if(!guestId){
                return res.status(400).json(errorResponse("Guest ID is required"));
            }
            const serRes=await this.guestServices.deleteGuest(guestId);
            return res.status(serRes.success?200:400).json(serRes)
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to delete Guest",error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}