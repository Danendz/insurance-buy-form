import { baseApi } from './baseApi';
import type { Activity, Country, PriceMultipliers, Program } from './types';

const dictionaryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query<Country[], void>({ query: () => 'dictionary/countries' }),
    getActivities: build.query<Activity[], void>({ query: () => 'dictionary/activities' }),
    getPrograms: build.query<Program[], void>({ query: () => 'dictionary/programs' }),
    getMultipliers: build.query<PriceMultipliers, void>({
      query: () => 'dictionary/multipliers',
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetActivitiesQuery,
  useGetProgramsQuery,
  useGetMultipliersQuery,
} = dictionaryApi;
