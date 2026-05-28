import { Request, Response } from 'express';
import { HotelFilterQuery } from '../types';
import { HotelService } from '../services/hotel.service';
import { errorResponse, IApiResponse, successResponse } from '../../../utils';

export class HotelController {
    private hotelService: HotelService;
    constructor() {
        this.hotelService = new HotelService();
    }
    public async fetchHotels(req: Request, res: Response): Promise<Response<IApiResponse>> {
        try {

            const query: HotelFilterQuery = {
                page: req.query.page as string,
                limit: req.query.limit as string,
                search: req.query.search as string,
                city: req.query.city as string,
                country: req.query.country as string,
                amenities: req.query.amenities as string,
                propertyType: req.query.propertyType as string,
                propertyCategory: req.query.propertyCategory as string,
            };

            const data = await this.hotelService.fetchPaginatedHotels(query);

            return res.status(200).json(successResponse("Properties fetched successfully", data));
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch properties", error.message))
            }
            return res.status(500).json(errorResponse("Failed to fetch properties", "Unknown error"))
        }
    }

    public async fetchAutocompleteLocations(req: Request, res: Response) {
        try {

            const query: HotelFilterQuery = {
                page: req.query.page as string,
                limit: req.query.limit as string,
                search: req.query.search as string,
                city: req.query.city as string,
                country: req.query.country as string,
                amenities: req.query.amenities as string,
                propertyType: req.query.propertyType as string,
                propertyCategory: req.query.propertyCategory as string,
            };

            const data = await this.hotelService.fetchAutocompleteLocations(query);

            res.status(200).json(successResponse("Properties in the location fetched successfully", data));
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch properties", error.message))
            }
            return res.status(500).json(errorResponse("Failed to fetch properties", "Unknown error"))

        }
    }
}
