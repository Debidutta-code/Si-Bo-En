// import mongoose, { Schema, Document, Model } from 'mongoose';

// // ─── Interfaces ───────────────────────────────────────────────────────────────

// // Agency translatable fields: agencyName, address
// // agencyEmail, taxNo, iataCode are technical identifiers — not translatable

// export interface ILocaleBlock {
//   agencyName: string;
//   address:    string;
// }

// export interface IAgencyTranslation extends Document {
//   agencyId: string;
//   translations: Map<string, ILocaleBlock>;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IAgencyTranslationModel extends Model<IAgencyTranslation> {
//   upsert(agencyId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IAgencyTranslation>;
//   getTranslated(agencyId: string, locale?: string): Promise<ILocaleBlock | null>;
//   getAllTranslations(agencyId: string): Promise<Record<string, ILocaleBlock> | null>;
//   deleteLocale(agencyId: string, locale: string): Promise<IAgencyTranslation | null>;
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
//     agencyName: { type: String, default: '' },
//     address:    { type: String, default: '' },
//   },
//   { _id: false }
// );

// const agencyTranslationSchema = new Schema<IAgencyTranslation, IAgencyTranslationModel>(
//   {
//     agencyId: {
//       type: String,
//       required: [true, 'agencyId is required'],
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

// agencyTranslationSchema.statics.upsert = async function (
//   agencyId: string,
//   localeData: Partial<Record<string, Partial<ILocaleBlock>>>
// ): Promise<IAgencyTranslation> {
//   validateLocaleKeys(localeData);

//   const update: Record<string, Partial<ILocaleBlock>> = {};
//   for (const [locale, fields] of Object.entries(localeData)) {
//     update[`translations.${locale}`] = fields!;
//   }

//   const doc = await this.findOneAndUpdate(
//     { agencyId },
//     { $set: update },
//     { upsert: true, new: true, runValidators: true }
//   );

//   if (!doc) throw new Error(`Failed to upsert translation for agencyId: ${agencyId}`);
//   return doc;
// };

// agencyTranslationSchema.statics.getTranslated = async function (
//   agencyId: string,
//   locale: string = 'en'
// ): Promise<ILocaleBlock | null> {
//   const doc = await this.findOne({ agencyId }).lean<IAgencyTranslation>();
//   if (!doc?.translations) return null;

//   const map = doc.translations as unknown as Map<string, ILocaleBlock>;

//   return (
//     map.get(locale) ??
//     map.get('en') ??
//     map.values().next().value ??
//     null
//   );
// };

// agencyTranslationSchema.statics.getAllTranslations = async function (
//   agencyId: string
// ): Promise<Record<string, ILocaleBlock> | null> {
//   const doc = await this.findOne({ agencyId }).lean<IAgencyTranslation>();
//   if (!doc?.translations) return null;

//   return Object.fromEntries(
//     doc.translations as unknown as Map<string, ILocaleBlock>
//   );
// };

// agencyTranslationSchema.statics.deleteLocale = async function (
//   agencyId: string,
//   locale: string
// ): Promise<IAgencyTranslation | null> {
//   if (!isValidLocale(locale)) {
//     throw new Error(`Invalid locale: ${locale}. Must be 2-3 lowercase letters.`);
//   }

//   return this.findOneAndUpdate(
//     { agencyId },
//     { $unset: { [`translations.${locale}`]: '' } },
//     { new: true }
//   );
// };

// // ─── Model ────────────────────────────────────────────────────────────────────

// export const AgencyTranslation = mongoose.model<IAgencyTranslation, IAgencyTranslationModel>(
//   'AgencyTranslation',
//   agencyTranslationSchema
// );
