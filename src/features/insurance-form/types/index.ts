import type { IsoDate } from '@/shared/types/date';
import type { PhoneCountry } from '@/shared/utils/phone';

export type { IsoDate, PhoneCountry };
export type * from '@/shared/api/types';

export type CoverageType = 'single' | 'multi';

export type TripDetails = {
  /** One entry per country row; `null` is a row with nothing picked yet. */
  countryIds: (number | null)[];
  coverageType: CoverageType;
  startDate: IsoDate | null;
  endDate: IsoDate | null;
  activityId: number | null;
  /** E.164. */
  phone: string;
  phoneCountry: PhoneCountry;
};

export type DetailsErrors = Partial<Record<keyof TripDetails, string>>;

export type ValidTripDetails = {
  [K in Exclude<keyof TripDetails, 'countryIds'>]: NonNullable<TripDetails[K]>;
} & { countryIds: number[] };

export type QuoteRequest = Omit<ValidTripDetails, 'phone' | 'phoneCountry'>;

/** EUR per program id. */
export type Quote = Record<number, number>;

export type OrderRequest = ValidTripDetails & { programId: number };

export type Order = { orderId: string };

export type Step = 'details' | 'program' | 'done';

export type InsuranceFormState = {
  step: Step;
  details: TripDetails;
  programId: number | null;
  orderId: string | null;
  submitAttempted: boolean;
};
