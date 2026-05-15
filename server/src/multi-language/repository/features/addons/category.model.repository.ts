import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  name: string;
}

export interface IAddonCategoryTranslation extends Document {
  addonCategoryId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddonCategoryTranslationModel extends Model<IAddonCategoryTranslation> {
  upsert(addonCategoryId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IAddonCategoryTranslation>;
  getTranslated(addonCategoryId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(addonCategoryId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(addonCategoryId: string, locale: string): Promise<IAddonCategoryTranslation | null>;
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

const addonCategoryTranslationSchema = new Schema<IAddonCategoryTranslation, IAddonCategoryTranslationModel>(
  {
    addonCategoryId: {
      type: String,
      required: [true, 'addonCategoryId is required'],
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

addonCategoryTranslationSchema.statics.upsert = async function (
  addonCategoryId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IAddonCategoryTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { addonCategoryId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for addonCategoryId: ${addonCategoryId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
addonCategoryTranslationSchema.statics.getTranslated = async function (
  addonCategoryId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ addonCategoryId }).lean<IAddonCategoryTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Map<string, ILocaleBlock>;

  return (
    map.get(locale) ??
    map.get('en') ??
    map.values().next().value ??
    null
  );
};

// GET ALL — every locale as a plain object
addonCategoryTranslationSchema.statics.getAllTranslations = async function (
  addonCategoryId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ addonCategoryId }).lean<IAddonCategoryTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

// DELETE a single locale
addonCategoryTranslationSchema.statics.deleteLocale = async function (
  addonCategoryId: string,
  locale: string
): Promise<IAddonCategoryTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { addonCategoryId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const AddonCategoryTranslation = mongoose.model<IAddonCategoryTranslation, IAddonCategoryTranslationModel>(
  'AddonCategoryTranslation',
  addonCategoryTranslationSchema
);