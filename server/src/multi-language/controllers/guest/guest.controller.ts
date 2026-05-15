import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  firstName: string;
  lastName:  string;
  address:   string;
  city:      string;
  state:     string;
  country:   string;
}

export interface IGuestTranslation extends Document {
  guestId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuestTranslationModel extends Model<IGuestTranslation> {
  upsert(guestId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IGuestTranslation>;
  getTranslated(guestId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(guestId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(guestId: string, locale: string): Promise<IGuestTranslation | null>;
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
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    address:   { type: String, default: '' },
    city:      { type: String, default: '' },
    state:     { type: String, default: '' },
    country:   { type: String, default: '' },
  },
  { _id: false }
);

const guestTranslationSchema = new Schema<IGuestTranslation, IGuestTranslationModel>(
  {
    guestId: {
      type: String,
      required: [true, 'guestId is required'],
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

guestTranslationSchema.statics.upsert = async function (
  guestId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IGuestTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { guestId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for guestId: ${guestId}`);
  return doc;
};

guestTranslationSchema.statics.getTranslated = async function (
  guestId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ guestId }).lean<IGuestTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Map<string, ILocaleBlock>;

  return (
    map.get(locale) ??
    map.get('en') ??
    map.values().next().value ??
    null
  );
};

guestTranslationSchema.statics.getAllTranslations = async function (
  guestId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ guestId }).lean<IGuestTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

guestTranslationSchema.statics.deleteLocale = async function (
  guestId: string,
  locale: string
): Promise<IGuestTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { guestId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const GuestTranslation = mongoose.model<IGuestTranslation, IGuestTranslationModel>(
  'GuestTranslation',
  guestTranslationSchema
);
