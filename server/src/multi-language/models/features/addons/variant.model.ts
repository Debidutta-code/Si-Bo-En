import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  name: string;
}

export interface IAddonVariantTranslation extends Document {
  addonVariantId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddonVariantTranslationModel extends Model<IAddonVariantTranslation> {
  upsert(addonVariantId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IAddonVariantTranslation>;
  getTranslated(addonVariantId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(addonVariantId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(addonVariantId: string, locale: string): Promise<IAddonVariantTranslation | null>;
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

const addonVariantTranslationSchema = new Schema<IAddonVariantTranslation, IAddonVariantTranslationModel>(
  {
    addonVariantId: {
      type: String,
      required: [true, 'addonVariantId is required'],
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

addonVariantTranslationSchema.statics.upsert = async function (
  addonVariantId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IAddonVariantTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { addonVariantId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for addonVariantId: ${addonVariantId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
addonVariantTranslationSchema.statics.getTranslated = async function (
  addonVariantId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ addonVariantId }).lean<IAddonVariantTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};

// GET ALL — every locale as a plain object
addonVariantTranslationSchema.statics.getAllTranslations = async function (
  addonVariantId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ addonVariantId }).lean<IAddonVariantTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

// DELETE a single locale
addonVariantTranslationSchema.statics.deleteLocale = async function (
  addonVariantId: string,
  locale: string
): Promise<IAddonVariantTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { addonVariantId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const AddonVariantTranslation = mongoose.model<IAddonVariantTranslation, IAddonVariantTranslationModel>(
  'AddonVariantTranslation',
  addonVariantTranslationSchema
);