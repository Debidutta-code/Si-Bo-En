import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  name: string;
  description: string;
}

export interface IAddonTranslation extends Document {
  addonId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddonTranslationModel extends Model<IAddonTranslation> {
  upsert(addonId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IAddonTranslation>;
  getTranslated(addonId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(addonId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(addonId: string, locale: string): Promise<IAddonTranslation | null>;
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

const addonTranslationSchema = new Schema<IAddonTranslation, IAddonTranslationModel>(
  {
    addonId: {
      type: String,
      required: [true, 'addonId is required'],
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

addonTranslationSchema.statics.upsert = async function (
  addonId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IAddonTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { addonId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for addonId: ${addonId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
addonTranslationSchema.statics.getTranslated = async function (
  addonId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ addonId }).lean<IAddonTranslation>();
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
addonTranslationSchema.statics.getAllTranslations = async function (
  addonId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ addonId }).lean<IAddonTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

// DELETE a single locale
addonTranslationSchema.statics.deleteLocale = async function (
  addonId: string,
  locale: string
): Promise<IAddonTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { addonId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const AddonTranslation = mongoose.model<IAddonTranslation, IAddonTranslationModel>(
  'AddonTranslation',
  addonTranslationSchema
);