// group-search.repository.ts

import { prisma } from '../../config';
import { IBrandCreations, IGroupCreations, IPropertyDetails } from '../types';

export class GroupSearchRepository {

  public async getGroupChildrens(groupId: string): Promise<IGroupCreations | null> {
    try {
      return await prisma.creation.findUnique({
        where: { id: groupId, type: 'group' },
        include: { groupChildren: true },
      });
    } catch {
      throw new Error('Error fetching group children');
    }
  }

  public async getBrandChildrens(brandIds: string[]): Promise<IBrandCreations[]> {
    try {
      return await prisma.creation.findMany({
        where: { id: { in: brandIds }, type: 'brand' },
        include: { brandChildren: true },
      });
    } catch {
      throw new Error('Error fetching brand children');
    }
  }

  public async getBrandNames(
    brandIds: string[]
  ): Promise<{ id: string; name: string }[]> {
    try {
      return await prisma.creation.findMany({
        where: { id: { in: brandIds }, type: 'brand' },
        select: { id: true, name: true },
      });
    } catch {
      throw new Error('Error fetching brand names');
    }
  }

  public async getPropertyCreationIdsByBrand(brandId: string): Promise<string[]> {
    try {
      const brand = await prisma.creation.findUnique({
        where: { id: brandId, type: 'brand' },
        include: { brandChildren: true },
      });
      if (!brand) return [];
      return brand.brandChildren
        .filter((c) => c.type === 'property')
        .map((c) => c.id);
    } catch {
      throw new Error('Error fetching brand property creation ids');
    }
  }

  public async getPropertyDetails(
    propertyCreationIds: string[],
    city?: string
  ): Promise<IPropertyDetails[]> {
    try {
      return await prisma.property.findMany({
        where: {
          creationId: { in: propertyCreationIds },
          isDraft: true,
          isAvailable: true,
          isDeleted: false,
          ...(city
            ? { propertyAddress: { city: { equals: city, mode: 'insensitive' } } }
            : {}),
        },
        select: {
          id: true,
          propertyName: true,
          propertyCode: true,
          description: true,
          image: true,
          propertyCategory: {
            include: {
              masterCategory: {
                select: {
                  categoryName: true,
                  categoryDescription: true,
                },
              },
            },
          },
          propertyType: {
            include: {
              masterPropertyType: {
                select: {
                  propertyTypeName: true,
                  propertyTypeDescription: true,
                },
              },
            },
          },
          propertyAddress: true,
        },
      });
    } catch {
      throw new Error('Error fetching property details');
    }
  }
}