// ─────────────────────────────────────────────────────────────────────────────
// Room Translation
// ─────────────────────────────────────────────────────────────────────────────
export interface IRoomLocaleBlock {
  roomName?: string;
  roomType?: string;
  description?: string;
}
export type UpsertRoomTranslationPayload = Record<string, Partial<IRoomLocaleBlock>>;
