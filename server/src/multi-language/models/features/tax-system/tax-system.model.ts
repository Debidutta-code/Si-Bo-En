import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// TaxRule Translation
// Translatable: name, description
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface ITaxRuleLocaleBlock {
  name:        string;
  description: string;
}

export interface ITaxRuleTranslation extends Document {
  taxRuleId: string;
  translations: Map<string, ITaxRuleLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaxRuleTranslationModel extends Model<ITaxRuleTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ITaxRuleLocaleBlock>>>): Promise<ITaxRuleTranslation>;
  getTranslated(id: string, locale?: string): Promise<ITaxRuleLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ITaxRuleLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ITaxRuleTranslation | null>;
}

const taxRuleLocaleBlockSchema = new Schema<ITaxRuleLocaleBlock>(
  {
    name:        { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const taxRuleTranslationSchema = new Schema<ITaxRuleTranslation, ITaxRuleTranslationModel>(
  {
    taxRuleId: { type: String, required: [true, 'taxRuleId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: taxRuleLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ITaxRuleLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taxRuleTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ITaxRuleLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ taxRuleId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for taxRuleId: ${id}`);
  return doc;
};
taxRuleTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ taxRuleId: id }).lean<ITaxRuleTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Record<string, ITaxRuleLocaleBlock>;

  return (
    map[locale] ??
    null
  );
};
taxRuleTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ taxRuleId: id }).lean<ITaxRuleTranslation>();
  if (!doc?.translations) return null;
    return doc.translations as unknown as Record<string, ITaxRuleLocaleBlock>;
};
taxRuleTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ taxRuleId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const TaxRuleTranslation = mongoose.model<ITaxRuleTranslation, ITaxRuleTranslationModel>(
  'TaxRuleTranslation',
  taxRuleTranslationSchema
);

// ─────────────────────────────────────────────────────────────────────────────
// TaxGroup Translation
// Translatable: name
// ─────────────────────────────────────────────────────────────────────────────

export interface ITaxGroupLocaleBlock {
  name: string;
}

export interface ITaxGroupTranslation extends Document {
  taxGroupId: string;
  translations: Map<string, ITaxGroupLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaxGroupTranslationModel extends Model<ITaxGroupTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ITaxGroupLocaleBlock>>>): Promise<ITaxGroupTranslation>;
  getTranslated(id: string, locale?: string): Promise<ITaxGroupLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ITaxGroupLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ITaxGroupTranslation | null>;
}

const taxGroupLocaleBlockSchema = new Schema<ITaxGroupLocaleBlock>(
  { name: { type: String, default: '' } },
  { _id: false }
);

const taxGroupTranslationSchema = new Schema<ITaxGroupTranslation, ITaxGroupTranslationModel>(
  {
    taxGroupId: { type: String, required: [true, 'taxGroupId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: taxGroupLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ITaxGroupLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taxGroupTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ITaxGroupLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ taxGroupId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for taxGroupId: ${id}`);
  return doc;
};
taxGroupTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ taxGroupId: id }).lean<ITaxGroupTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Record<string, ITaxGroupLocaleBlock>;

  return (
    map[locale] ??
    null
  );
};
taxGroupTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ taxGroupId: id }).lean<ITaxGroupTranslation>();
  if (!doc?.translations) return null;
    return doc.translations as unknown as Record<string, ITaxGroupLocaleBlock>;
};
taxGroupTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ taxGroupId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const TaxGroupTranslation = mongoose.model<ITaxGroupTranslation, ITaxGroupTranslationModel>(
  'TaxGroupTranslation',
  taxGroupTranslationSchema
);
