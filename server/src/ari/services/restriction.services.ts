// src/modules/restrictions/services/restriction.services.ts

import { errorResponse, successResponse } from '../../utils/return';
import { RestrictionRepository } from '../repository/restriction.repository';
import { IRestrictionRequest } from '../types/restriction.types';

export class RestrictionServices {
  public static async applyRestrictions(restrictionData: IRestrictionRequest) {
    try {
      const {
        propertyCode,
        restrictionType,
        dates,
        notes,
        isActive,
        roomRestrictions,
        globalRatePlans,
      } = restrictionData;

      // Convert date strings to Date objects
      const dateObjects = dates.map(dateStr => new Date(dateStr));

      // Collect all rate plan identifiers
      const allRatePlanIdentifiers = [
        ...globalRatePlans,
        ...roomRestrictions.flatMap(r => r.ratePlanCodes),
      ];

      // Check if they're names or codes (names usually have spaces or are longer)
      const areTheyNames = allRatePlanIdentifiers.some(
        identifier => identifier.length > 10 || /\s/.test(identifier)
      );

      let globalRatePlanCodes = globalRatePlans;
      let processedRoomRestrictions = roomRestrictions;

      // If they're names, convert to codes
      if (areTheyNames && allRatePlanIdentifiers.length > 0) {
        const allNames = [...new Set(allRatePlanIdentifiers)];
        
        // Fetch rate plans with their codes
        const ratePlans = await RestrictionRepository.getRatePlansByNames(
          propertyCode,
          allNames
        );

        // Create name to code map
        const namesToCodes: Record<string, string> = {};
        ratePlans.forEach(rp => {
          namesToCodes[rp.ratePlanName] = rp.ratePlanCode;
        });

        // Convert global rate plans
        globalRatePlanCodes = globalRatePlans.map(
          name => namesToCodes[name] || name
        );

        // Convert room restrictions
        processedRoomRestrictions = roomRestrictions.map(restriction => ({
          roomTypeCode: restriction.roomTypeCode,
          ratePlanCodes: restriction.ratePlanCodes.map(
            name => namesToCodes[name] || name
          ),
        }));
      }

      // Apply the restrictions
      const affectedCount = await RestrictionRepository.applyRestrictions(
        propertyCode,
        restrictionType,
        dateObjects,
        isActive,
        notes || null,
        processedRoomRestrictions,
        globalRatePlanCodes
      );

      if (affectedCount > 0) {
        return successResponse(
          `${restrictionType} ${isActive ? 'applied' : 'removed'} successfully`,
          {
            appliedRestrictions: affectedCount,
            affectedDates: dates,
            affectedRatePlans: [
              ...globalRatePlanCodes,
              ...processedRoomRestrictions.flatMap(r => r.ratePlanCodes),
            ],
          }
        );
      } else {
        return errorResponse('No charges found matching the criteria');
      }
    } catch (error: any) {
      return errorResponse('Failed to apply restrictions', error?.message);
    }
  }

  public static async getRestrictions(
    propertyCode: string,
    startDate?: string,
    endDate?: string,
    restrictionType?: 'CTA' | 'CTD'
  ) {
    try {
      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const restrictions = await RestrictionRepository.getRestrictionsByProperty(
        propertyCode,
        startDateObj,
        endDateObj,
        restrictionType
      );

      return successResponse('Restrictions fetched successfully', restrictions);
    } catch (error: any) {
      return errorResponse('Failed to fetch restrictions', error?.message);
    }
  }
}