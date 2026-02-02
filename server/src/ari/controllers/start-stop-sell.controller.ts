import { Response } from "express";
import { PropertyCustomRequest } from "../../utils/customRequest";
import { StartStopSellService } from "../services";

export class StartStopSellController {
    startStopSellService: StartStopSellService;
    constructor() {
        this.startStopSellService = new StartStopSellService();
    }
    public async createStartStopSell(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;
            if(!propertyId){
                return res.status(400).json({ message: 'Property ID is required' });
            }
            const startStopSellData = req.body;
            if(!startStopSellData){
                return res.status(400).json({ message: 'Start-stop-sell data is required' });
            }
            const response = await this.startStopSellService.createStartStopSell(
                propertyId,
                {...startStopSellData,from: new Date(startStopSellData.from),to: new Date(startStopSellData.to)}
            );
            return res.status(response.success ? 200 : 400).json(response);
        }catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}