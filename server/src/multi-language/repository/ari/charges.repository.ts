import mongoose, { Schema, Document, Model } from 'mongoose';


export interface ILocaleBlock {
  ratePlanName: string;
  roomTypeName: string;
  restrictionNotes: string;
}

export interface IChargeTranslation extends Document {
  chargeId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChargeTranslationModel extends Model<IChargeTranslation> {
  upsert(chargeId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IChargeTranslation>;
  getTranslated(chargeId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(chargeId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(chargeId: string, locale: string): Promise<IChargeTranslation | null>;
}


const LOCALE_REGEX = /^[a-z]{2,3}$/;

const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);

const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
  const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
  if (invalid.length > 0) {
    throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
  }
};

const localeBlockSchema = new Schema<ILocaleBlock>(
  {
    ratePlanName:     { type: String, default: '' },
    roomTypeName:     { type: String, default: '' },
    restrictionNotes: { type: String, default: '' },
  },
  { _id: false }
);

const chargeTranslationSchema = new Schema<IChargeTranslation, IChargeTranslationModel>(
  {
    chargeId: {
      type: String,
      required: [true, 'chargeId is required'],
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


chargeTranslationSchema.statics.upsert = async function (
  chargeId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IChargeTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { chargeId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for chargeId: ${chargeId}`);
  return doc;
};

chargeTranslationSchema.statics.getTranslated = async function (
  chargeId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ chargeId }).lean<IChargeTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Map<string, ILocaleBlock>;

  return (
    map.get(locale) ??
    map.get('en') ??
    map.values().next().value ??
    null
  );
};

chargeTranslationSchema.statics.getAllTranslations = async function (
  chargeId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ chargeId }).lean<IChargeTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

chargeTranslationSchema.statics.deleteLocale = async function (
  chargeId: string,
  locale: string
): Promise<IChargeTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { chargeId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};


export const ChargeTranslation = mongoose.model<IChargeTranslation, IChargeTranslationModel>(
  'ChargeTranslation',
  chargeTranslationSchema
);