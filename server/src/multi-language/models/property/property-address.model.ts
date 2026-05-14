import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  addressLine1: string;
  addressLine2: string;
  country:      string;
  state:        string;
  city:         string;
  location:     string;
  landmark:     string;
}

export interface IPropertyAddressTranslation extends Document {
  propertyAddressId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyAddressTranslationModel extends Model<IPropertyAddressTranslation> {
  upsert(propertyAddressId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPropertyAddressTranslation>;
  getTranslated(propertyAddressId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(propertyAddressId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(propertyAddressId: string, locale: string): Promise<IPropertyAddressTranslation | null>;
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
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    country:      { type: String, default: '' },
    state:        { type: String, default: '' },
    city:         { type: String, default: '' },
    location:     { type: String, default: '' },
    landmark:     { type: String, default: '' },
  },
  { _id: false }
);

const propertyAddressTranslationSchema = new Schema<IPropertyAddressTranslation, IPropertyAddressTranslationModel>(
  {
    propertyAddressId: {
      type: String,
      required: [true, 'propertyAddressId is required'],
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

propertyAddressTranslationSchema.statics.upsert = async function (
  propertyAddressId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IPropertyAddressTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { propertyAddressId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for propertyAddressId: ${propertyAddressId}`);
  return doc;
};

propertyAddressTranslationSchema.statics.getTranslated = async function (
  propertyAddressId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ propertyAddressId }).lean<IPropertyAddressTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Map<string, ILocaleBlock>;

  return (
    map.get(locale) ??
    map.get('en') ??
    map.values().next().value ??
    null
  );
};

propertyAddressTranslationSchema.statics.getAllTranslations = async function (
  propertyAddressId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ propertyAddressId }).lean<IPropertyAddressTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

propertyAddressTranslationSchema.statics.deleteLocale = async function (
  propertyAddressId: string,
  locale: string
): Promise<IPropertyAddressTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { propertyAddressId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PropertyAddressTranslation = mongoose.model<IPropertyAddressTranslation, IPropertyAddressTranslationModel>(
  'PropertyAddressTranslation',
  propertyAddressTranslationSchema
);
