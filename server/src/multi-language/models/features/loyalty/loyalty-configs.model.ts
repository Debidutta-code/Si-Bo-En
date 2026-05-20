import mongoose, { Schema, Document, Model } from 'mongoose';


const LOCALE_REGEX = /^[a-z]{2,3}$/;

const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);

const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) {
    throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
  }
};


export interface ILoyaltyConditionsLocaleBlock {
  text: string;
}

export interface ILoyaltyConditionsTranslation extends Document {
  loyaltyConditionId: string;
  translations: Map<string, ILoyaltyConditionsLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyConditionsTranslationModel extends Model<ILoyaltyConditionsTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ILoyaltyConditionsLocaleBlock>>>): Promise<ILoyaltyConditionsTranslation>;
  getTranslated(id: string, locale?: string): Promise<ILoyaltyConditionsLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ILoyaltyConditionsLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ILoyaltyConditionsTranslation | null>;
}

const loyaltyConditionsLocaleBlockSchema = new Schema<ILoyaltyConditionsLocaleBlock>(
  {
    text: { type: String, default: '' },
  },
  { _id: false }
);

const loyaltyConditionsTranslationSchema = new Schema<ILoyaltyConditionsTranslation, ILoyaltyConditionsTranslationModel>(
  {
    loyaltyConditionId: { type: String, required: true, unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: loyaltyConditionsLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ILoyaltyConditionsLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true }
);

loyaltyConditionsTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, any> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields;
  const doc = await this.findOneAndUpdate(
    { loyaltyConditionId: id },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );
  if (!doc) throw new Error(`Failed to upsert for loyaltyConditionId: ${id}`);
  return doc;
};

loyaltyConditionsTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ loyaltyConditionId: id }).lean<ILoyaltyConditionsTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILoyaltyConditionsLocaleBlock>;
  
    return (
      map[locale] ??
      null
    );
};

loyaltyConditionsTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ loyaltyConditionId: id }).lean<ILoyaltyConditionsTranslation>();
  if (!doc?.translations) return null;
  return doc.translations as unknown as Record<string, ILoyaltyConditionsLocaleBlock>;
};

loyaltyConditionsTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}`);
  return this.findOneAndUpdate(
    { loyaltyConditionId: id },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

export const LoyaltyConditionsTranslation = mongoose.model<ILoyaltyConditionsTranslation, ILoyaltyConditionsTranslationModel>(
  'LoyaltyConditionsTranslation',
  loyaltyConditionsTranslationSchema
);

// ─── Interfaces & Schemas for LoyaltySpecialCondition ─────────────────────────

export interface ILoyaltySpecialConditionLocaleBlock {
  title: string;
  subTitle: string;
}

export interface ILoyaltySpecialConditionTranslation extends Document {
  loyaltySpecialConditionId: string;
  translations: Map<string, ILoyaltySpecialConditionLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltySpecialConditionTranslationModel extends Model<ILoyaltySpecialConditionTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ILoyaltySpecialConditionLocaleBlock>>>): Promise<ILoyaltySpecialConditionTranslation>;
  getTranslated(id: string, locale?: string): Promise<ILoyaltySpecialConditionLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ILoyaltySpecialConditionLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ILoyaltySpecialConditionTranslation | null>;
}

const loyaltySpecialConditionLocaleBlockSchema = new Schema<ILoyaltySpecialConditionLocaleBlock>(
  {
    title: { type: String, default: '' },
    subTitle: { type: String, default: '' },
  },
  { _id: false }
);

const loyaltySpecialConditionTranslationSchema = new Schema<ILoyaltySpecialConditionTranslation, ILoyaltySpecialConditionTranslationModel>(
  {
    loyaltySpecialConditionId: { type: String, required: true, unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: loyaltySpecialConditionLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ILoyaltySpecialConditionLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true }
);

loyaltySpecialConditionTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, any> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields;
  const doc = await this.findOneAndUpdate(
    { loyaltySpecialConditionId: id },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );
  if (!doc) throw new Error(`Failed to upsert for loyaltySpecialConditionId: ${id}`);
  return doc;
};

loyaltySpecialConditionTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ loyaltySpecialConditionId: id }).lean<ILoyaltySpecialConditionTranslation>();
  if (!doc?.translations) return null;
    const map = doc.translations as unknown as Record<string, ILoyaltySpecialConditionLocaleBlock>;
  
    return (
      map[locale] ??
      null
    );
};

loyaltySpecialConditionTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ loyaltySpecialConditionId: id }).lean<ILoyaltySpecialConditionTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILoyaltySpecialConditionTranslation>;};

loyaltySpecialConditionTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}`);
  return this.findOneAndUpdate(
    { loyaltySpecialConditionId: id },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

export const LoyaltySpecialConditionTranslation = mongoose.model<ILoyaltySpecialConditionTranslation, ILoyaltySpecialConditionTranslationModel>(
  'LoyaltySpecialConditionTranslation',
  loyaltySpecialConditionTranslationSchema
);