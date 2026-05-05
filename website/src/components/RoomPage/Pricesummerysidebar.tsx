import React from 'react';
import { X, Calendar, Users, Bed, TagIcon, Ruler, Home } from 'lucide-react';
import { currencies } from '../currencyCode/cuurency';

interface PriceSummarySidebarProps {
  bookingRoom: any;
  currentRatePlan: any;
  selectedAddons: any[];
  basePrice: number;
  totalAddonsPrice: number;
  finalPrice: any;
  bookingContext: any;
  onClose: () => void;
}

const PriceSummarySidebar: React.FC<PriceSummarySidebarProps> = ({
  bookingRoom,
  currentRatePlan,
  selectedAddons,
  basePrice,
  totalAddonsPrice,
  finalPrice,
  bookingContext,
  onClose
}) => {
  console.log(finalPrice)
const currency = currentRatePlan?.currencycode || finalPrice?.currencyCode || 'USD';
const currencySymbol = currencies.find((c) => c.code === currency)?.symbol ?? currency;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNights = () => {
    const start = new Date(bookingContext.startDate);
    const end = new Date(bookingContext.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
const roomsArray = Array.isArray(bookingContext?.guests?.rooms)
  ? bookingContext.guests.rooms
  : [{ adults: 1, children: 0 }];

const totalRooms = roomsArray.length;
const totalAdults = roomsArray.reduce((sum: number, room: any) => sum + (room.adults || 0), 0);
const totalChildren = roomsArray.reduce((sum: number, room: any) => sum + (room.children || 0), 0);



  const nights = calculateNights();

const backendBaseRatePerNight = finalPrice?.baseRatePerNight || basePrice;
const backendAdditionalGuestCharges = finalPrice?.additionalGuestCharges || 0;
const backendNumberOfNights = finalPrice?.numberOfNights || nights;
const backendTotalAmount = finalPrice?.totalAmount || (backendBaseRatePerNight * backendNumberOfNights * totalRooms + backendAdditionalGuestCharges);
const grandTotal = backendTotalAmount + totalAddonsPrice;
const taxAmount = finalPrice?.totalTaxAmount ||0;
// //console.log(taxAmount)
  return (
    <div className="bg-white  rounded-xl shadow-xl border-2 border-orange-400 sticky top-24 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Booking Summary</h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Room Details */}
        <div className="border-b pb-2">
          <div className="flex items-start gap-3 mb-2">
            {bookingRoom.images?.[0] && (
              <img 
                src={bookingRoom.images[0]} 
                alt={bookingRoom.room_name}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">{bookingRoom.room_name}</h4>
             <div className='flex items-center gap-2 mt-1'>
                 <TagIcon size={10} className="text-orange-500"/>
              <p className="text-xs text-gray-600 ">{currentRatePlan.ratePlanName || currentRatePlan.rateplancode}</p>
            </div> 
            <div className="flex mt-1 items-center gap-2 ">
              <Bed size={10} className="text-orange-500" />
              <span className='text-xs text-gray-600 '>{nights} Night{nights > 1 ? 's' : ''}</span>
            </div>
             <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
  <div className="flex items-center gap-1">
    <Users size={10} className="text-orange-500" />
    <span>
      {totalAdults} Adult{totalAdults > 1 ? 's' : ''}
      {totalChildren > 0 && `, ${totalChildren} Child${totalChildren > 1 ? 'ren' : ''}`}
    </span>
  </div>

  <div className="flex items-center gap-1">
    <Home size={10} className="text-orange-500" />
    <span>{totalRooms} Room{totalRooms > 1 ? 's' : ''}</span>
  </div>
</div>

            </div>
            
          </div>

          {/* Booking Info */}
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-orange-500" />
              <span>{formatDate(bookingContext.startDate)} - {formatDate(bookingContext.endDate)}</span>
            </div>
            
           
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">Price Details</h4>
          
          {/* Base Price */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Single Room Rate (Per night{nights > 1 ? 's' : ''})</span>
            <span className="font-semibold text-gray-900">{currencySymbol}{basePrice.toLocaleString()}</span>
          </div>

{/* Additional Guest Charges */}
{backendAdditionalGuestCharges > 0 && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-700">Additional Guest Charges</span>
    <span className="font-semibold text-gray-900">{currencySymbol}{backendAdditionalGuestCharges.toLocaleString()}</span>
  </div>
)}

{/* Total */}
<div className="border-t-2 mt-2">
    <div className="flex justify-between">
        <span className="text-base font-bold text-gray-900">Tax </span>
      <p className="text-sm font-bold text-gray-700">{currencySymbol}{taxAmount.toLocaleString()}</p>
    </div>
  <div className="flex justify-between items-center">
    <span className="text-base font-bold text-gray-900">Total Amount</span>
    <div className="text-right">
      <p className="text-2xl font-bold text-orange-600">{currencySymbol}{backendTotalAmount.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">
        {backendNumberOfNights} Night{backendNumberOfNights > 1 ? 's' : ''}, Including all charges
      </p>
    </div>
  </div>
</div>


          {/* Add-ons */}
          {selectedAddons.length > 0 && (
            <div className="border-t pt-1 space-y-2">
              <h5 className="font-semibold text-gray-900 text-sm">Add-ons</h5>
              {selectedAddons.map((addon, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">{addon.addonName}</p>
                    <p className="text-gray-500">
                      {new Date(addon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                      {' • '}Qty: {addon.quantity}
                      {' • '}{currencySymbol}{addon.price} each
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 ml-2">
                    {currencySymbol}{addon.totalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold text-orange-600 pt-2 border-t">
                <span>Total Add-ons</span>
                <span>+{currencySymbol}{totalAddonsPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t-2  mt-2">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Grand Total</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{currencySymbol}{grandTotal.toLocaleString()}</p>

                {/* {finalPrice?.breakdown?.totalAmount && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Including all charges)
                  </p>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
     
      </div>

      {/* Note */}
      <div className="border-t bg-gray-50 p-3">
        <p className="text-xs text-gray-600 text-center">
          Final price will be calculated at checkout
        </p>
      </div>
    </div>
  );
};

export default PriceSummarySidebar;