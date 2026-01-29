import { DateTime } from "luxon";


export const toUTC = (date: Date | string): Date => {
  return DateTime.fromJSDate(
    typeof date === "string" ? new Date(date) : date
  ).toUTC().toJSDate();
};

export const toPropertyTime = (
  utcDate: Date | string,
  propertyTimeZone: string
) => {
  return DateTime.fromJSDate(
    typeof utcDate === "string" ? new Date(utcDate) : utcDate,
    { zone: "utc" }
  ).setZone(propertyTimeZone);
};

export const nowUTC = (): Date => {
  return DateTime.utc().toJSDate();
};

export const nowInProperty = (propertyTimeZone: string) => {
  return DateTime.utc().setZone(propertyTimeZone);
};

export const getDateAndTimeInPropertyTimeZone = (
  checkInDate: string, // YYYY-MM-DD
  checkInTime: string, // HH:mm (e.g. 14:00)
  propertyTimeZone: string
) => {
  return DateTime.fromISO(
    `${checkInDate}T${checkInTime}`,
    { zone: propertyTimeZone }
  ).toUTC();
};



export const calculateNights = (
  checkInDate: string,
  checkOutDate: string
) => {
  const start = DateTime.fromISO(checkInDate);
  const end = DateTime.fromISO(checkOutDate);

  return Math.max(1, end.diff(start, "days").days);
};


export const getCancellationDeadlineUTC = (
  checkInDate: string,
  checkInTime: string,
  cancelHoursBefore: number,
  propertyTimeZone: string
) => {
  return DateTime.fromISO(
    `${checkInDate}T${checkInTime}`,
    { zone: propertyTimeZone }
  )
    .minus({ hours: cancelHoursBefore })
    .toUTC();
};




export const convertUTCToPropertyTime = (
  utcDate: string | Date | DateTime,
  propertyTimeZone: string
): DateTime => {
  if (DateTime.isDateTime(utcDate)) {
    return utcDate
      .toUTC()
      .setZone(propertyTimeZone);
  }

  return DateTime.fromJSDate(
    typeof utcDate === "string" ? new Date(utcDate) : utcDate,
    { zone: "utc" }
  ).setZone(propertyTimeZone);
};
