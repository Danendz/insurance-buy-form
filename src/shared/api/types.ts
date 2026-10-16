export type Activity = {
  id: number;
  name: string;
};

export type Coverages = {
  medicine: number;
  accident: number;
  covid: number;
  evacuation: number;
  transportation: number;
  compensation: number;
};

export type Program = {
  id: number;
  name: string;
  title: string;
  description: string;
  /** EUR. */
  liability: number;
  coverages: Coverages;
  /** EUR per insured day. */
  dailyRate: number;
};

export type Country = {
  id: number;
  name: string;
  isInSchengen: boolean;
};

export type PriceMultipliers = {
  multiTrip: number;
  sport: number;
};
