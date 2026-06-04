import { IPostingRhythm } from "./room.types";

 interface IAddonCategory {
  code: string;
  name: string;
}

 interface IAddonSubCategory {
  code: string;
  name: string;
}

 interface IAddonVariant {
  code: string;
  name: string;
}

export interface IAddonDetail {
  id: string;
  propertyId: string;
  categoryId: string;
  subcategoryId: string;
  variantId: string;
  ratePlanId: string | null;
  code: string;
  name: string;
  postingRhythm: IPostingRhythm;
  description: string;
  isActive: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category: IAddonCategory;
  subCategory: IAddonSubCategory;
  addonVariant: IAddonVariant;
}

export interface IAddonAvailability {
  id: string;
  addonId: string;
  date: string;
  price: number;
  currencyCode: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  addon: IAddonDetail;
}

export interface IAvailableAddonsResponse {
  success: boolean;
  message: string;
  data: IAddonAvailability[];
}