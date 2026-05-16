import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// MasterLoyaltyRegistrationFields — Translatable: fieldName

const LOCALE_REGEX = /^[a-z]{2,3}$/;
const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);
const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
};

export interface IMasterLoyaltyRegistrationFieldLocaleBlock {
  fieldName: string;
}

export interface IMasterLoyaltyRegistrationFieldTranslation extends Document {
  masterLoyaltyRegistrationFieldId: string;
  translations: Map<string, IMasterLoyaltyRegistrationFieldLocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMasterLoyaltyRegistrationFieldTranslationModel extends Model<IMasterLoyaltyRegistrationFieldTranslation> {
  upsert(id: string, localeData: Partial<Record<string, Partial<IMasterLoyaltyRegistrationFieldLocaleBlock>>>): Promise<IMasterLoyaltyRegistrationFieldTranslation>;
  getTranslated(id: string, locale?: string): Promise<IMasterLoyaltyRegistrationFieldLocaleBlock | null>;
  getAllTranslations(id: string): Promise<Record<string, IMasterLoyaltyRegistrationFieldLocaleBlock> | null>;
  deleteLocale(id: string, locale: string): Promise<IMasterLoyaltyRegistrationFieldTranslation | null>;
}

const masterLoyaltyRegistrationFieldLocaleBlockSchema = new Schema<IMasterLoyaltyRegistrationFieldLocaleBlock>(
  { fieldName: { type: String, default: '' } },
  { _id: false }
);

const masterLoyaltyRegistrationFieldTranslationSchema = new Schema<IMasterLoyaltyRegistrationFieldTranslation, IMasterLoyaltyRegistrationFieldTranslationModel>(
  {
    masterLoyaltyRegistrationFieldId: {
      type: String,
      required: [true, 'masterLoyaltyRegistrationFieldId is required'],
      unique: true,
      index: true,
      trim: true,
    },
    translations: {
      type: Map,
      of: masterLoyaltyRegistrationFieldLocaleBlockSchema,
      default: {},
      validate: {
        validator(map: Map<string, IMasterLoyaltyRegistrationFieldLocaleBlock>) {
          for (const key of map.keys()) if (!isValidLocale(key)) return false;
          return true;
        },
        message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

masterLoyaltyRegistrationFieldTranslationSchema.statics.upsert = async function (id, localeData) {
  validateLocaleKeys(localeData);
  const update: Record<string, Partial<IMasterLoyaltyRegistrationFieldLocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) update[`translations.${locale}`] = fields!;
  const doc = await this.findOneAndUpdate(
    { masterLoyaltyRegistrationFieldId: id },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );
  if (!doc) throw new Error(`Failed to upsert translation for masterLoyaltyRegistrationFieldId: ${id}`);
  return doc;
};
masterLoyaltyRegistrationFieldTranslationSchema.statics.getTranslated = async function (id, locale = 'en') {
  const doc = await this.findOne({ masterLoyaltyRegistrationFieldId: id }).lean<IMasterLoyaltyRegistrationFieldTranslation>();
  if (!doc?.translations) return null;
  const map = doc.translations as unknown as Record<string, IMasterLoyaltyRegistrationFieldLocaleBlock>;

  return (
    map[locale] ??
    Object.values(map)[0] ??
    null
  );
};
masterLoyaltyRegistrationFieldTranslationSchema.statics.getAllTranslations = async function (id) {
  const doc = await this.findOne({ masterLoyaltyRegistrationFieldId: id }).lean<IMasterLoyaltyRegistrationFieldTranslation>();
  if (!doc?.translations) return null;
  return doc.translations as unknown as Record<string, IMasterLoyaltyRegistrationFieldLocaleBlock>;
};
masterLoyaltyRegistrationFieldTranslationSchema.statics.deleteLocale = async function (id, locale) {
  if (!isValidLocale(locale)) throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  return this.findOneAndUpdate(
    { masterLoyaltyRegistrationFieldId: id },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

export const MasterLoyaltyRegistrationFieldTranslation = mongoose.model<
  IMasterLoyaltyRegistrationFieldTranslation,
  IMasterLoyaltyRegistrationFieldTranslationModel
>(
  'MasterLoyaltyRegistrationFieldTranslation',
  masterLoyaltyRegistrationFieldTranslationSchema
);
