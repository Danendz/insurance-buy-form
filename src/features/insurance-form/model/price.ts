import { diffInDays } from '@/shared/utils/date';
import type { CoverageType, IsoDate, PriceMultipliers } from '../types';

export const SPORT_ACTIVITY_ID = 1;

/** Both the first and the last day are insured. */
export function tripDays(start: IsoDate, end: IsoDate): number {
  return diffInDays(start, end) + 1;
}

type PriceInput = {
  dailyRate: number;
  days: number;
  coverageType: CoverageType;
  activityId: number;
};

/** EUR, rounded to cents. */
export function calculatePrice(
  { dailyRate, days, coverageType, activityId }: PriceInput,
  multipliers: PriceMultipliers,
): number {
  let price = dailyRate * days;
  if (coverageType === 'multi') price *= multipliers.multiTrip;
  if (activityId === SPORT_ACTIVITY_ID) price *= multipliers.sport;
  return Math.round(price * 100) / 100;
}
