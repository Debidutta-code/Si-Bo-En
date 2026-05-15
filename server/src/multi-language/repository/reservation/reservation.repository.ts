import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

// Translatable fields from Reservation:
//   hotelName, ratePlanName, roomName, cancellationReason

export interface ILocaleBlock {
  hotelName:          string;
  ratePlanName:       string;
  roomName:           string;
  cancellationReason: string;
}

export interface IReservationTranslation extends Document {
  reservationId: string;
  translations: Map<string, ILocaleBlock>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationTranslationModel extends Model<IReservationTranslation> {
  upsert(reservationId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IReservationTranslation>;
  getTranslated(reservationId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(reservationId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(reservationId: string, locale: string): Promise<IReservationTranslation | null>;
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
    hotelName:          { type: String, default: '' },
    ratePlanName:       { type: String, default: '' },
    roomName:           { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
  },
  { _id: false }
);

const reservationTranslationSchema = new Schema<IReservationTranslation, IReservationTranslationModel>(
  {
    reservationId: {
      type: String,
      required: [true, 'reservationId is required'],
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

reservationTranslationSchema.statics.upsert = async function (
  reservationId: string,
  localeData: Partial<Record<string, Partial<ILocaleBlock>>>
): Promise<IReservationTranslation> {
  validateLocaleKeys(localeData);

  const update: Record<string, Partial<ILocaleBlock>> = {};
  for (const [locale, fields] of Object.entries(localeData)) {
    update[`translations.${locale}`] = fields!;
  }

  const doc = await this.findOneAndUpdate(
    { reservationId },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  if (!doc) throw new Error(`Failed to upsert translation for reservationId: ${reservationId}`);
  return doc;
};

reservationTranslationSchema.statics.getTranslated = async function (
  reservationId: string,
  locale: string = 'en'
): Promise<ILocaleBlock | null> {
  const doc = await this.findOne({ reservationId }).lean<IReservationTranslation>();
  if (!doc?.translations) return null;

  const map = doc.translations as unknown as Map<string, ILocaleBlock>;

  return (
    map.get(locale) ??
    map.get('en') ??
    map.values().next().value ??
    null
  );
};

reservationTranslationSchema.statics.getAllTranslations = async function (
  reservationId: string
): Promise<Record<string, ILocaleBlock> | null> {
  const doc = await this.findOne({ reservationId }).lean<IReservationTranslation>();
  if (!doc?.translations) return null;

  return Object.fromEntries(
    doc.translations as unknown as Map<string, ILocaleBlock>
  );
};

reservationTranslationSchema.statics.deleteLocale = async function (
  reservationId: string,
  locale: string
): Promise<IReservationTranslation | null> {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
  }

  return this.findOneAndUpdate(
    { reservationId },
    { $unset: { [`translations.${locale}`]: '' } },
    { new: true }
  );
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const ReservationTranslation = mongoose.model<IReservationTranslation, IReservationTranslationModel>(
  'ReservationTranslation',
  reservationTranslationSchema
);
