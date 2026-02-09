import { useState, useCallback } from 'react';
import {
  fetchPropertyDetailsWithRooms
} from "../pages/rooms/services"
import { FindRoomsRequest, IFetchRoomsData } from '@/pages/rooms/interfaces';



export function useFetchRooms() {
  const [data, setData] = useState<IFetchRoomsData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async (criteria: FindRoomsRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPropertyDetailsWithRooms(criteria);
      if (response.success) {
        setData(response.data);
      }
      return response;
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchRooms };
}
