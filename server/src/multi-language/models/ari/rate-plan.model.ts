import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  ratePlanName: string;
}

export interface IRatePlanTranslation extends Document {
  ratePlanId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRatePlanTranslationModel extends Model<IRatePlanTranslation> {
  upsert(ratePlanId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IRatePlanTranslation>;
  getTranslated(ratePlanId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(ratePlanId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(ratePlanId: string, locale: string): Promise<IRatePlanTranslation | null>;
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
    ratePlanName: { type: String, default: '' },
  },
  { _id: false }
);

const ratePlanTranslationSchema = new Schema<IRatePlanTranslation, IRatePlanTranslationModel>(
  {
    ratePlanId: {
      type: String,
      required: [true, 'ratePlanId is required'],
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

ratePlanTranslationSchema.statics.upsert = async function (
  ratePlanId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IRatePlanTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { ratePlanId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for ratePlanId: ${ratePlanId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
ratePlanTranslationSchema.statics.getTranslated = async function (
  ratePlanId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ ratePlanId }).lean<IRatePlanTranslation>();
  if (!doc?.translations) return null;

  // After .lean(), translations is a plain object, not a Map
  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};

// GET ALL — every locale as a plain object
ratePlanTranslationSchema.statics.getAllTranslations = async function (
  ratePlanId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ ratePlanId }).lean<IRatePlanTranslation>();
  if (!doc?.translations) return null;

  // Already a plain object after .lean() — no conversion needed
  return doc.translations as unknown as Record<string, ILocaleBlock>;
};

// DELETE a single locale
ratePlanTranslationSchema.statics.deleteLocale = async function (
  ratePlanId: string,
  locale: string
): Promise<IRatePlanTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { ratePlanId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const RatePlanTranslation = mongoose.model<IRatePlanTranslation, IRatePlanTranslationModel>(
  'RatePlanTranslation',
  ratePlanTranslationSchema
);