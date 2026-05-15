import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  subject: string;
  description: string;
}

export interface IProblemTicketsTranslation extends Document {
  problemTicketId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblemTicketsTranslationModel extends Model<IProblemTicketsTranslation> {
  upsert(problemTicketId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IProblemTicketsTranslation>;
  getTranslated(problemTicketId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(problemTicketId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(problemTicketId: string, locale: string): Promise<IProblemTicketsTranslation | null>;
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
    subject:     { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const problemTicketsTranslationSchema = new Schema<IProblemTicketsTranslation, IProblemTicketsTranslationModel>(
  {
    problemTicketId: {
      type: String,
      required: [true, 'problemTicketId is required'],
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

problemTicketsTranslationSchema.statics.upsert = async function (
  problemTicketId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IProblemTicketsTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { problemTicketId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for problemTicketId: ${problemTicketId}`);
  return doc;
};

// GET — one locale with fallback chain: requested → 'en' → first available → null
problemTicketsTranslationSchema.statics.getTranslated = async function (
  problemTicketId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ problemTicketId }).lean<IProblemTicketsTranslation>();
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
problemTicketsTranslationSchema.statics.getAllTranslations = async function (
  problemTicketId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ problemTicketId }).lean<IProblemTicketsTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

// DELETE a single locale
problemTicketsTranslationSchema.statics.deleteLocale = async function (
  problemTicketId: string,
  locale: string
): Promise<IProblemTicketsTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { problemTicketId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const ProblemTicketsTranslation = mongoose.model<IProblemTicketsTranslation, IProblemTicketsTranslationModel>(
  'ProblemTicketsTranslation',
  problemTicketsTranslationSchema
);