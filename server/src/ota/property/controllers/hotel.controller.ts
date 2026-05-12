import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { HotelFilterQuery } from '../types';
import { HotelService } from '../services/hotel.service';

export class HotelController {
    public static fetchHotels = asyncHandler(
        async (req: Request, res: Response) => {
            // Extract filters from query parameters
            const query: HotelFilterQuery = {
                page: req.query.page as string,
                limit: req.query.limit as string,
                search: req.query.search as string,
                city: req.query.city as string,
                country: req.query.country as string,
                starRating: req.query.starRating as string,
                amenities: req.query.amenities as string,
                propertyType: req.query.propertyType as string,
                propertyCategory: req.query.propertyCategory as string,
            };

            const data = await HotelService.fetchPaginatedHotels(query);

        res.status(200).json({
            status: 'success',
            message: 'Hotels fetched successfully',
            data
        });
    });

    public static fetchAutocompleteLocations = asyncHandler(async (req: Request, res: Response) => {
        // Extract filters from query parameters
        const query: HotelFilterQuery = {
            page: req.query.page as string,
            limit: req.query.limit as string,
            search: req.query.search as string,
            city: req.query.city as string,
            country: req.query.country as string,
            starRating: req.query.starRating as string,
            amenities: req.query.amenities as string,
            propertyType: req.query.propertyType as string,
            propertyCategory: req.query.propertyCategory as string,
        };

        const data = await HotelService.fetchAutocompleteLocations(query);

        res.status(200).json({
            status: 'success',
            message: 'Locations fetched successfully',
            data
        });
    });
}
