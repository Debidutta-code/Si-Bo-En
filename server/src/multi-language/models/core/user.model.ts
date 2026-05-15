// import mongoose, { Schema, Document, Model } from 'mongoose';

// // ─── Interfaces ───────────────────────────────────────────────────────────────

// export interface ILocaleBlock {
//   firstName: string;
//   lastName: string;
// }

// export interface IUserTranslation extends Document {
//   userId: string;
//   translations: Map<string, ILocaleBlock>;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IUserTranslationModel extends Model<IUserTranslation> {
//   upsert(userId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IUserTranslation>;
//   getTranslated(userId: string, locale?: string): Promise<ILocaleBlock | null>;
//   getAllTranslations(userId: string): Promise<Record<string, ILocaleBlock> | null>;
//   deleteLocale(userId: string, locale: string): Promise<IUserTranslation | null>;
// }

// // ─── Locale Validation ────────────────────────────────────────────────────────

// const LOCALE_REGEX = /^[a-z]{2,3}$/;

// const isValidLocale = (locale: string): boolean => LOCALE_REGEX.test(locale);

// const validateLocaleKeys = (localeData: Record<string, unknown>): void => {
//   const invalid = Object.keys(localeData).filter((l) => !isValidLocale(l));
//   if (invalid.length > 0) {
//     throw new Error(`Invalid locale(s): ${invalid.join(', ')}. Must be 2-3 lowercase letters.`);
//   }
// };

// // ─── Schemas ──────────────────────────────────────────────────────────────────

// const localeBlockSchema = new Schema<ILocaleBlock>(
//   {
//     firstName: { type: String, default: '' },
//     lastName:  { type: String, default: '' },
//   },
//   { _id: false }
// );

// const userTranslationSchema = new Schema<IUserTranslation, IUserTranslationModel>(
//   {
//     userId: {
//       type: String,
//       required: [true, 'userId is required'],
//       unique: true,
//       index: true,
//       trim: true,
//     },
//     translations: {
//       type: Map,
//       of: localeBlockSchema,
//       default: {},
//       validate: {
//         validator(map: Map<string, ILocaleBlock>) {
//           for (const key of map.keys()) {
//             if (!isValidLocale(key)) return false;
//           }
//           return true;
//         },
//         message: 'Invalid locale key. Must be 2-3 lowercase letters (e.g. en, hi, ja)',
//       },
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ─── Static Methods ───────────────────────────────────────────────────────────

// userTranslationSchema.statics.upsert = async function (
//   userId: string,
//   localeData: Partial<Record<string, Partial<ILocaleBlock>>>
// ): Promise<IUserTranslation> {
//   validateLocaleKeys(localeData);

//   const update: Record<string, Partial<ILocaleBlock>> = {};
//   for (const [locale, fields] of Object.entries(localeData)) {
//     update[`translations.${locale}`] = fields!;
//   }

//   const doc = await this.findOneAndUpdate(
//     { userId },
//     { $set: update },
//     { upsert: true, new: true, runValidators: true }
//   );

//   if (!doc) throw new Error(`Failed to upsert translation for userId: ${userId}`);
//   return doc;
// };

// userTranslationSchema.statics.getTranslated = async function (
//   userId: string,
//   locale: string = 'en'
// ): Promise<ILocaleBlock | null> {
//   const doc = await this.findOne({ userId }).lean<IUserTranslation>();
//   if (!doc?.translations) return null;

//   const map = doc.translations as unknown as Map<string, ILocaleBlock>;

//   return (
//     map.get(locale) ??
//     map.get('en') ??
//     map.values().next().value ??
//     null
//   );
// };

// userTranslationSchema.statics.getAllTranslations = async function (
//   userId: string
// ): Promise<Record<string, ILocaleBlock> | null> {
//   const doc = await this.findOne({ userId }).lean<IUserTranslation>();
//   if (!doc?.translations) return null;

//   return Object.fromEntries(
//     doc.translations as unknown as Map<string, ILocaleBlock>
//   );
// };

// userTranslationSchema.statics.deleteLocale = async function (
//   userId: string,
//   locale: string
// ): Promise<IUserTranslation | null> {
//   if (!isValidLocale(locale)) {
//     throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
//   }

//   return this.findOneAndUpdate(
//     { userId },
//     { $unset: { [`translations.${locale}`]: '' } },
//     { new: true }
//   );
// };

// // ─── Model ────────────────────────────────────────────────────────────────────

// export const UserTranslation = mongoose.model<IUserTranslation, IUserTranslationModel>(
//   'UserTranslation',
//   userTranslationSchema
// );
