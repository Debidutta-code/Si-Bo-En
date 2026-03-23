// import csc, { type ICountry, type IState } from "countries-states-cities";

// export const getCountryISO = (input: string): string | null => {
//   if (!input) return null;

//   const code = input.trim().toLowerCase();

//   // Accept either "US" style codes or full country names.
//   const country: ICountry | undefined = csc
//     .getAllCountries()
//     .find((c) => c.iso2.toLowerCase() === code || c.name.toLowerCase() === code);

//   // Returns normalized country name for the server.
//   return country?.name || null;
// };

// export const getStateISO = (input: string, countryISO: string): string | null => {
//   if (!input || !countryISO) return null;

//   const country = csc.getCountryByCode(countryISO);
//   if (!country) return null;

//   const needle = input.trim().toLowerCase();
//   const state: IState | undefined = csc
//     .getStatesOfCountry(country.id)
//     .find(
//       (s) =>
//         s.state_code.toLowerCase() === needle || s.name.toLowerCase() === needle,
//     );

//   // Returns normalized state name for the server.
//   return state?.name || null;
// };