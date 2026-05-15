import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// PropertyLoyaltyConfig — Translatable: propertyName
// propertyCode is a technical code — not translatable

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface ILocaleBlock {
  propertyName: string;
}

export interface IPropertyLoyaltyConfigTranslation extends Document {
  propertyLoyaltyConfigId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyLoyaltyConfigTranslationModel extends Model<IPropertyLoyaltyConfigTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPropertyLoyaltyConfigTranslation>;
  getTranslated(id: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IPropertyLoyaltyConfigTranslation | null>;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const localeBlockSchema = new Schema<ILocaleBlock>(
  { propertyName: { type: String, default: '' } },
  { _id: false }
);

const propertyLoyaltyConfigTranslationSchema = new Schema<IPropertyLoyaltyConfigTranslation, IPropertyLoyaltyConfigTranslationModel>(
  {
    propertyLoyaltyConfigId: {
      type: String,
      required: [true, 'propertyLoyaltyConfigId is required'],
      unique: true,
      index: true,
      trim: true,
    },
    translations: {
      type: Map,
      of: localeBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ILocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Static Methods ───────────────────────────────────────────────────────────

propertyLoyaltyConfigTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate(
    { propertyLoyaltyConfigId: id },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );
  if (!doc) throw new Error(`Failed to upsert translation for propertyLoyaltyConfigId: ${id}`);
  return doc;
};

propertyLoyaltyConfigTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ propertyLoyaltyConfigId: id }).lean<IPropertyLoyaltyConfigTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, ILocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};

propertyLoyaltyConfigTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ propertyLoyaltyConfigId: id }).lean<IPropertyLoyaltyConfigTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, ILocaleBlock>);
};

propertyLoyaltyConfigTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate(
    { propertyLoyaltyConfigId: id },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PropertyLoyaltyConfigTranslation = mongoose.model<IPropertyLoyaltyConfigTranslation, IPropertyLoyaltyConfigTranslationModel>(
  'PropertyLoyaltyConfigTranslation',
  propertyLoyaltyConfigTranslationSchema
);
