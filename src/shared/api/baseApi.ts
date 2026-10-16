import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// `Request` needs an absolute URL outside the browser (tests).
const baseUrl = typeof window === 'undefined' ? '/api' : `${window.location.origin}/api`;

/** The single RTK Query API; endpoints are added with `baseApi.injectEndpoints`. */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: () => ({}),
});
