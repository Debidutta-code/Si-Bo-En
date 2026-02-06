'use client';

import  { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // or 'react-router-dom'
import { InventoryTable } from './components/InventoryTable';
import { FilterBar } from './components/FilterBar';
import { DateSelector } from './components/DateSelector';
import type { InventoryDay } from './types/inventory';
import { 
  fetchInventoryAnalysisService,
  fetchRoomTypesWithRatePlansService
} from './services/inventory.service';
import type{  DayData,  RoomTypeWithRatePlans } from './interfaces/inventory.interfaces';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader/Loader';
import { fetchRatePlansService } from '../rate-plan/services';
import type { RatePlan } from '../rate-plan/interfaces';

export default function InventoryPage() {
  // Get propertyId from URL params
  const params = useParams();
  const propertyId = params?.propertyId as string;

  // View and date state
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [_hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Room types state
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithRatePlans[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
  const [roomSetupData, setRoomSetupData] = useState<Array<{
  id: string;
  roomName: string;
  roomType: string;
  totalRoom: number;
}>>([]);
  // Date range state
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null
  });

  // Inventory data state
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryData, setInventoryData] = useState<DayData[]>([]);
  const [_error, setError] = useState<string | null>(null);
  const [ratePlans, setRatePlans] = useState<Array<{ ratePlanCode: string; ratePlanName: string }>>([]);
  const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);
  const [isLoadingRatePlans, setIsLoadingRatePlans] = useState(false);

  // Hotel info from API response
  const [hotelCode, setHotelCode] = useState<string>('');
  const [_hotelName, setHotelName] = useState<string>('');

  // ============================================
  // FETCH ROOM TYPES WHEN PROPERTY ID IS AVAILABLE
  // ============================================
useEffect(() => {
  const fetchRoomTypes = async () => {
    if (!propertyId) return;

    try {
      setIsLoadingRoomTypes(true);
      setError(null);

      const response = await fetchRoomTypesWithRatePlansService(propertyId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to load room types');
      }

      // ✅ Store the complete room setup data
      setRoomSetupData(response.data || []);

      // ✅ Transform API response to match your interface
      const transformedRoomTypes: RoomTypeWithRatePlans[] = (response.data || []).map((room: any) => ({
        invTypeCode: room.roomType,
        name: room.roomName,
        ratePlans: []
      }));

      // console.log('✅ Transformed room types:', transformedRoomTypes);
      
      setRoomTypes(transformedRoomTypes);
      
      // Initialize with all room types selected
      if (transformedRoomTypes.length > 0) {
        const roomTypeCodes = transformedRoomTypes.map(rt => rt.invTypeCode);
        // console.log('✅ Setting selected room types:', roomTypeCodes);
        setSelectedRoomTypes(roomTypeCodes);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch room types:', error);
      setError(error.message || 'Failed to load room types');
      toast.error('Failed to load room types');
    } finally {
      setIsLoadingRoomTypes(false);
    }
  };

  fetchRoomTypes();
}, [propertyId]);


useEffect(() => {
    const fetchRatePlans = async () => {
      if (!propertyId) return;

      try {
        setIsLoadingRatePlans(true);
        setError(null);

        const response = await fetchRatePlansService(propertyId);

        if (!response.success) {
          throw new Error(response.message || 'Failed to load rate plans');
        }

        const transformedRatePlans = (response.data || []).map((rp: RatePlan) => ({
          ratePlanCode: rp.ratePlanCode,
          ratePlanName: rp.ratePlanName
        }));

        setRatePlans(transformedRatePlans);
        
        // Initialize with all rate plans selected
        if (transformedRatePlans.length > 0) {
          const ratePlanCodes = transformedRatePlans.map((rp: RatePlan) => rp.ratePlanCode);
          setSelectedRatePlans(ratePlanCodes);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch rate plans:', error);
        setError(error.message || 'Failed to load rate plans');
        toast.error('Failed to load rate plans');
      } finally {
        setIsLoadingRatePlans(false);
      }
    };

    fetchRatePlans();
  }, [propertyId]);
  
  const handleRatePlanChange = async (newSelectedRatePlans: string[]) => {
  setSelectedRatePlans(newSelectedRatePlans);
  
  if (!propertyId || newSelectedRatePlans.length === 0) {
    return;
  }

  try {
    setIsLoadingInventory(true);
    setError(null);

    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;

    if (dateRange.startDate && dateRange.endDate) {
      startDate = dayjs(dateRange.startDate);
      endDate = dayjs(dateRange.endDate);
    } else {
      const range = getDateRange();
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const roomTypeCode = selectedRoomTypes.length === roomTypes.length 
      ? undefined 
      : selectedRoomTypes[0];

    const response = await fetchInventoryAnalysisService(propertyId, {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      roomTypeCode
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to load inventory data');
    }

    setInventoryData(response.data?.days || []);
    setHotelCode(response.data?.hotelCode || '');
    setHotelName(response.data?.hotelName || '');
  } catch (error: any) {
    console.error('❌ Failed to fetch inventory data:', error);
    setError(error.message || 'Failed to load inventory data');
    toast.error(error.message || 'Failed to load inventory data');
  } finally {
    setIsLoadingInventory(false);
  }
};
  // ============================================
  // FETCH INVENTORY DATA
  // ============================================
  const fetchInventoryData = useCallback(async (silent: boolean = false) => {
    if (!propertyId || selectedRoomTypes.length === 0 ) {
      return;
    }

    try {
      if (!silent) {
        setIsLoadingInventory(true);
      }
      setError(null);

      // Use custom date range if provided, otherwise use view-based range
      let startDate: dayjs.Dayjs;
      let endDate: dayjs.Dayjs;

      if (dateRange.startDate && dateRange.endDate) {
        startDate = dayjs(dateRange.startDate);
        endDate = dayjs(dateRange.endDate);
      } else {
        const range = getDateRange();
        startDate = range.startDate;
        endDate = range.endDate;
      }

      // If all room types selected, don't send roomTypeCode (means "all")
      const roomTypeCode = selectedRoomTypes.length === roomTypes.length 
        ? undefined 
        : selectedRoomTypes[0]; // Send first selected room type

      const response = await fetchInventoryAnalysisService(propertyId, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        roomTypeCode
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load inventory data');
      }

      // Extract data from response
      setInventoryData(response.data?.days || []);
      setHotelCode(response.data?.hotelCode || '');
      setHotelName(response.data?.hotelName || '');
      
      // console.log('✅ Inventory data fetched:', response.data?.days?.length || 0, 'days');
    } catch (error: any) {
      console.error('❌ Failed to fetch inventory data:', error);
      setError(error.message || 'Failed to load inventory data');
      toast.error(error.message || 'Failed to load inventory data');
    } finally {
      if (!silent) {
        setIsLoadingInventory(false);
      }
    }
  }, [propertyId, dateRange, selectedRoomTypes, roomTypes.length, currentView, currentDate]);

  useEffect(() => {
    if (roomTypes.length > 0 && selectedRoomTypes.length > 0) {
      fetchInventoryData(false);
    }
  }, [roomTypes.length]);
  
  useEffect(() => {
    if (propertyId && selectedRoomTypes.length > 0 && roomTypes.length > 0) {
      fetchInventoryData(false);
    }
  }, [currentView, currentDate]);

  // ============================================
  // DATE RANGE CALCULATION (view-based)
  // ============================================
  const getDateRange = () => {
    let startDate = currentDate;
    let endDate = currentDate;

    switch (currentView) {
      case "day":
        endDate = currentDate.add(1, "day");
        break;
      case "week":
        endDate = currentDate.add(7, "day");
        break;
      case "month":
        endDate = currentDate.add(1, "month");
        break;
      case "year":
        endDate = currentDate.add(1, "year");
        break;
    }

    return { startDate, endDate };
  };

  // ============================================
  // HANDLER: Room Type Change
  // ============================================
  const handleRoomTypeChange = async (newSelectedRoomTypes: string[]) => {
    // console.log('🎯 handleRoomTypeChange called with:', newSelectedRoomTypes);
    
    setSelectedRoomTypes(newSelectedRoomTypes);
    
    if (!propertyId || newSelectedRoomTypes.length === 0) {
      // console.log('⚠️ Cannot fetch: missing requirements');
      return;
    }

    try {
      setIsLoadingInventory(true);
      setError(null);

      let startDate: dayjs.Dayjs;
      let endDate: dayjs.Dayjs;

      if (dateRange.startDate && dateRange.endDate) {
        startDate = dayjs(dateRange.startDate);
        endDate = dayjs(dateRange.endDate);
      } else {
        const range = getDateRange();
        startDate = range.startDate;
        endDate = range.endDate;
      }

      const roomTypeCode = newSelectedRoomTypes.length === roomTypes.length 
        ? undefined 
        : newSelectedRoomTypes[0];

      const response = await fetchInventoryAnalysisService(propertyId, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        roomTypeCode
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load inventory data');
      }

      setInventoryData(response.data?.days || []);
      setHotelCode(response.data?.hotelCode || '');
      setHotelName(response.data?.hotelName || '');
      // console.log('✅ Inventory data fetched with new room types');
    } catch (error: any) {
      console.error('❌ Failed to fetch inventory data:', error);
      setError(error.message || 'Failed to load inventory data');
      toast.error(error.message || 'Failed to load inventory data');
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // ============================================
  // HANDLER: Date Range Apply
  // ============================================
  const handleDateRangeApply = async (newStartDate: string | null, newEndDate: string | null) => {
    // console.log('🎯 handleDateRangeApply called with:', { newStartDate, newEndDate });
    
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
    
    if (!propertyId || selectedRoomTypes.length === 0) {
      // console.log('⚠️ Cannot fetch: missing requirements');
      return;
    }

    try {
      setIsLoadingInventory(true);
      setError(null);

      let startDate: dayjs.Dayjs;
      let endDate: dayjs.Dayjs;

      if (newStartDate && newEndDate) {
        startDate = dayjs(newStartDate);
        endDate = dayjs(newEndDate);
      } else {
        const range = getDateRange();
        startDate = range.startDate;
        endDate = range.endDate;
      }

      const roomTypeCode = selectedRoomTypes.length === roomTypes.length 
        ? undefined 
        : selectedRoomTypes[0];


      const response = await fetchInventoryAnalysisService(propertyId, {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        roomTypeCode
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load inventory data');
      }

      setInventoryData(response.data?.days || []);
      setHotelCode(response.data?.hotelCode || '');
      setHotelName(response.data?.hotelName || '');
      // console.log('✅ Inventory data fetched with new dates');
    } catch (error: any) {
      console.error('❌ Failed to fetch inventory data:', error);
      setError(error.message || 'Failed to load inventory data');
      toast.error(error.message || 'Failed to load inventory data');
    } finally {
      setIsLoadingInventory(false);
    }
  };


  const handlePrevious = () => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'day': return prev.subtract(1, 'day');
        case 'week': return prev.subtract(1, 'week');
        case 'month': return prev.subtract(1, 'month');
        case 'year': return prev.subtract(1, 'year');
        default: return prev;
      }
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'day': return prev.add(1, 'day');
        case 'week': return prev.add(1, 'week');
        case 'month': return prev.add(1, 'month');
        case 'year': return prev.add(1, 'year');
        default: return prev;
      }
    });
  };


const convertToInventoryDay = (apiDay: DayData): InventoryDay => {
  return {
    date: apiDay.date,
    month: apiDay.month,
    year: apiDay.year,
    dayOfWeek: apiDay.dayOfWeek,
    fullDate: apiDay.fullDate,
    total: apiDay.total,
    sold: apiDay.sold,
    available: apiDay.available,
    
    // Map roomTypes with ALL required fields
    roomTypes: apiDay.roomTypes.map(rt => ({
      invTypeCode: rt.invTypeCode,
      roomTypeCode: rt.invTypeCode,
      roomTypeName: rt.invTypeCode,
      total: rt.available + rt.sold,
      sold: rt.sold,
      available: rt.available,
      occupancy: rt.occupancy,
      status: (rt.status === 'open' ? 'open' : 'close') as 'open' | 'close' // ✅ Type-safe conversion
    })),
    
    // Map ratePlans - convert PriceData[] to RoomTypePricing[]
    ratePlans: apiDay.ratePlans.map(rp => ({
      ratePlanCode: rp.ratePlanCode,
      ratePlanName: rp.ratePlanName,
      roomTypeCode: rp.prices[0]?.invTypeCode || '',
      price: rp.prices[0]?.baseByGuestAmts[0]?.amountBeforeTax || 0,
      minLengthOfStay: rp.minLengthOfStay,
      maxLengthOfStay: rp.maxLengthOfStay,
      cta: rp.cta,
      ctd: rp.ctd,
      
      // Convert PriceData[] to RoomTypePricing[]
      prices: rp.prices.map(price => ({
        invTypeCode: price.invTypeCode,
        currencyCode: price.currencyCode,
        sellStatus: (price.sellStatus === 'open' ? 'open' : 'close') as 'open' | 'close', // ✅ Type-safe conversion
        cta: price.cta,
        ctd: price.ctd,
        baseByGuestAmts: price.baseByGuestAmts.map(guest => ({
          amountBeforeTax: guest.amountBeforeTax,
          numberOfGuests: guest.numberOfGuests,
          _id: guest._id
        })),
        additionalGuestAmounts: price.additionalGuestAmounts.map(additional => ({
          ageQualifyingCode: additional.ageQualifyingCode,
          amount: additional.amount,
          _id: additional._id
        }))
      }))
    })),
    
    occupancyPercent: apiDay.occupancyPercent,
    restrictions: apiDay.restrictions
  };
};

  return (
    <div className="min-h-screen md:mx-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="container px-3 py-3 mx-auto sm:px-4 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Inventory Calendar</h1>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <span>Home</span>
              <span>/</span>
              <span className="text-blue-600">Inventory</span>
            </div>
          </div>

          {/* <div className="flex flex-col items-end gap-1">
            {hotelName && (
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {hotelName}
              </span>
            )}
            <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-mono">
              {hotelCode || propertyId}
            </span>
          </div> */}
        </div>
      </div>

      <div className="p-2 sm:p-4 max-w-6xl mx-auto">
        {/* Filters */}
          <FilterBar
          roomTypes={roomTypes}
          selectedRoomTypes={selectedRoomTypes}
          ratePlans={ratePlans} // ADD THIS
          selectedRatePlans={selectedRatePlans} // ADD THIS
          dateRange={dateRange}
          onRoomTypeChange={handleRoomTypeChange}
          onRatePlanChange={handleRatePlanChange} // ADD THIS
          onDateRangeApply={handleDateRangeApply}
          isLoading={isLoadingRoomTypes || isLoadingInventory || isLoadingRatePlans} // UPDATE THIS
        />

        {/* Calendar */}
        <div className="bg-white rounded shadow p-3 sm:p-4">
          <DateSelector
            currentView={currentView}
            currentDate={currentDate.format('MMMM YYYY')}
            onViewChange={setCurrentView}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          {/* {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
              {error}
            </div>
          )} */}

          {/* LOADING STATE */}
             {(isLoadingInventory || isLoadingRoomTypes) && (
            <div className="flex items-center justify-center py-12">
              <Loader 
                text={isLoadingRoomTypes ? 'Loading room types...' : 'Loading inventory data...'} 
                textStyle="text-blue-600 mt-4 text-sm font-medium"
              />
            </div>
          )}

          {/* NO ROOM TYPES SELECTED */}
          {!isLoadingInventory && 
           !isLoadingRoomTypes && 
           selectedRoomTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              <p>Please select at least one room type to view inventory</p>
            </div>
          )}

          {/* NO DATA */}
          {!isLoadingInventory && 
           !isLoadingRoomTypes && 
           selectedRoomTypes.length > 0 &&
           inventoryData.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              <p>No inventory data available for the selected filters</p>
            </div>
          )}

          {/* INVENTORY TABLE */}
          {!isLoadingInventory &&
           !isLoadingRoomTypes &&
           selectedRoomTypes.length > 0 &&
           inventoryData.length > 0 && (
            <div className="relative">
              <InventoryTable
                days={inventoryData.map(convertToInventoryDay)}
                hotelCode={hotelCode}
                propertyId={propertyId}
                roomSetupData={roomSetupData} // ✅ ADD THIS
                onMouseEnter={(index) => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
                onDataUpdate={() => fetchInventoryData(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}