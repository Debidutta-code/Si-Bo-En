import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  name: string;
}

export interface ICreationTranslation extends Document {
  creationId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreationTranslationModel extends Model<ICreationTranslation> {
  upsert(creationId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<ICreationTranslation>;
  getTranslated(creationId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(creationId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(creationId: string, locale: string): Promise<ICreationTranslation | null>;
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

const creationTranslationSchema = new Schema<ICreationTranslation, ICreationTranslationModel>(
  {
    creationId: {
      type: String,
      required: [true, 'creationId is required'],
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

creationTranslationSchema.statics.upsert = async function (
  creationId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<ICreationTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { creationId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for creationId: ${creationId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
creationTranslationSchema.statics.getTranslated = async function (
  creationId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ creationId }).lean<ICreationTranslation>();
  if (!doc?.translations) return null;

    const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );

};

// GET ALL — every locale as a plain object
creationTranslationSchema.statics.getAllTranslations = async function (
  creationId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ creationId }).lean<ICreationTranslation>();
  if (!doc?.translations) return null;

    return doc.translations as unknown as Record<string, ILocaleBlock>;
  
};

// DELETE a single locale
creationTranslationSchema.statics.deleteLocale = async function (
  creationId: string,
  locale: string
): Promise<ICreationTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { creationId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const CreationTranslation = mongoose.model<ICreationTranslation, ICreationTranslationModel>(
  'CreationTranslation',
  creationTranslationSchema
);