// src/modules/google-feeds/service/google-feeds.service.ts

import {
  IGoogleHotelListItem,
  IGooglePriceItem,
  IGoogleLandingPageItem,
} from '../interfaces';
import { GOOGLE_FEED_CONFIG } from '../config/google.config';
import { GoogleFeedsRepository } from '../dao';
import { RoomBookingService } from '../../../booking-engine/service';

export class GoogleFeedsService {
  /**
   * Generate Hotel List Feed Data
   */
  public static async generateHotelListFeed(): Promise<IGoogleHotelListItem[]> {
    const properties = await GoogleFeedsRepository.getAllActiveProperties();

    return properties.map((p) => ({
      hotelId: p.propertyCode,
      hotelName: p.propertyName,
      addressLine1: p.propertyAddress.addressLine1,
      addressLine2: p.propertyAddress.addressLine2,
      city: p.propertyAddress.city,
      state: p.propertyAddress.state,
      country: p.propertyAddress.country,
      zipCode: p.propertyAddress.zipCode,
      latitude: p.propertyAddress.latitude,
      longitude: p.propertyAddress.longitude,
      phoneNumber: p.propertyContact,
      websiteUrl: `https://bookings.revchilltech.com/Rooms/?code=${p.propertyCode}`,
    }));
  }

  /**
   * Generate Price & Availability Feed Data
   * ✅ Returns ONLY the lowest-priced room for each date
   */
  public static async generatePriceFeed(): Promise<IGooglePriceItem[]> {
    const properties = await GoogleFeedsRepository.getAllActiveProperties();
    const allPrices: IGooglePriceItem[] = [];

    // console.log(`🏨 Generating price feed for ${properties.length} properties...`);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
    //   console.log(`  Processing ${i + 1}/${properties.length}: ${property.propertyCode}`);

      try {
        const startTime = Date.now();
        const propertyPrices = await this.generateLowestPricesForProperty(property.propertyCode);
        const duration = Date.now() - startTime;
        
        allPrices.push(...propertyPrices);
        // console.log(`    ✅ Generated ${propertyPrices.length} entries (lowest prices only) in ${(duration / 1000).toFixed(1)}s`);

        // Small delay between properties
        if ((i + 1) % GOOGLE_FEED_CONFIG.BATCH_SIZE === 0) {
          await this.delay(GOOGLE_FEED_CONFIG.DELAY_BETWEEN_BATCHES);
        }
      } catch (error) {
        console.error(`    ❌ Error processing ${property.propertyCode}:`, error);
      }
    }

    // console.log(`✅ Total price entries generated: ${allPrices.length}`);
    return allPrices;
  }

  /**
   * Generate Landing Page Feed Data
   */
  public static async generateLandingPageFeed(): Promise<IGoogleLandingPageItem[]> {
    const properties = await GoogleFeedsRepository.getAllActiveProperties();
    const landingPages: IGoogleLandingPageItem[] = [];

    for (const property of properties) {
      landingPages.push({
        hotelId: property.propertyCode,
        ratePlanId: 'standard',
        occupancy: 2,
        baseRate: 0,
        tax: 0,
        otherFees: 0,
        currencyCode: 'USD',
        landingPageUrl: `https://bookings.revchilltech.com/Rooms/?code=${property.propertyCode}&checkin={checkin}&checkout={checkout}&adults={adults}&children={children}&rooms={rooms}`,
      });
    }

    return landingPages;
  }

  /**
   * ✅ Generate LOWEST PRICE for each date (parallel, no chunking in XML)
   */
  private static async generateLowestPricesForProperty(
    propertyCode: string
  ): Promise<IGooglePriceItem[]> {
    const lowestPrices: IGooglePriceItem[] = [];
    const today = new Date();
    
    // Generate all date pairs
    const datePairs: Array<{ checkIn: string; checkOut: string }> = [];
    for (let dayOffset = 0; dayOffset < GOOGLE_FEED_CONFIG.DAYS_AHEAD; dayOffset++) {
      const checkInDate = new Date(today);
      checkInDate.setDate(today.getDate() + dayOffset);
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + GOOGLE_FEED_CONFIG.DEFAULT_NIGHTS);

      datePairs.push({
        checkIn: this.formatDate(checkInDate),
        checkOut: this.formatDate(checkOutDate),
      });
    }

    // Process dates in parallel
    const concurrency = GOOGLE_FEED_CONFIG.CONCURRENT_DATE_REQUESTS;
    
    for (let i = 0; i < datePairs.length; i += concurrency) {
      const batch = datePairs.slice(i, i + concurrency);
      
      // Fetch all dates in this batch concurrently
      const batchPromises = batch.map(async ({ checkIn, checkOut }) => {
        try {
          const response = await RoomBookingService.fetchRooms({
            propertyCode: propertyCode,
            startDate: checkIn,
            endDate: checkOut,
            guests: {
              adults: GOOGLE_FEED_CONFIG.DEFAULT_ADULTS,
              children: GOOGLE_FEED_CONFIG.DEFAULT_CHILDREN,
              rooms: GOOGLE_FEED_CONFIG.DEFAULT_ROOMS,
            },
            countryCode: 'US',
            deviceType: 'desktop',
          });

          // ✅ Find the LOWEST price across all rooms and rate plans
          let lowestPrice: IGooglePriceItem | null = null;

          if (response.success && response.data?.rooms) {
            for (const room of response.data.rooms) {
              if (!room.hasValidRate || !room.roomPrice.length) continue;

              for (const rateplan of room.roomPrice) {
                const currentPrice: IGooglePriceItem = {
                  hotelId: propertyCode,
                  roomId: room.id,
                  roomName: room.roomName,
                  roomDescription: room.description,
                  maxOccupancy: room.maxOccupancy,
                  ratePlanId: rateplan.ratePlanCode,
                  ratePlanName: rateplan.ratePlanName,
                  checkInDate: checkIn,
                  nights: GOOGLE_FEED_CONFIG.DEFAULT_NIGHTS,
                  baseRate: rateplan.totalAmount,
                  tax: 0,
                  otherFees: 0,
                  currencyCode: rateplan.currencyCode,
                };

                // Keep only if this is the lowest price so far
                if (!lowestPrice || currentPrice.baseRate < lowestPrice.baseRate) {
                  lowestPrice = currentPrice;
                }
              }
            }
          }

          // Return the lowest price (or null if none found)
          return lowestPrice;
        } catch (error) {
          console.error(`    ⚠️ Error fetching ${propertyCode} for ${checkIn}:`, error);
          return null;
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out nulls and add to results
      const validPrices = batchResults.filter((price): price is IGooglePriceItem => price !== null);
      lowestPrices.push(...validPrices);

      // Progress indicator
      const progress = Math.min(i + concurrency, datePairs.length);
    //   console.log(`    📊 Progress: ${progress}/${datePairs.length} dates (${((progress / datePairs.length) * 100).toFixed(0)}%)`);
    }

    return lowestPrices;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}