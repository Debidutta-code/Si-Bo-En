export interface IRatePlanLocaleBlock {
	ratePlanName?: string;
}

export type UpsertRatePlanTranslationPayload = Record<string, Partial<IRatePlanLocaleBlock>>;

export type RatePlanTranslationsResponse = Record<string, IRatePlanLocaleBlock>;

// export default;
