import { baseApi } from '@/shared/api/baseApi';
import type { Program } from '@/shared/api/types';
import type { Order, OrderRequest, Quote, QuoteRequest } from '../../types';

const insuranceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCountryPrograms: build.query<Program[], number>({
      query: (countryId) => `countries/${countryId}/programs`,
    }),
    // Read-only POST: as a query it is cached per trip and refetched when the trip changes.
    getQuote: build.query<Quote, QuoteRequest>({
      query: (body) => ({ url: 'quote', method: 'POST', body }),
    }),
    createOrder: build.mutation<Order, OrderRequest>({
      query: (body) => ({ url: 'orders', method: 'POST', body }),
    }),
  }),
});

export const { useGetCountryProgramsQuery, useGetQuoteQuery, useCreateOrderMutation } =
  insuranceApi;
