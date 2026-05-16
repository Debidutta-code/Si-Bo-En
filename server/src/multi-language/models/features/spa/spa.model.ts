import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Spa translatable fields: name, description, location
// benefits is String[] but they are short human-readable text items → translatable as a single joined block per spec

export interface ILocaleBlock {
  name:        string;
  description: string;
  location:    string;
}

export interface ISpaTranslation extends Document {
  spaId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpaTranslationModel extends Model<ISpaTranslation> {
  upsert(spaId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<ISpaTranslation>;
  getTranslated(spaId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(spaId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(spaId: string, locale: string): Promise<ISpaTranslation | null>;
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
    location:    { type: String, default: '' },
  },
  { _id: false }
);

const spaTranslationSchema = new Schema<ISpaTranslation, ISpaTranslationModel>(
  {
    spaId: {
      type: String,
      required: [true, 'spaId is required'],
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

spaTranslationSchema.statics.upsert = async function (
  spaId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<ISpaTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { spaId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for spaId: ${spaId}`);
  return doc;
};

spaTranslationSchema.statics.getTranslated = async function (
  spaId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ spaId }).lean<ISpaTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};

spaTranslationSchema.statics.getAllTranslations = async function (
  spaId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ spaId }).lean<ISpaTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

spaTranslationSchema.statics.deleteLocale = async function (
  spaId: string,
  locale: string
): Promise<ISpaTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { spaId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const SpaTranslation = mongoose.model<ISpaTranslation, ISpaTranslationModel>(
  'SpaTranslation',
  spaTranslationSchema
);
