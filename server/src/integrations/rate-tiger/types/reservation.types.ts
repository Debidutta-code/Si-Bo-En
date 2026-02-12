// types/reservation.types.ts

// ─── REQUEST ───────────────────────────────────────────

export interface RateTigerGuestCount {
  ageQualifyingCode: string;  // "10" = Adult, "8" = Child
  count: string;
}

export interface RateTigerRoomRate {
  invCode: string;
  ratePlanCode: string;
  numberOfUnits: string;
  rates: Array<{
    effectiveDate: string;
    expireDate: string;
    currencyCode: string;
    amountBeforeTax?: string;
    amountAfterTax?: string;
  }>;
}

export interface RateTigerRoomStay {
  roomStayID: string;
  promotionCode?: string;
  mealPlanIndicator?: string;
  mealCode?: string;
  isGuestPerRoom?: string;
  guestCount: RateTigerGuestCount[];
  roomRates: RateTigerRoomRate[];
  timeSpan: { start: string; end: string };
  totalPrice: {
    amountBeforeTax?: string;
    amountAfterTax?: string;
    taxAmount?: string;
  };
  guestIDs: string[];
  comments?: Array<{ text: string; guestViewable: string }>;
  specialRequests?: Array<{ text: string; requestCode: string }>;
  memberShipInfo?: {
    programCode: string;
    accountID: string;
    bonusCode: string;
  };
}

export interface RateTigerGuest {
  guestID: string;
  profileType: string;
  personName: {
    salutation: string;
    firstName: string;
    middleName: string;
    surName: string;
  };
  telePhone: {
    phoneNo: string;
    phoneTechType: string;
    locationType: string;
  };
  email: string;
  address: {
    addressType: string;
    addressLine: string;
    city: string;
    postalCode: string;
    state: string;
    countryCode: string;
  };
}

export interface RateTigerGuarantee {
  guaranteeType: string;
  guaranteeCode?: string;
  paymentCard?: {
    cardNo: string;
    cardType: string;
    cardCode: string;
    expire: string;
    seriesCode: string;
    cardHolderName: string;
  };
}

export interface RateTigerService {
  serviceID: string;
  serviceCode: string;
  units: string;
  amountAfterTax?: string;
  amountBeforeTax?: string;
  isInclusive: string;
  effectiveDate?: string;
  serviceDescription?: string;
}

export interface RateTigerResGlobalInfo {
  hotelReservationIDs: Array<{
    resIDType: string;
    resIDValue: string;
  }>;
  despositPayment?: {
    start: string;
    end: string;
    amount: string;
    basisType: string;
    nights: string;
    dueAmount: string;
  };
  customerDetail?: {
    profileType: string;
    personName: {
      salutation: string;
      firstName: string;
      middleName: string;
      surName: string;
    };
    telePhone?: {
      phoneNo: string;
      phoneTechType: string;
      locationType: string;
    };
    email?: string;
    address: {
      addressType: string;
      addressLine: string;
      city: string;
      postalCode: string;
      state: string;
      countryCode: string;
    };
  };
  companyInfo?: {
    profileType: string;
    uniqueID: string;
    email?: string;
    address?: {
      addressType: string;
      addressLine: string;
      city: string;
      postalCode: string;
      state: string;
      countryCode: string;
    };
    telePhone?: {
      phoneNo: string;
      phoneTechType: string;
      locationType: string;
    };
    companyDetails: {
      companyCode: string;
      companyName: string;
      shortName?: string;
      travelSector?: string;
    };
  };
}

export interface RateTigerReservationRQ {
  hotelReservation: {
    hotelCode: string;
    resStatus: 'Commit' | 'Modify' | 'Cancel';
    createDateTime?: string;
    lastModifiedDateTime?: string;
    creatorID?: string;
    timeStamp: string;
    pos: {
      channelCode: string;
      channelName: string;
    };
    currency?: string;
    uniqueID: {
      type: string;
      idValue: string;
    };
    roomStays?: RateTigerRoomStay[];
    guarantee?: RateTigerGuarantee;
    guestDetails?: RateTigerGuest[];
    services?: RateTigerService[];
    resGlobalInfo: RateTigerResGlobalInfo;
  };
}

// ─── RESPONSE ──────────────────────────────────────────

export interface RateTigerReservationRS {
  hotelReservation: {
    hotelCode: string;
    timeStamp: string;
    success: string;
    error?: {
      type: string;
      errorCode: string;
    };
    uniqueID: {
      type: string;
      idValue: string;
    };
    resGlobalInfo: {
      hotelReservationIDs: Array<{
        resIDType: string;
        resIDValue: string;
      }>;
    };
  };
}