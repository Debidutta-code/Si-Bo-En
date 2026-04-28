export class RateTigerValidation {

  public static validateRoomRatePlanPull(body: any): string | null {
    const { otaHotelAvailRQ } = body;

    if (!otaHotelAvailRQ) {
      return 'Missing otaHotelAvailRQ in request body';
    }

    const { hotelCode, requestId, timeStamp } = otaHotelAvailRQ;

    if (!hotelCode || !requestId || !timeStamp) {
      return 'Missing required fields: hotelCode, requestId, timeStamp';
    }

    return null; // null means valid
  }

  public static validateInventoryPull(body: any): string | null {
    const { otaHotelAvailGetRQ } = body;

    if (!otaHotelAvailGetRQ) {
      return 'Missing otaHotelAvailGetRQ in request body';
    }

    const { hotelCode, requestId, timeStamp, hotelAvailRequest } = otaHotelAvailGetRQ;

    if (!hotelCode || !requestId || !timeStamp) {
      return 'Missing required fields: hotelCode, requestId, timeStamp';
    }

    if (
      !hotelAvailRequest ||
      !Array.isArray(hotelAvailRequest) ||
      hotelAvailRequest.length === 0
    ) {
      return 'hotelAvailRequest must be a non-empty array';
    }

    for (const item of hotelAvailRequest) {
      if (!item.start || !item.end || !item.roomTypeCode) {
        return 'Each hotelAvailRequest item must have start, end and roomTypeCode';
      }

      if (
        (item.sendAllRestrictions || item.sendLengthsOfStay) &&
        !item.ratePlanCode
      ) {
        return 'ratePlanCode is required when sendAllRestrictions or sendLengthsOfStay is true';
      }
    }

    return null;
  }

  public static validatePricePull(body: any): string | null {
    const { otaHotelRatePlanRQ } = body;

    if (!otaHotelRatePlanRQ) {
      return 'Missing otaHotelRatePlanRQ in request body';
    }

    const { hotelCode, requestId, timeStamp, ratePlans } = otaHotelRatePlanRQ;

    if (!hotelCode || !requestId || !timeStamp) {
      return 'Missing required fields: hotelCode, requestId, timeStamp';
    }

    if (!ratePlans || !Array.isArray(ratePlans) || ratePlans.length === 0) {
      return 'ratePlans must be a non-empty array';
    }

    for (const plan of ratePlans) {
      if (!plan.ratePlanCode || !plan.start || !plan.end) {
        return 'Each ratePlan must have ratePlanCode, start and end';
      }

      // Validate date format
      const startDate = new Date(plan.start);
      const endDate = new Date(plan.end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return `Invalid date format in ratePlan ${plan.ratePlanCode}`;
      }

      if (startDate > endDate) {
        return `start date cannot be after end date for ratePlan ${plan.ratePlanCode}`;
      }
    }

    return null;
  }
  // Add to validations/request.validation.ts

  public static validatePriceUpdate(body: any): string | null {
    const { rateAmountMessages } = body;

    if (!rateAmountMessages) {
      return 'Missing rateAmountMessages in request body';
    }

    const { hotelCode, requestId, timeStamp, notifType, rateAmountMessage } = rateAmountMessages;

    if (!hotelCode || !requestId || !timeStamp) {
      return 'Missing required fields: hotelCode, requestId, timeStamp';
    }

    if (notifType !== 'Delta') {
      return 'Only Delta notifType is supported';
    }

    if (
      !rateAmountMessage ||
      !Array.isArray(rateAmountMessage) ||
      rateAmountMessage.length === 0
    ) {
      return 'rateAmountMessage must be a non-empty array';
    }

    for (const message of rateAmountMessage) {
      const { statusApplicationControl, rates } = message;

      if (!statusApplicationControl) {
        return 'Each message must have statusApplicationControl';
      }

      const { start, end, invTypeCode, ratePlanCode } = statusApplicationControl;

      if (!start || !end || !invTypeCode || !ratePlanCode) {
        return 'statusApplicationControl must have start, end, invTypeCode, ratePlanCode';
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return `Invalid date format in statusApplicationControl`;
      }

      if (startDate > endDate) {
        return `start date cannot be after end date`;
      }

      if (!rates || !Array.isArray(rates) || rates.length === 0) {
        return 'Each message must have a non-empty rates array';
      }
    }

    return null;
  }
  // Add to validations/ratetiger.validation.ts

public static validateInventoryUpdate(body: any): string | null {
  const { otaHotelAvailNotifRQ } = body;

  if (!otaHotelAvailNotifRQ) {
    return 'Missing otaHotelAvailNotifRQ in request body';
  }

  const { hotelCode, requestId, timeStamp, availStatusMessages } = otaHotelAvailNotifRQ;

  if (!hotelCode || !requestId || !timeStamp) {
    return 'Missing required fields: hotelCode, requestId, timeStamp';
  }

  if (
    !availStatusMessages ||
    !Array.isArray(availStatusMessages) ||
    availStatusMessages.length === 0
  ) {
    return 'availStatusMessages must be a non-empty array';
  }

  for (const message of availStatusMessages) {
    if (!message.start || !message.end || !message.invTypeCode) {
      return 'Each availStatusMessage must have start, end and invTypeCode';
    }

    const startDate = new Date(message.start);
    const endDate = new Date(message.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid date format in availStatusMessage';
    }

    if (startDate > endDate) {
      return 'start date cannot be after end date';
    }

    // ratePlanCode mandatory if restrictions or LOS present
    if (
      (message.lengthOfStay || message.restrictionStatus) &&
      !message.ratePlanCode
    ) {
      return 'ratePlanCode is required when lengthOfStay or restrictionStatus is present';
    }
  }

  return null;
}
}