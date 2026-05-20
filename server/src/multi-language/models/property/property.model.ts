import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  propertyName: string;
  description:  string;
}

export interface IPropertyTranslation extends Document {
  propertyId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyTranslationModel extends Model<IPropertyTranslation> {
  upsert(propertyId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPropertyTranslation>;
  getTranslated(propertyId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(propertyId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(propertyId: string, locale: string): Promise<IPropertyTranslation | null>;
}

// ─── Locale Validation ────────────────────────────────────────────────────────

const LOCALE_REGEX = /^[a-z]{2,3}$/;

const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);

const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) {
    throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
  }
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const localeBlockSchema = new Schema<ILocaleBlock>(
  {
    propertyName: { type: String, default: '' },
    description:  { type: String, default: '' },
  },
  { _id: false }
);

const propertyTranslationSchema = new Schema<IPropertyTranslation, IPropertyTranslationModel>(
  {
    propertyId: {
      type: String,
      required: [true, 'propertyId is required'],
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
          for (const key of map.keys()) {
            if (!isValidLocale(key)) return false;
          }
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Static Methods ───────────────────────────────────────────────────────────

propertyTranslationSchema.statics.upsert = async function (
  propertyId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IPropertyTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { propertyId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for propertyId: ${propertyId}`);
  return doc;
};

propertyTranslationSchema.statics.getTranslated = async function (
  propertyId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ propertyId }).lean<IPropertyTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    null
  );
};

propertyTranslationSchema.statics.getAllTranslations = async function (
  propertyId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ propertyId }).lean<IPropertyTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

propertyTranslationSchema.statics.deleteLocale = async function (
  propertyId: string,
  locale: string
): Promise<IPropertyTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { propertyId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PropertyTranslation = mongoose.model<IPropertyTranslation, IPropertyTranslationModel>(
  'PropertyTranslation',
  propertyTranslationSchema
);
