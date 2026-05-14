import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// MasterIntegrations Translation
// Translatable: name
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface IMasterIntegrationLocaleBlock {
  name: string;
}

export interface IMasterIntegrationTranslation extends Document {
  masterIntegrationId: string;
  translations: Map<string, IMasterIntegrationLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterIntegrationTranslationModel extends Model<IMasterIntegrationTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterIntegrationLocaleBlock>>>): Promise<IMasterIntegrationTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterIntegrationLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterIntegrationLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterIntegrationTranslation | null>;
}

const masterIntegrationLocaleBlockSchema = new Schema<IMasterIntegrationLocaleBlock>(
  { name: { type: String, default: '' } },
  { _id: false }
);

const masterIntegrationTranslationSchema = new Schema<IMasterIntegrationTranslation, IMasterIntegrationTranslationModel>(
  {
    masterIntegrationId: { type: String, required: [true, 'masterIntegrationId is required'], unique: true, index: true, trim: true },
    translations: {
      type: Map,
      of: masterIntegrationLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterIntegrationLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterIntegrationTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterIntegrationLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate({ masterIntegrationId: id }, { $set: update }, { upsert: true, new: true, runValidators: true });
  if (!doc) throw new Error(`Failed to upsert translation for masterIntegrationId: ${id}`);
  return doc;
};
masterIntegrationTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterIntegrationId: id }).lean<IMasterIntegrationTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Map<string, IMasterIntegrationLocaleBlock>;
  return map.get(locale) ?? map.get('en') ?? map.values().next().value ?? null;
};
masterIntegrationTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterIntegrationId: id }).lean<IMasterIntegrationTranslation>();
  if (!doc?.translations) return null;
  return Object.fromEntries(doc.translations as unknown as Map<string, IMasterIntegrationLocaleBlock>);
};
masterIntegrationTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate({ masterIntegrationId: id }, { $unset: { [`translations.${locale}`]: '' } }, { new: true });
};

export const MasterIntegrationTranslation = mongoose.model<IMasterIntegrationTranslation, IMasterIntegrationTranslationModel>(
  'MasterIntegrationTranslation',
  masterIntegrationTranslationSchema
);
