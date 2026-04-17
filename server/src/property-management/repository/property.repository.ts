import { prisma } from "../../config";
import type { IPropertyInfoType } from "../types/propertyModel.types";
export class PropertyDao {
  public static async createProperty(data: IPropertyInfoType) {
    try {
      const isExistedProperty = await prisma.property.findFirst({ where: { creationId: data.creationId } })
      if (isExistedProperty) {
        throw new Error("A property existed with this Creation")
      }
      const property = await prisma.property.create({
        data: {
          propertyName: data.propertyName,
          propertyEmail: data.propertyEmail,
          propertyContact: data.propertyContact,
          propertyCode: data.propertyCode,
          description: data.description,
          image: data.image || [],
          starRating: 1.0,
          isDraft: data.isDraft ?? true,
          isAvailable: data.isAvailable ?? true,
          createdById: data.createdById,
          creationId: data.creationId,

          propertyCategory: data.propertyCategory?.masterCategory?.id ? {
            create: {
              masterCategoryId: data.propertyCategory.masterCategory.id
            }
          } : undefined,

          propertyType: data.propertyType?.masterPropertyType?.id ? {
            create: {
              masterPropertyTypeId: data.propertyType.masterPropertyType.id
            }
          } : undefined,
        },
        include: {
          propertyType: {
            include: {
              masterPropertyType: true
            }
          },
          propertyCategory: {
            include: {
              masterCategory: true
            }
          },
        },
      });

      if (!property) {
        throw new Error('Failed to create property');
      }

      if (!property.propertyType) {
        throw new Error('Property type is required');
      }
      await Promise.all([
        await prisma.propertyConfigs.create({
          data: {
            propertyId: property.id,
            channelManagerIntegrationActive: false,
            pmsIntegrationActive: false,
            baseCurrency: "AED",
            commission: false,
            isB2cAvailable: true,
            isB2bAvailable: false,
            reservationResetMinutes: 570,
            selfAriActive: true,
            showVideo: true
          }
        }),
        await prisma.creation.update({
          where: { id: data.creationId },
          data: {
            name: property.propertyName,
            images: property.image
          }
        })
      ])
      return property;
    } catch (error: any) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  public static async getPropertyById(
    id: string,
    isDraft: boolean
  ) {
    try {
      const property = await prisma.property.findFirst({
        where: {
          id: id,
          isDraft: isDraft,
        },
        include: {
          propertyRooms: {
            orderBy: [{
              priority: "asc"
            },{createdAt: "asc"}],
            where: {

              isDeleted: false,

            },
            
            include: {
              roomAmenities: {
                include: {
                  amenity: {
                    select: {
                      id: true,
                      amenityName: true,
                      description: true,
                      icon: true
                    }
                  }
                }
              },
              roomVideos: true,
              RoomViews: {
                include: {
                  MasterRoomView: true
                }
              }

            }

          },
          propertyCategory: {
            include: {
              masterCategory: true,
            },
          },
          propertyType: {
            include: {
              masterPropertyType: true,
            },
          }, propertyAddress: true,
          propertyVideos: true,
          propertyEmails: true,
          propertyConfigs:true


        },
      });

      if (!property) {
        return null;
      }

      // Transform amenities data similar to the original implementation
      const transformedProperty = {
        ...property,
        propertyRoom: property.propertyRooms?.map((room: any) => {
          if (room.amenities && typeof room.amenities === 'object') {
            const selectedKeys = Object.entries(room.amenities)
              .filter(([_, isSelected]) => isSelected === true)
              .map(([key]) => key);
            room.amenities = { selectedAmenities: selectedKeys };
          }
          return room;
        }),
      };

      return transformedProperty;
    } catch (error: any) {
      throw new Error(`Failed to get property by ID: ${error?.message}`);
    }
  }

  public static async updatePropertyById(
    id: string,
    data: {
      propertyName?: string;
      propertyEmail?: string;
      propertyContact?: string;
      propertyCode?: string;
      description?: string;
      image?: string[];
      starRating?: number;
      isDraft?: boolean;
      isAvailable?: boolean;
    }
  ) {
    try {
      const updatedProperty = await Promise.all([
        prisma.property.update({
          where: { id },
          data: {
            ...(data.propertyName && { propertyName: data.propertyName }),
            ...(data.propertyEmail && { propertyEmail: data.propertyEmail }),
            ...(data.propertyContact && { propertyContact: data.propertyContact }),
            ...(data.propertyCode && { propertyCode: data.propertyCode }),
            ...(data.description && { description: data.description }),
            ...(data.image && { image: data.image }),
            ...(data.starRating !== undefined && { starRating: data.starRating }),
            ...(data.isDraft !== undefined && { isDraft: data.isDraft }),
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
          },
        }),
        prisma.creation.update({
          where: {
            propertyId: id
          },
          data: {
            name: data.propertyName,
            images: data.image
          }
        })
      ])

      return updatedProperty;
    } catch (error: any) {
      throw new Error(`Failed to update property: ${error?.message}`);
    }
  }
  public static async updatePropertyCategory(
    viewData: { propertyId: string; masterCategoryId: string }
  ): Promise<any> {
    try {
      return await prisma.propertyCategory.upsert({
        where: {
          propertyId: viewData.propertyId,
        },
        create: {
          propertyId: viewData.propertyId,
          masterCategoryId: viewData.masterCategoryId,
        },
        update: {
          masterCategoryId: viewData.masterCategoryId,
        },
      });
    } catch (error) {
      console.log("Error updating property category:", error);
      throw new Error("Failed to update property category");
    }
  }
  public static async updatePropertyType(
    viewData: { propertyId: string; masterTypeId: string }
  ): Promise<any> {
    try {
      return await prisma.propertyType.upsert({
        where: {
          propertyId: viewData.propertyId,
        },
        create: {
          propertyId: viewData.propertyId,
          masterPropertyTypeId: viewData.masterTypeId,
        },
        update: {
          masterPropertyTypeId: viewData.masterTypeId,
        },
      });
    } catch (error) {
      console.log("Error updating property category:", error);
      throw new Error("Failed to update property category");
    }
  }
  public static async deletePropertyById(id: string) {
    try {
      const deletedProperty = await prisma.property.update({
        where: { id },
        data: { isDeleted: true },
      });

      if (!deletedProperty) {
        throw new Error('Property not found');
      }

      return deletedProperty;
    } catch (error: any) {
      throw new Error(`Failed to delete property: ${error?.message}`);
    }
  }

  public static async hardDeletePropertyById(id: string): Promise<boolean> {
    try {
      const result = await prisma.property.delete({
        where: { id },
      });
      return !!result;
    } catch (error: any) {
      throw new Error(`Failed to hard delete property: ${error?.message}`);
    }
  }

  public static async getPropertyByCode(propertyCode: string) {
    try {
      const property = await prisma.property.findFirst({
        where: {
          propertyCode: propertyCode,
        },
      });
      return property;
    } catch (error: any) {
      throw new Error(`Failed to get property by code: ${error?.message}`);
    }
  }

  public static async updatePropertyStatus(
    id: string,
    availability: boolean
  ) {
    try {
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: { isAvailable: availability },
      });

      return updatedProperty;
    } catch (error: any) {
      throw new Error(`Failed to update property status: ${error?.message}`);
    }
  }
  public static async getProperty(propertyId: string) {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      return property;
    } catch (error: any) {
      throw new Error(`Failed to get property by id`);
    }
  }
  
}

export class PropertyAddressDao {
  public static async createAddress(
    propertyId: string,
    data: {
      addressLine1: string;
      addressLine2?: string;
      country: string;
      state: string;
      city: string;
      location: string;
      landmark: string;
      zipCode: string;
      latitude: number;
      longitude: number;
    }
  ) {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { propertyAddress: true },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      if (property.propertyAddress) {
        throw new Error('An address already exists for this property');
      }

      const createdAddress = await prisma.propertyAddress.create({
        data: {
          ...data,
          propertyId: propertyId,
        },
      });

      return createdAddress;
    } catch (error: any) {
      throw new Error(`Failed to create property address: ${error.message}`);
    }
  }

  public static async findByPropertyId(propertyId: string) {
    try {
      const address = await prisma.propertyAddress.findUnique({
        where: { propertyId: propertyId },
      });

      if (!address) {
        throw new Error("Property Address not found");
      }

      return address;
    } catch (error: any) {
      throw new Error(
        `Failed to find address by property ID: ${error.message}`
      );
    }
  }

  public static async updateByPropertyId(
    propertyId: string,
    data: {
      addressLine1?: string;
      addressLine2?: string;
      country?: string;
      state?: string;
      city?: string;
      location?: string;
      landmark?: string;
      zipCode?: string;
      latitude?: number;
      longitude?: number;
    }
  ) {
    try {
      const updated = await prisma.propertyAddress.update({
        where: { propertyId: propertyId },
        data: {
          ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
          ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
          ...(data.country && { country: data.country }),
          ...(data.state && { state: data.state }),
          ...(data.city && { city: data.city }),
          ...(data.location && { location: data.location }),
          ...(data.landmark && { landmark: data.landmark }),
          ...(data.zipCode && { zipCode: data.zipCode }),
          ...(data.latitude !== undefined && { latitude: data.latitude }),
          ...(data.longitude !== undefined && { longitude: data.longitude }),
        },
      });

      if (!updated) {
        throw new Error("Property Address not found");
      }

      return updated;
    } catch (error: any) {
      throw new Error(
        `Failed to update address by property ID: ${error.message}`
      );
    }
  }

  public static async deleteByPropertyId(
    propertyId: string
  ): Promise<{ deleted: boolean }> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      const deleted = await prisma.propertyAddress.delete({
        where: { propertyId: propertyId },
      });

      return { deleted: !!deleted };
    } catch (error: any) {
      throw new Error(
        `Failed to delete address by property ID: ${error.message}`
      );
    }
  }
}

export class PropertyAmenityDao {
  public static async createAmenities(
    propertyId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { propertyAmenities: true },
      });

      if (!property) {
        throw new Error('Property not found');
      }


      if (property.propertyAmenities && property.propertyAmenities.length > 0) {
        throw new Error('Amenities already exist for this property. Use update method instead.');
      }

      const selectedAmenityIds = Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([amenityId, _]) => amenityId);

      if (selectedAmenityIds.length === 0) {
        throw new Error('No amenities selected');
      }
      console.log('Selected Amenity IDs:', selectedAmenityIds);



      const amenitySelections = selectedAmenityIds.map(amenityId => ({
        propertyId: propertyId,
        amenityId: amenityId,
      }));

      const result = await prisma.propertyAmenitySelection.createMany({
        data: amenitySelections,
        skipDuplicates: true,
      });

      //console.log(`Created ${result.count} amenity selections for property ${propertyId}`);

      const createdAmenities = await prisma.propertyAmenitySelection.findMany({
        where: {
          propertyId: propertyId,
          amenityId: { in: selectedAmenityIds }
        },
        include: {
          amenity: {
            select: {
              id: true,
              amenityName: true,
              amenityType: true,
              description: true,
              icon: true
            }
          }
        }
      });

      return {
        success: true,
        count: result.count,
        amenitySelections: createdAmenities
      };

    } catch (error: any) {
      console.error('Error creating property amenities:', error);
      throw new Error(`Failed to create property amenities: ${error.message}`);
    }
  }

  private static async findByPropertyId(propertyId: string) {
    try {
      const amenities = await prisma.propertyAmenitySelection.findMany({
        where: { propertyId: propertyId },
        include: {
          amenity: true
        }
      });

      return amenities;
    } catch (error: any) {
      throw new Error(
        `Failed to find amenities by property ID: ${error.message}`
      );
    }
  }

  public static async updateByPropertyId(
    propertyId: string,
    amenities: Record<string, boolean>
  ) {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      const selectedAmenityNames = Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([amenityName, _]) => amenityName);

      await prisma.propertyAmenitySelection.deleteMany({
        where: { propertyId: propertyId }
      });
      const amenitySelections = selectedAmenityNames.map(amenityId => ({
        propertyId: propertyId,
        amenityId: amenityId,
      }));
      const result = await prisma.propertyAmenitySelection.createMany({
        data: amenitySelections,
        skipDuplicates: true,
      });

      return result;
    } catch (error: any) {
      console.error('Error updating property amenities:', error);
      throw new Error(`Failed to update amenities: ${error.message}`);
    }
  }

  public static async deleteByPropertyId(
    propertyId: string
  ): Promise<{ deleted: boolean; count: number }> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      // Check if amenities exist
      const existing = await this.findByPropertyId(propertyId);
      if (!existing || existing.length === 0) {
        throw new Error('No amenities exist for this property');
      }

      const result = await prisma.propertyAmenitySelection.deleteMany({
        where: { propertyId: propertyId },
      });

      return {
        deleted: result.count > 0,
        count: result.count
      };
    } catch (error: any) {
      throw new Error(`Failed to delete amenities: ${error.message}`);
    }
  }

  public static async existsByPropertyId(propertyId: string): Promise<boolean> {
    try {
      const count = await prisma.propertyAmenitySelection.count({
        where: { propertyId: propertyId },
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check amenities existence: ${error.message}`);
    }
  }

  public static async getActiveAmenities(
    propertyId: string
  ): Promise<{ id: string; name: string }[]> {
    try {
      const amenitySelections = await this.findByPropertyId(propertyId);
      console.log(amenitySelections);
      return amenitySelections.map(selection => ({
        id: selection.amenity.id,
        name: selection.amenity.amenityName
      }));
    } catch (error: any) {
      throw new Error(`Failed to get active amenities: ${error.message}`);
    }
  }

}

