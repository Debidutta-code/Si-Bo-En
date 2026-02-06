import React, { useState } from 'react';
import { Bed, Calendar, ChevronDown, X } from 'lucide-react';

interface RoomTypeFilter {
  invTypeCode: string;
}

interface FilterBarProps {
  roomTypes: RoomTypeFilter[];
  selectedRoomTypes: string[];
  ratePlans: Array<{ ratePlanCode: string; ratePlanName: string }>; // ADD THIS
  selectedRatePlans: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  onRoomTypeChange: (selectedRoomTypes: string[]) => void;
  onRatePlanChange: (selectedRatePlans: string[]) => void;
  onDateRangeApply: (startDate: string | null, endDate: string | null) => void;
  isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  roomTypes,
  selectedRoomTypes,
  ratePlans,
  selectedRatePlans,
  dateRange,
  onRoomTypeChange,
  onRatePlanChange,
  onDateRangeApply,
  isLoading = false
}) => {
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [showRatePlanDropdown, setShowRatePlanDropdown] = useState(false); // ADD THIS
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  
  // Local state for room types before applying
  const [tempSelectedRoomTypes, setTempSelectedRoomTypes] = useState<string[]>(selectedRoomTypes);
  const [tempSelectedRatePlans, setTempSelectedRatePlans] = useState<string[]>(selectedRatePlans); // ADD THIS

  // Local state for date inputs before applying
  const [tempStartDate, setTempStartDate] = useState(dateRange.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(dateRange.endDate || '');

  // Sync temp room types when selectedRoomTypes changes from parent
  React.useEffect(() => {
    // console.log('🔄 Syncing temp room types with parent:', selectedRoomTypes);
    setTempSelectedRoomTypes(selectedRoomTypes);
  }, [selectedRoomTypes]);
  React.useEffect(() => {
    setTempSelectedRatePlans(selectedRatePlans);
  }, [selectedRatePlans]);
  // Sync temp dates when dateRange changes from parent
  React.useEffect(() => {
    setTempStartDate(dateRange.startDate || '');
    setTempEndDate(dateRange.endDate || '');
  }, [dateRange.startDate, dateRange.endDate]);

  // Handle "Select All" for room types
  const handleSelectAllRoomTypes = () => {
    if (tempSelectedRoomTypes.length === roomTypes.length) {
      setTempSelectedRoomTypes([]); // Deselect all
    } else {
      setTempSelectedRoomTypes(roomTypes.map(rt => rt.invTypeCode)); // Select all
    }
  };
  const handleSelectAllRatePlans = () => {
    if (tempSelectedRatePlans.length === ratePlans.length) {
      setTempSelectedRatePlans([]);
    } else {
      setTempSelectedRatePlans(ratePlans.map(rp => rp.ratePlanCode));
    }
  };
   const handleRatePlanToggle = (ratePlanCode: string) => {
    setTempSelectedRatePlans(prev => {
      const isSelected = prev.includes(ratePlanCode);
      if (isSelected) {
        return prev.filter(rp => rp !== ratePlanCode);
      } else {
        return [...prev, ratePlanCode];
      }
    });
  };
    const handleApplyRatePlans = () => {
    onRatePlanChange(tempSelectedRatePlans);
    setShowRatePlanDropdown(false);
  };
    const handleClearRatePlans = () => {
    const allRatePlans = ratePlans.map(rp => rp.ratePlanCode);
    setTempSelectedRatePlans(allRatePlans);
    onRatePlanChange(allRatePlans);
    setShowRatePlanDropdown(false);
  };
   const getRatePlanButtonText = () => {
    if (selectedRatePlans.length === 0) return 'No Rate Plans';
    if (selectedRatePlans.length === ratePlans.length) return 'All Rate Plans';
    return `${selectedRatePlans.length} Rate Plan${selectedRatePlans.length > 1 ? 's' : ''}`;
  };
  // Handle individual room type selection (local state only)
  const handleRoomTypeToggle = (invTypeCode: string) => {
    setTempSelectedRoomTypes(prev => {
      const isSelected = prev.includes(invTypeCode);
      
      if (isSelected) {
        const newSelection = prev.filter(rt => rt !== invTypeCode);
        // console.log('❌ Deselected:', invTypeCode, '| New selection:', newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, invTypeCode];
        // console.log('✅ Selected:', invTypeCode, '| New selection:', newSelection);
        return newSelection;
      }
    });
  };

  // Handle room type apply button
  const handleApplyRoomTypes = () => {
    onRoomTypeChange(tempSelectedRoomTypes);
    setShowRoomTypeDropdown(false);
  };

  // Handle clear room types
  const handleClearRoomTypes = () => {
    const allRoomTypes = roomTypes.map(rt => rt.invTypeCode);
    setTempSelectedRoomTypes(allRoomTypes);
    onRoomTypeChange(allRoomTypes);
    setShowRoomTypeDropdown(false);
  };

  // Handle date range apply button
  const handleApplyDateRange = () => {
    onDateRangeApply(tempStartDate || null, tempEndDate || null);
    setShowDateRangeDropdown(false);
  };

  // Handle clear date range
  const handleClearDateRange = () => {
    setTempStartDate('');
    setTempEndDate('');
    onDateRangeApply(null, null);
    setShowDateRangeDropdown(false);
  };

  // Check if all room types are selected
  const allRoomTypesSelected = tempSelectedRoomTypes.length === roomTypes.length;

  // Get display text for room type button
  const getRoomTypeButtonText = () => {
    if (selectedRoomTypes.length === 0) return 'No Room Types';
    if (selectedRoomTypes.length === roomTypes.length) return 'All Room Types';
    return `${selectedRoomTypes.length} Room Type${selectedRoomTypes.length > 1 ? 's' : ''}`;
  };
console.log("all the prop data ",{
  
  selectedRoomTypes,
  selectedRatePlans,
  dateRange,
  roomTypes,
  ratePlans,
});
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 relative z-50">
      <div className="flex flex-col gap-3">
        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row md:flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center">
          {/* Date Range Filter */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowDateRangeDropdown(!showDateRangeDropdown);
                setShowRoomTypeDropdown(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {dateRange.startDate && dateRange.endDate 
                    ? `${dateRange.startDate} to ${dateRange.endDate}`
                    : 'Select Date Range'
                  }
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showDateRangeDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Dropdown */}
            {showDateRangeDropdown && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
                  onClick={() => setShowDateRangeDropdown(false)}
                />
                
                <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-[calc(100%+0.5rem)] sm:left-0 sm:translate-x-0 sm:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-[calc(100%-2rem)] sm:w-80 max-w-md">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Date Range</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={tempStartDate}
                          onChange={(e) => setTempStartDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={tempEndDate}
                          onChange={(e) => setTempEndDate(e.target.value)}
                          min={tempStartDate || undefined}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleClearDateRange}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleApplyDateRange}
                        disabled={!tempStartDate || !tempEndDate}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Room Type Filter */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowRoomTypeDropdown(!showRoomTypeDropdown);
                setShowDateRangeDropdown(false);
              }}
              disabled={isLoading || roomTypes.length === 0}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Bed className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {getRoomTypeButtonText()}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showRoomTypeDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Room Type Dropdown */}
            {showRoomTypeDropdown && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
                  onClick={() => setShowRoomTypeDropdown(false)}
                />
                
                <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-[calc(100%+0.5rem)] sm:left-0 sm:translate-x-0 sm:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-[calc(100%-2rem)] sm:w-80 max-w-md max-h-[80vh] sm:max-h-96 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select Room Types</h3>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-3">
                    <label className="flex items-center gap-3 mb-3 pb-3 border-b cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={allRoomTypesSelected}
                        onChange={handleSelectAllRoomTypes}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">Select All</span>
                    </label>

                    <div className="space-y-2">
                      {roomTypes.map((roomType) => (
                        <label 
                          key={roomType.invTypeCode}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedRoomTypes.includes(roomType.invTypeCode)}
                            onChange={() => handleRoomTypeToggle(roomType.invTypeCode)}
                            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{roomType.invTypeCode}</div>
                            {/* <div className="text-xs text-gray-500 mt-0.5">
                              {roomType.ratePlanCodes.length} rate plan{roomType.ratePlanCodes.length !== 1 ? 's' : ''}
                            </div> */}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearRoomTypes}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleApplyRoomTypes}
                        disabled={tempSelectedRoomTypes.length === 0}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
<div className="relative flex-1">
            <button
              onClick={() => {
                setShowRatePlanDropdown(!showRatePlanDropdown);
                setShowRoomTypeDropdown(false);
                setShowDateRangeDropdown(false);
              }}
              disabled={isLoading || ratePlans.length === 0}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Bed className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {getRatePlanButtonText()}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showRatePlanDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showRatePlanDropdown && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
                  onClick={() => setShowRatePlanDropdown(false)}
                />
                
                <div className="fixed sm:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-[calc(100%+0.5rem)] sm:left-0 sm:translate-x-0 sm:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-[calc(100%-2rem)] sm:w-80 max-w-md max-h-[80vh] sm:max-h-96 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select Rate Plans</h3>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-3">
                    <label className="flex items-center gap-3 mb-3 pb-3 border-b cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={tempSelectedRatePlans.length === ratePlans.length}
                        onChange={handleSelectAllRatePlans}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">Select All</span>
                    </label>

                    <div className="space-y-2">
                      {ratePlans.map((ratePlan) => (
                        <label 
                          key={ratePlan.ratePlanCode}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedRatePlans.includes(ratePlan.ratePlanCode)}
                            onChange={() => handleRatePlanToggle(ratePlan.ratePlanCode)}
                            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{ratePlan.ratePlanName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{ratePlan.ratePlanCode}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearRatePlans}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleApplyRatePlans}
                        disabled={tempSelectedRatePlans.length === 0}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear All Filters - UPDATE THIS */}
          {(selectedRoomTypes.length < roomTypes.length || 
            selectedRatePlans.length < ratePlans.length || 
            dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={() => {
                handleClearRoomTypes();
                handleClearRatePlans();
                handleClearDateRange();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Active Filters Summary - UPDATE THIS */}
        {((selectedRoomTypes.length > 0 && selectedRoomTypes.length < roomTypes.length) ||
          (selectedRatePlans.length > 0 && selectedRatePlans.length < ratePlans.length)) && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-start">
              <span className="text-xs font-medium text-gray-500 py-1">Active filters:</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {/* Room Type Badges */}
                {selectedRoomTypes.map(roomType => (
                  <span 
                    key={roomType}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {roomType}
                    <button
                      onClick={() => {
                        const newSelection = selectedRoomTypes.filter(rt => rt !== roomType);
                        setTempSelectedRoomTypes(newSelection);
                        onRoomTypeChange(newSelection);
                      }}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {/* Rate Plan Badges - ADD THIS */}
                {selectedRatePlans.map(ratePlan => (
                  <span 
                    key={ratePlan}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                  >
                    {ratePlans.find(rp => rp.ratePlanCode === ratePlan)?.ratePlanName}
                    <button
                      onClick={() => {
                        const newSelection = selectedRatePlans.filter(rp => rp !== ratePlan);
                        setTempSelectedRatePlans(newSelection);
                        onRatePlanChange(newSelection);
                      }}
                      className="hover:bg-green-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};