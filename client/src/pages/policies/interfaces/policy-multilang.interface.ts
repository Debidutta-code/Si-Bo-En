export interface IPolicyLocaleBlock {
    policyName?: string;
    description?: string;
}

export type UpsertPolicyTranslationPayload = Record<string, Partial<IPolicyLocaleBlock>>;

export type PolicyTranslationsResponse = Record<string, IPolicyLocaleBlock>;

