import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  name: string;
}

export interface IAddonSubCategoryTranslation extends Document {
  addonSubCategoryId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddonSubCategoryTranslationModel extends Model<IAddonSubCategoryTranslation> {
  upsert(addonSubCategoryId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IAddonSubCategoryTranslation>;
  getTranslated(addonSubCategoryId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(addonSubCategoryId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(addonSubCategoryId: string, locale: string): Promise<IAddonSubCategoryTranslation | null>;
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
    name: { type: String, default: '' },
  },
  { _id: false }
);

const addonSubCategoryTranslationSchema = new Schema<IAddonSubCategoryTranslation, IAddonSubCategoryTranslationModel>(
  {
    addonSubCategoryId: {
      type: String,
      required: [true, 'addonSubCategoryId is required'],
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

addonSubCategoryTranslationSchema.statics.upsert = async function (
  addonSubCategoryId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IAddonSubCategoryTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { addonSubCategoryId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for addonSubCategoryId: ${addonSubCategoryId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
addonSubCategoryTranslationSchema.statics.getTranslated = async function (
  addonSubCategoryId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ addonSubCategoryId }).lean<IAddonSubCategoryTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};

// GET ALL — every locale as a plain object
addonSubCategoryTranslationSchema.statics.getAllTranslations = async function (
  addonSubCategoryId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ addonSubCategoryId }).lean<IAddonSubCategoryTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

// DELETE a single locale
addonSubCategoryTranslationSchema.statics.deleteLocale = async function (
  addonSubCategoryId: string,
  locale: string
): Promise<IAddonSubCategoryTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { addonSubCategoryId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const AddonSubCategoryTranslation = mongoose.model<IAddonSubCategoryTranslation, IAddonSubCategoryTranslationModel>(
  'AddonSubCategoryTranslation',
  addonSubCategoryTranslationSchema
);