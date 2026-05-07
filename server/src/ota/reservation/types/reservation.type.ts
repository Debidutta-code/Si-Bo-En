import { Prisma } from "../../../../prisma/generated/prisma/client";

export interface IUpdateReservationPayload {
  bookingStatus?: any;
  cancellationReason?: string;
  guests?: Prisma.JsonValue;
  bookingUserPhone?: string;
  bookingUserEmail?: string;
}
