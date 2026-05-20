import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ILocaleBlock {
  roomName:    string;
  roomType:    string;
  description: string;
}

export interface IRoomTranslation extends Document {
  roomId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomTranslationModel extends Model<IRoomTranslation> {
  upsert(roomId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IRoomTranslation>;
  getTranslated(roomId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(roomId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(roomId: string, locale: string): Promise<IRoomTranslation | null>;
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
    roomName:    { type: String, default: '' },
    roomType:    { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const roomTranslationSchema = new Schema<IRoomTranslation, IRoomTranslationModel>(
  {
    roomId: {
      type: String,
      required: [true, 'roomId is required'],
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

roomTranslationSchema.statics.upsert = async function (
  roomId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IRoomTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { roomId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for roomId: ${roomId}`);
  return doc;
};

roomTranslationSchema.statics.getTranslated = async function (
  roomId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ roomId }).lean<IRoomTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Record<string, ILocaleBlock>;

  return (
    map[locale] ??
    null
  );
};

roomTranslationSchema.statics.getAllTranslations = async function (
  roomId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ roomId }).lean<IRoomTranslation>();
  if (!doc?.translations) return null;

      return doc.translations as unknown as Record<string, ILocaleBlock>;

};

roomTranslationSchema.statics.deleteLocale = async function (
  roomId: string,
  locale: string
): Promise<IRoomTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { roomId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const RoomTranslation = mongoose.model<IRoomTranslation, IRoomTranslationModel>(
  'RoomTranslation',
  roomTranslationSchema
);
