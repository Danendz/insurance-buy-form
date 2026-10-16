import { baseApi } from '@/shared/api/baseApi';
import type { Program } from '@/shared/api/types';
import type { Order, OrderRequest, Quote, QuoteRequest } from '../../types';

const insuranceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTripPrograms: build.query<Program[], number[]>({
      query: (countryIds) => ({ url: 'programs', params: { countryIds: countryIds.join(',') } }),
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

export const { useGetTripProgramsQuery, useGetQuoteQuery, useCreateOrderMutation } = insuranceApi;
