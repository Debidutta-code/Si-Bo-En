import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Promotion translatable fields: promotionName

export interface ILocaleBlock {
  promotionName: string;
}

export interface IPromotionTranslation extends Document {
  promotionId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotionTranslationModel extends Model<IPromotionTranslation> {
  upsert(promotionId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPromotionTranslation>;
  getTranslated(promotionId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(promotionId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(promotionId: string, locale: string): Promise<IPromotionTranslation | null>;
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
    promotionName: { type: String, default: '' },
  },
  { _id: false }
);

const promotionTranslationSchema = new Schema<IPromotionTranslation, IPromotionTranslationModel>(
  {
    promotionId: {
      type: String,
      required: [true, 'promotionId is required'],
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

promotionTranslationSchema.statics.upsert = async function (
  promotionId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IPromotionTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { promotionId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for promotionId: ${promotionId}`);
  return doc;
};

promotionTranslationSchema.statics.getTranslated = async function (
  promotionId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ promotionId }).lean<IPromotionTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    null
  );
};

promotionTranslationSchema.statics.getAllTranslations = async function (
  promotionId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ promotionId }).lean<IPromotionTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

promotionTranslationSchema.statics.deleteLocale = async function (
  promotionId: string,
  locale: string
): Promise<IPromotionTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { promotionId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const PromotionTranslation = mongoose.model<IPromotionTranslation, IPromotionTranslationModel>(
  'PromotionTranslation',
  promotionTranslationSchema
);
