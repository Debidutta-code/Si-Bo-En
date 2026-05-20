export interface ICategory {
  id: string;
  categoryName: string;
  categoryDescription: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
              _translations: {
                categoryName: string,
                categoryDescription: string
            }
   
}

export interface IPropertyType {
  id: string;
  propertyTypeName: string;
  propertyTypeDescription: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _translations: {
    propertyTypeName: string,
    propertyTypeDescription: string
  }
}


export interface IAmenity {
  id: string;
  amenityName: string;
  description?: string;
  icon?: string;
  _translations: {
                amenityName: string,
                description: string
            }
        }


export interface ILoyaltyGuestField {
  id: string;
  fieldName: string;
  createdAt?: string;
  updatedAt?: string;
   _translations: {
                fieldName: string;
            }
}
export interface IPaymentIntegration {
  id: string;
  name: string;
  isActive: boolean;
  propertyPaymentIntegrations: [{
    id: string;
    propertyId: string;
    paymentIntegrationId: string;
    isActive: boolean;
    outletId: string;
  }]
}
export * from "./integration.interface";
export * from "./room-view.interface";
export * from "./spa.type";
export * from "./multilanguage.interface";


 