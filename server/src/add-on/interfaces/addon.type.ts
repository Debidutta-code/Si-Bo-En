export type PostingRhythm = 'per_night' | 'per_stay';
export interface ICAddon {
  propertyId: string;
  categoryId: string|null;
  subcategoryId: string | null;
  variantId: string | null;
  code: string;
  name: string;
  postingRhythm: PostingRhythm;
  description: string | null;
  isActive: boolean;
  images: string[];
}
export interface IAddon extends ICAddon {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IUpdateAddon {
  name: string;
  postingRhythm: PostingRhythm;
  description: string | null;
  isActive: boolean;
  images: string[];
}