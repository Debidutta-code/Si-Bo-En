// src/modules/google-feeds/controller/google-feeds.controller.ts

import { Request, Response } from 'express';
import { GoogleFeedsService } from '../services';
import { GoogleFeedsXMLBuilder } from '../utils/xml-bulder.utils';
import { GoogleFeedsRepository } from '../dao';

export class GoogleFeedsController {
    /**
     * GET /feeds/hotel-list.xml
     * Returns hotel list feed in XML format
     */
    public static async getHotelListFeed(req: Request, res: Response) {
        try {
            //   console.log('📋 Generating Hotel List Feed...');
            const startTime = Date.now();

            const hotels = await GoogleFeedsService.generateHotelListFeed();
            const xml = GoogleFeedsXMLBuilder.buildHotelListFeed(hotels);

            const duration = Date.now() - startTime;
            //   console.log(`✅ Hotel List Feed generated in ${duration}ms (${hotels.length} hotels)`);

            res.set('Content-Type', 'text/xml');
            res.send(xml);
        } catch (error: any) {
            console.error('❌ Error generating hotel list feed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate hotel list feed',
                error: error?.message,
            });
        }
    }

    /**
     * GET /feeds/price-availability.xml
     * Returns price & availability feed in XML format
     */
    public static async getPriceFeed(req: Request, res: Response) {
        try {
            //   console.log('💰 Generating Price & Availability Feed...');
            const startTime = Date.now();

            const prices = await GoogleFeedsService.generatePriceFeed();
            const xml = GoogleFeedsXMLBuilder.buildPriceFeed(prices);

            const duration = Date.now() - startTime;
            //   console.log(`✅ Price Feed generated in ${duration}ms (${prices.length} entries)`);

            res.set('Content-Type', 'text/xml');
            res.send(xml);
        } catch (error: any) {
            console.error('❌ Error generating price feed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate price feed',
                error: error?.message,
            });
        }
    }

    /**
     * GET /feeds/landing-pages.xml
     * Returns landing page feed in XML format
     */
    public static async getLandingPageFeed(req: Request, res: Response) {
        try {
            //   console.log('🔗 Generating Landing Page Feed...');
            const startTime = Date.now();

            const landingPages =
                await GoogleFeedsService.generateLandingPageFeed();
            const xml =
                GoogleFeedsXMLBuilder.buildLandingPageFeed(landingPages);

            const duration = Date.now() - startTime;
            //   console.log(`✅ Landing Page Feed generated in ${duration}ms (${landingPages.length} pages)`);

            res.set('Content-Type', 'text/xml');
            res.send(xml);
        } catch (error: any) {
            console.error('❌ Error generating landing page feed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate landing page feed',
                error: error?.message,
            });
        }
    }

    /**
     * GET /feeds/status
     * Health check endpoint for monitoring
     */
    public static async getFeedStatus(req: Request, res: Response) {
        try {
            // Import repository directly to avoid circular dependency
            const propertyCount =
                await GoogleFeedsRepository.getActivePropertyCount();

            res.json({
                success: true,
                message: 'Google Feeds service is operational',
                data: {
                    activeProperties: propertyCount,
                    daysAhead: 180,
                    defaultGuests: { adults: 2, children: 0, rooms: 1 },
                    endpoints: {
                        hotelList: '/feeds/hotel-list.xml',
                        priceAvailability: '/feeds/price-availability.xml',
                        landingPages: '/feeds/landing-pages.xml',
                    },
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to get feed status',
                error: error?.message,
            });
        }
    }
}
