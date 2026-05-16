export interface ICreationLocaleBlock {
	name?: string;
}

export type UpsertCreationTranslationPayload = Record<string, Partial<ICreationLocaleBlock>>;

export type CreationTranslationsResponse = Record<string, ICreationLocaleBlock>;

// export default ICreationLocaleBlock;
