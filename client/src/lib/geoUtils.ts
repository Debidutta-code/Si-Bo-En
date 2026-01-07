import { Country, State } from "country-state-city";

export const getCountryISO = (input: string): string | null => {
  if (!input) return null;


  const country = Country.getAllCountries().find(
    (c) =>
      c.isoCode.toLowerCase() === input.toLowerCase()
  );
  // console.log(country)
  return country?.name || null;
};

export const getStateISO = (input: string, countryISO: string): string | null => {
  if (!input || !countryISO) return null;


  const state = State.getStatesOfCountry(countryISO).find(
    (s) =>
      s.isoCode.toLowerCase() === input.toLowerCase()
  );
  // console.log(state)
  return state?.name || null;
};