import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// TouristTax Translation
// Translatable: name
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface ITouristTaxLocaleBlock {
  name: string;
}

export interface ITouristTaxTranslation extends Document {
  touristTaxId: string;
  translations: Map<string, ITouristTaxLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITouristTaxTranslationModel extends Model<ITouristTaxTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<ITouristTaxLocaleBlock>>>): Promise<ITouristTaxTranslation>;
  getTranslated(id: string, locale?: string): Promise<ITouristTaxLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, ITouristTaxLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<ITouristTaxTranslation | null>;
}

const touristTaxLocaleBlockSchema = new Schema<ITouristTaxLocaleBlock>(
  { name: { type: String, default: '' } },
  { _id: false }
);

const touristTaxTranslationSchema = new Schema<ITouristTaxTranslation, ITouristTaxTranslationModel>(
  {
    touristTaxId: { type: String, required: [true, 'touristTaxId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: touristTaxLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, ITouristTaxLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

touristTaxTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<ITouristTaxLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ touristTaxId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for touristTaxId: ${id}`);
  return doc;
};
touristTaxTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ touristTaxId: id }).lean<ITouristTaxTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, ITouristTaxLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
touristTaxTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ touristTaxId: id }).lean<ITouristTaxTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, ITouristTaxLocaleBlock>);
};
touristTaxTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ touristTaxId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const TouristTaxTranslation = mongoose.model<ITouristTaxTranslation, ITouristTaxTranslationModel>(
  'TouristTaxTranslation',
  touristTaxTranslationSchema
);
