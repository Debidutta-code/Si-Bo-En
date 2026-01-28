import moment from "moment-timezone";

/**
 * Returns all IANA timezones
 */
export const getAllTimezones = () => {
  return moment.tz.names();
};


export const formatTimezoneLabel = (tz: string) => {
  return tz.replace("_", " ").replace("/", " / ");
};
