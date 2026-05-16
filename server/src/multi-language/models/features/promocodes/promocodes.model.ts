import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// PromoCode translatable fields: name, description
// code is a technical string — not translatable

export interface ILocaleBlock {
  name:        string;
  description: string;
}

export interface IPromoCodeTranslation extends Document {
  promoCodeId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromoCodeTranslationModel extends Model<IPromoCodeTranslation> {
  upsert(promoCodeId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPromoCodeTranslation>;
  getTranslated(promoCodeId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(promoCodeId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(promoCodeId: string, locale: string): Promise<IPromoCodeTranslation | null>;
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
    name:        { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const promoCodeTranslationSchema = new Schema<IPromoCodeTranslation, IPromoCodeTranslationModel>(
  {
    promoCodeId: {
      type: String,
      required: [true, 'promoCodeId is required'],
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

promoCodeTranslationSchema.statics.upsert = async function (
  promoCodeId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IPromoCodeTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { promoCodeId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for promoCodeId: ${promoCodeId}`);
  return doc;
};

promoCodeTranslationSchema.statics.getTranslated = async function (
  promoCodeId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ promoCodeId }).lean<IPromoCodeTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};

promoCodeTranslationSchema.statics.getAllTranslations = async function (
  promoCodeId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ promoCodeId }).lean<IPromoCodeTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

promoCodeTranslationSchema.statics.deleteLocale = async function (
  promoCodeId: string,
  locale: string
): Promise<IPromoCodeTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { promoCodeId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PromoCodeTranslation = mongoose.model<IPromoCodeTranslation, IPromoCodeTranslationModel>(
  'PromoCodeTranslation',
  promoCodeTranslationSchema
);
