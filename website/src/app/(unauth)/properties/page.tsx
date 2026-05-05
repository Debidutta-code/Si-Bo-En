"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import SearchWidget from "@/src/components/Home/SearchWidget";
import PropertyCard from "@/src/components/PropertyPage/PropertyCard";
import { IPropertyDetails } from "./interface";
import { Search } from "lucide-react";
import { setBookingContext } from "@/src/store/bookingSlice";

const Properties = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [properties, setProperties] = useState<IPropertyDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const urlGroupId = searchParams.get("groupId");

  // Helper to build rooms array from total guests
  const buildRoomsArrayFallback = (
    numRooms: number,
    totalAdults: number,
    totalChildren: number
  ) => {
    const MAX_PER_ROOM = 8;
    let remainingAdults = totalAdults - numRooms;
    let remainingChildren = totalChildren;
    if (remainingAdults < 0) remainingAdults = 0;
    const roomsArray: any[] = [];
    for (let i = 0; i < numRooms; i++) {
      let roomAdults = 1;
      let roomChildren = 0;
      const adultSpace = MAX_PER_ROOM - roomAdults;
      const adultsToAdd = Math.min(remainingAdults, adultSpace);
      roomAdults += adultsToAdd;
      remainingAdults -= adultsToAdd;
      const childSpace = MAX_PER_ROOM - roomAdults;
      const childrenToAdd = Math.min(remainingChildren, childSpace);
      roomChildren = childrenToAdd;
      remainingChildren -= childrenToAdd;
      roomsArray.push({
        adults: roomAdults,
        children: roomChildren,
        childAges: Array(roomChildren).fill(0),
      });
    }
    return roomsArray;
  };

  // Parse URL parameters into booking context
  const getBookingDataFromParams = () => {
    const groupId = searchParams.get("groupId");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");
    const location = searchParams.get("location");
    const promocode = searchParams.get("promoCode");
    const bookingSource = searchParams.get("utm_source") || "direct";

    if (!groupId) return null;

    // Default dates: check-in today, check-out tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const defaultStartDate = today.toISOString().split("T")[0];
    const defaultEndDate = tomorrow.toISOString().split("T")[0];

    const numRooms = parseInt(rooms || "1");
    const totalAdults = parseInt(adults || "1");
    const totalChildren = parseInt(children || "0");
    const roomsArray = buildRoomsArrayFallback(numRooms, totalAdults, totalChildren);

    return {
      PropertyCode: groupId,
      startDate: checkin || defaultStartDate,
      endDate: checkout || defaultEndDate,
      guests: {
        rooms: numRooms,
        adults: totalAdults,
        children: totalChildren,
        roomsArray,
      },
      location: location || "",
      numberOfRooms: numRooms,
      promocode: promocode || "",
      isExternal: true,
      bookingSource,
    };
  };

  const fetchBrands = async (groupId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/group-search/${groupId}/brands`
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setBrands(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    }
  };

  const fetchProperties = async (groupId: string, query: any) => {
    if (!query.startDate || !query.endDate) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    // if (!query.location || query.location.trim() === "") {
    //   setError("Please enter a location (city).");
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      const body: any = {
        startDate: query.startDate,
        endDate: query.endDate,
        guests: query.guests,
      };

      const city = query?.location?.trim();
      if (city) {
        body.city = city;
      }

      const url = selectedBrandId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/group-search/brand/${selectedBrandId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/group-search/${groupId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        throw new Error(data.message || "Failed to fetch properties");
      }

      let props = data.data || [];
      // Filter out properties where propertyCode looks like a UUID (internal IDs).
      // These are not valid booking codes and would cause errors when navigating to /Rooms.
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      props = props.filter((p: any) => !uuidRegex.test(p.propertyCode || ""));

      setProperties(props);
      setHasSearched(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchStart = (payload: any) => {
    if (!urlGroupId) {
      setError("Group ID is missing from URL.");
      return;
    }
    fetchProperties(urlGroupId, payload);
  };

  // Refetch when brand changes and we have searched before
  useEffect(() => {
    if (selectedBrandId && hasSearched && urlGroupId) {
      const paramsData = getBookingDataFromParams();
      if (paramsData) {
        fetchProperties(urlGroupId, paramsData);
      }
    }
  }, [selectedBrandId]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initBookingContext = async () => {
      if (!urlGroupId) {
        setError("Group ID is required. Please provide a groupId parameter in the URL.");
        return;
      }
      setGroupId(urlGroupId);
      fetchBrands(urlGroupId);

      const paramsData = getBookingDataFromParams();

      if (paramsData) {
        dispatch(setBookingContext(paramsData));
        // Always auto-search when we have paramsData (which means we have groupId)
        await fetchProperties(urlGroupId, paramsData);
      } else {
        // Set default booking context (dates default, location empty)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const defaultContext = {
          PropertyCode: urlGroupId,
          startDate: today.toISOString().split("T")[0],
          endDate: tomorrow.toISOString().split("T")[0],
          guests: {
            rooms: 1,
            adults: 1,
            children: 0,
            roomsArray: [{ adults: 1, children: 0, childAges: [] }],
          },
          location: "",
          numberOfRooms: 1,
          promocode: "",
        };
        dispatch(setBookingContext(defaultContext));
        // wait for user to search
      }
    };

    initBookingContext();
    return () => {
      initializedRef.current = false;
    };
  }, [urlGroupId, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SearchWidget */}
      <div className=" z-40 bg-white/90 backdrop-blur shadow-sm sticky top-0">
        <SearchWidget onSearchStart={handleSearchStart} />
      </div>
      {/* Brand Dropdown */}
      {brands.length > 0 && (
        <div className="flex justify-end px-4 py-3 max-w-7xl mx-auto">
          <select
            value={selectedBrandId || ""}
            onChange={(e) => setSelectedBrandId(e.target.value || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E5C60] cursor-pointer"
          >
            <option value="">All Properties</option>
            {brands.map((brand: any) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-16 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded-lg w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              {/* <button
                onClick={() => router.back()}
                className="bg-[#0E5C60] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0a4c50] transition-colors"
              >
                Go Back
              </button> */}
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* No Results / Not Searched Yet */}
          {!loading && !error && !hasSearched && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Search for Properties
              </h2>
              <p className="text-gray-600">
                Enter your location, dates, and guest details to find available properties.
              </p>
            </div>
          )}

          {!loading && !error && hasSearched && properties.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Bookable Properties Found
              </h2>
              <p className="text-gray-600">
                There are no available properties with a valid booking code for this group.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
