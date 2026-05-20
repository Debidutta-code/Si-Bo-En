import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// SpaCategory Translation
// Translatable: name
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface ISpaCategoryLocaleBlock {
  name: string;
}

export interface ISpaCategoryTranslation extends Document {
  spaCategoryId: string;
  translations: Map<string, ISpaCategoryLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpaCategoryTranslationModel extends Model<ISpaCategoryTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ISpaCategoryLocaleBlock>>>): Promise<ISpaCategoryTranslation>;
  getTranslated(id: string, locale?: string): Promise<ISpaCategoryLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ISpaCategoryLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ISpaCategoryTranslation | null>;
}

const spaCategoryLocaleBlockSchema = new Schema<ISpaCategoryLocaleBlock>(
  { name: { type: String, default: '' } },
  { _id: false }
);

const spaCategoryTranslationSchema = new Schema<ISpaCategoryTranslation, ISpaCategoryTranslationModel>(
  {
    spaCategoryId: { type: String, required: [true, 'spaCategoryId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: spaCategoryLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ISpaCategoryLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

spaCategoryTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ISpaCategoryLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ spaCategoryId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for spaCategoryId: ${id}`);
  return doc;
};
spaCategoryTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ spaCategoryId: id }).lean<ISpaCategoryTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Record<string, ISpaCategoryLocaleBlock>;

  return (
    map[locale] ??
    null
  );
};
spaCategoryTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ spaCategoryId: id }).lean<ISpaCategoryTranslation>();
  if (!doc?.translations) return null;
    return doc.translations as unknown as Record<string, ISpaCategoryLocaleBlock>;
};
spaCategoryTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ spaCategoryId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const SpaCategoryTranslation = mongoose.model<ISpaCategoryTranslation, ISpaCategoryTranslationModel>(
  'SpaCategoryTranslation',
  spaCategoryTranslationSchema
);

// ─────────────────────────────────────────────────────────────────────────────
// SpaSubCategory Translation
// Translatable: name
// ─────────────────────────────────────────────────────────────────────────────

export interface ISpaSubCategoryLocaleBlock {
  name: string;
}

export interface ISpaSubCategoryTranslation extends Document {
  spaSubCategoryId: string;
  translations: Map<string, ISpaSubCategoryLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpaSubCategoryTranslationModel extends Model<ISpaSubCategoryTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ISpaSubCategoryLocaleBlock>>>): Promise<ISpaSubCategoryTranslation>;
  getTranslated(id: string, locale?: string): Promise<ISpaSubCategoryLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ISpaSubCategoryLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ISpaSubCategoryTranslation | null>;
}

const spaSubCategoryLocaleBlockSchema = new Schema<ISpaSubCategoryLocaleBlock>(
  { name: { type: String, default: '' } },
  { _id: false }
);

const spaSubCategoryTranslationSchema = new Schema<ISpaSubCategoryTranslation, ISpaSubCategoryTranslationModel>(
  {
    spaSubCategoryId: { type: String, required: [true, 'spaSubCategoryId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: spaSubCategoryLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ISpaSubCategoryLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

spaSubCategoryTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ISpaSubCategoryLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ spaSubCategoryId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for spaSubCategoryId: ${id}`);
  return doc;
};
spaSubCategoryTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ spaSubCategoryId: id }).lean<ISpaSubCategoryTranslation>();
  if (!doc?.translations) return null;
const map = doc.translations as unknown as Record<string, ISpaSubCategoryLocaleBlock>;

  return (
    map[locale] ??
    null
  );};
spaSubCategoryTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ spaSubCategoryId: id }).lean<ISpaSubCategoryTranslation>();
  if (!doc?.translations) return null;
     return doc.translations as unknown as Record<string, ISpaSubCategoryLocaleBlock>;
};
spaSubCategoryTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ spaSubCategoryId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const SpaSubCategoryTranslation = mongoose.model<ISpaSubCategoryTranslation, ISpaSubCategoryTranslationModel>(
  'SpaSubCategoryTranslation',
  spaSubCategoryTranslationSchema
);
