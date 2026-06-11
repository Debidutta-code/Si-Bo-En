import { fetchRoomsApi } from "../apis";
import type {
  IFetchRoomsRequest,
  IFetchRoomsResponse,
} from "../types";


export const fetchRoomsService = async (
  payload: IFetchRoomsRequest
): Promise<IFetchRoomsResponse> => {
  try {
    return await fetchRoomsApi(payload);
  } catch {
    return {
      success: false,
      status: "fail",
      message: "Failed to fetch rooms.",
      data: null as any,
    };
  }
};

export interface IRoomFromParams {
  adults: number;
  children: number;
  childAges: number[];
}

export const buildRoomsArrayFallback = (
  numRooms: number,
  totalAdults: number,
  totalChildren: number
): IRoomFromParams[] => {
  const MAX_PER_ROOM = 8;
  let remainingAdults = Math.max(totalAdults - numRooms, 0);
  let remainingChildren = totalChildren;
  const result: IRoomFromParams[] = [];

  for (let i = 0; i < numRooms; i++) {
    let roomAdults = 1;
    const adultsToAdd = Math.min(remainingAdults, MAX_PER_ROOM - roomAdults);
    roomAdults += adultsToAdd;
    remainingAdults -= adultsToAdd;

    const childrenToAdd = Math.min(remainingChildren, MAX_PER_ROOM - roomAdults);
    remainingChildren -= childrenToAdd;

    result.push({
      adults: roomAdults,
      children: childrenToAdd,
      childAges: Array(childrenToAdd).fill(0),
    });
  }

  return result;
};