// src/modules/google-feeds/repository/google-feeds.repository.ts

import { prisma } from '../../../config';
import { IPropertyForFeed } from '../interfaces';

export class GoogleFeedsRepository {
  /**
   * Get all active properties with their addresses
   */
  public static async getAllActiveProperties(): Promise<IPropertyForFeed[]> {
    const properties = await prisma.property.findMany({
      where: {
        isAvailable: true,
        isDeleted: false,
        isDraft: true,
      },
      select: {
        id: true,
        propertyCode: true,
        propertyName: true,
        propertyContact: true,
        propertyAddress: {
          select: {
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return properties.map((p) => ({
      id: p.id,
      propertyCode: p.propertyCode,
      propertyName: p.propertyName,
      propertyContact: p.propertyContact,
      propertyAddress: {
        addressLine1: p.propertyAddress?.addressLine1 || '',
        addressLine2: p.propertyAddress?.addressLine2,
        city: p.propertyAddress?.city || '',
        state: p.propertyAddress?.state || '',
        country: p.propertyAddress?.country || '',
        zipCode: p.propertyAddress?.zipCode || '',
        latitude: p.propertyAddress?.latitude || 0,
        longitude: p.propertyAddress?.longitude || 0,
      },
    }));
  }

  /**
   * Get property count for monitoring
   */
  public static async getActivePropertyCount(): Promise<number> {
    return prisma.property.count({
      where: {
        isAvailable: true,
        isDeleted: false,
        isDraft: false,
      },
    });
  }
}