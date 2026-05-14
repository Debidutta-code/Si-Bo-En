import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyCategory Translation
// Translatable: categoryName, categoryDescription
// ─────────────────────────────────────────────────────────────────────────────

export interface IMasterPropertyCategoryLocaleBlock {
  categoryName:        string;
  categoryDescription: string;
}

export interface IMasterPropertyCategoryTranslation extends Document {
  masterPropertyCategoryId: string;
  translations: Map<string, IMasterPropertyCategoryLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterPropertyCategoryTranslationModel extends Model<IMasterPropertyCategoryTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterPropertyCategoryLocaleBlock>>>): Promise<IMasterPropertyCategoryTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterPropertyCategoryLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterPropertyCategoryLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterPropertyCategoryTranslation | null>;
}

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

const masterPropertyCategoryLocaleBlockSchema = new Schema<IMasterPropertyCategoryLocaleBlock>(
  {
    categoryName:        { type: String, default: '' },
    categoryDescription: { type: String, default: '' },
  },
  { _id: false }
);

const masterPropertyCategoryTranslationSchema = new Schema<IMasterPropertyCategoryTranslation, IMasterPropertyCategoryTranslationModel>(
  {
    masterPropertyCategoryId: { type: String, required: [true, 'masterPropertyCategoryId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: masterPropertyCategoryLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterPropertyCategoryLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterPropertyCategoryTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterPropertyCategoryLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ masterPropertyCategoryId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for masterPropertyCategoryId: ${id}`);
  return doc;
};
masterPropertyCategoryTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterPropertyCategoryId: id }).lean<IMasterPropertyCategoryTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, IMasterPropertyCategoryLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
masterPropertyCategoryTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterPropertyCategoryId: id }).lean<IMasterPropertyCategoryTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, IMasterPropertyCategoryLocaleBlock>);
};
masterPropertyCategoryTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ masterPropertyCategoryId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const MasterPropertyCategoryTranslation = mongoose.model<IMasterPropertyCategoryTranslation, IMasterPropertyCategoryTranslationModel>(
  'MasterPropertyCategoryTranslation',
  masterPropertyCategoryTranslationSchema
);

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyType Translation
// Translatable: propertyTypeName, propertyTypeDescription
// ─────────────────────────────────────────────────────────────────────────────

export interface IMasterPropertyTypeLocaleBlock {
  propertyTypeName:        string;
  propertyTypeDescription: string;
}

export interface IMasterPropertyTypeTranslation extends Document {
  masterPropertyTypeId: string;
  translations: Map<string, IMasterPropertyTypeLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterPropertyTypeTranslationModel extends Model<IMasterPropertyTypeTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterPropertyTypeLocaleBlock>>>): Promise<IMasterPropertyTypeTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterPropertyTypeLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterPropertyTypeLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterPropertyTypeTranslation | null>;
}

const masterPropertyTypeLocaleBlockSchema = new Schema<IMasterPropertyTypeLocaleBlock>(
  {
    propertyTypeName:        { type: String, default: '' },
    propertyTypeDescription: { type: String, default: '' },
  },
  { _id: false }
);

const masterPropertyTypeTranslationSchema = new Schema<IMasterPropertyTypeTranslation, IMasterPropertyTypeTranslationModel>(
  {
    masterPropertyTypeId: { type: String, required: [true, 'masterPropertyTypeId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: masterPropertyTypeLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterPropertyTypeLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterPropertyTypeTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterPropertyTypeLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ masterPropertyTypeId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for masterPropertyTypeId: ${id}`);
  return doc;
};
masterPropertyTypeTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterPropertyTypeId: id }).lean<IMasterPropertyTypeTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, IMasterPropertyTypeLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
masterPropertyTypeTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterPropertyTypeId: id }).lean<IMasterPropertyTypeTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, IMasterPropertyTypeLocaleBlock>);
};
masterPropertyTypeTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ masterPropertyTypeId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const MasterPropertyTypeTranslation = mongoose.model<IMasterPropertyTypeTranslation, IMasterPropertyTypeTranslationModel>(
  'MasterPropertyTypeTranslation',
  masterPropertyTypeTranslationSchema
);

// ─────────────────────────────────────────────────────────────────────────────
// MasterAmenity Translation
// Translatable: amenityName, description
// ─────────────────────────────────────────────────────────────────────────────

export interface IMasterAmenityLocaleBlock {
  amenityName: string;
  description: string;
}

export interface IMasterAmenityTranslation extends Document {
  masterAmenityId: string;
  translations: Map<string, IMasterAmenityLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterAmenityTranslationModel extends Model<IMasterAmenityTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterAmenityLocaleBlock>>>): Promise<IMasterAmenityTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterAmenityLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterAmenityLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterAmenityTranslation | null>;
}

const masterAmenityLocaleBlockSchema = new Schema<IMasterAmenityLocaleBlock>(
  {
    amenityName: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const masterAmenityTranslationSchema = new Schema<IMasterAmenityTranslation, IMasterAmenityTranslationModel>(
  {
    masterAmenityId: { type: String, required: [true, 'masterAmenityId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: masterAmenityLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterAmenityLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterAmenityTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterAmenityLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ masterAmenityId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for masterAmenityId: ${id}`);
  return doc;
};
masterAmenityTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterAmenityId: id }).lean<IMasterAmenityTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, IMasterAmenityLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
masterAmenityTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterAmenityId: id }).lean<IMasterAmenityTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, IMasterAmenityLocaleBlock>);
};
masterAmenityTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ masterAmenityId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const MasterAmenityTranslation = mongoose.model<IMasterAmenityTranslation, IMasterAmenityTranslationModel>(
  'MasterAmenityTranslation',
  masterAmenityTranslationSchema
);

// ─────────────────────────────────────────────────────────────────────────────
// MasterRoomView Translation
// Translatable: viewName
// ─────────────────────────────────────────────────────────────────────────────

export interface IMasterRoomViewLocaleBlock {
  viewName: string;
}

export interface IMasterRoomViewTranslation extends Document {
  masterRoomViewId: string;
  translations: Map<string, IMasterRoomViewLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterRoomViewTranslationModel extends Model<IMasterRoomViewTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterRoomViewLocaleBlock>>>): Promise<IMasterRoomViewTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterRoomViewLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterRoomViewLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterRoomViewTranslation | null>;
}

const masterRoomViewLocaleBlockSchema = new Schema<IMasterRoomViewLocaleBlock>(
  {
    viewName: { type: String, default: '' },
  },
  { _id: false }
);

const masterRoomViewTranslationSchema = new Schema<IMasterRoomViewTranslation, IMasterRoomViewTranslationModel>(
  {
    masterRoomViewId: { type: String, required: [true, 'masterRoomViewId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: masterRoomViewLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterRoomViewLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterRoomViewTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterRoomViewLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ masterRoomViewId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for masterRoomViewId: ${id}`);
  return doc;
};
masterRoomViewTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterRoomViewId: id }).lean<IMasterRoomViewTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, IMasterRoomViewLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
masterRoomViewTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterRoomViewId: id }).lean<IMasterRoomViewTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, IMasterRoomViewLocaleBlock>);
};
masterRoomViewTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ masterRoomViewId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const MasterRoomViewTranslation = mongoose.model<IMasterRoomViewTranslation, IMasterRoomViewTranslationModel>(
  'MasterRoomViewTranslation',
  masterRoomViewTranslationSchema
);
