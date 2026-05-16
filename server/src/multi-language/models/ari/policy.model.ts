import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  policyName: string;
  description: string;
}

export interface IPolicyTranslation extends Document {
  policyId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPolicyTranslationModel extends Model<IPolicyTranslation> {
  upsert(policyId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPolicyTranslation>;
  getTranslated(policyId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(policyId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(policyId: string, locale: string): Promise<IPolicyTranslation | null>;
}


const LOCALE_REGEX = /^[a-z]{2,3}$/;

const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);

const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) {
    throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
  }
};


const localeBlockSchema = new Schema<ILocaleBlock>(
  {
    policyName:  { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const policyTranslationSchema = new Schema<IPolicyTranslation, IPolicyTranslationModel>(
  {
    policyId: {
      type: String,
      required: [true, 'policyId is required'],
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


policyTranslationSchema.statics.upsert = async function (
  policyId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IPolicyTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { policyId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for policyId: ${policyId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
policyTranslationSchema.statics.getTranslated = async function (
  policyId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ policyId }).lean<IPolicyTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;
  
    return (
      map[locale] ??
      Object.values(map)[0] ??
      null
    );
};

// GET ALL — every locale as a plain object
policyTranslationSchema.statics.getAllTranslations = async function (
  policyId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ policyId }).lean<IPolicyTranslation>();
  if (!doc?.translations) return null;

    return doc.translations as unknown as Record<string, ILocaleBlock>;
  
};

// DELETE a single locale
policyTranslationSchema.statics.deleteLocale = async function (
  policyId: string,
  locale: string
): Promise<IPolicyTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { policyId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PolicyTranslation = mongoose.model<IPolicyTranslation, IPolicyTranslationModel>(
  'PolicyTranslation',
  policyTranslationSchema
);