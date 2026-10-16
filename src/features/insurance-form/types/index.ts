import type { IsoDate } from '@/shared/types/date';

export type { IsoDate };
export type * from '@/shared/api/types';

export type CoverageType = 'single' | 'multi';

export type TripDetails = {
  countryId: number | null;
  coverageType: CoverageType;
  startDate: IsoDate | null;
  endDate: IsoDate | null;
  activityId: number | null;
  /** E.164. */
  phone: string;
};

export type DetailsErrors = Partial<Record<keyof TripDetails, string>>;

export type ValidTripDetails = {
  [K in keyof TripDetails]: NonNullable<TripDetails[K]>;
};

export type QuoteRequest = Omit<ValidTripDetails, 'phone'>;

/** EUR per program id. */
export type Quote = Record<number, number>;

export type OrderRequest = ValidTripDetails & { programId: number };

export type Order = { orderId: string };

export type Step = 'details' | 'program' | 'done';

export type InsuranceFormState = {
  step: Step;
  details: TripDetails;
  /** `null` until `PhoneField` reports it. */
  phoneValid: boolean | null;
  programId: number | null;
  orderId: string | null;
  submitAttempted: boolean;
};
