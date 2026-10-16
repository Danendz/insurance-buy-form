import { describe, expect, it } from 'vitest';
import { calculatePrice, SPORT_ACTIVITY_ID, tripDays } from './price';

const multipliers = { multiTrip: 1.5, sport: 1.3 };
const base = { dailyRate: 2.5, days: 10, coverageType: 'single', activityId: 0 } as const;

describe('calculatePrice', () => {
  it('multiplies the daily rate by the number of days', () => {
    expect(calculatePrice(base, multipliers)).toBe(25);
  });

  it('applies the multi-trip and sport multipliers', () => {
    expect(calculatePrice({ ...base, coverageType: 'multi' }, multipliers)).toBe(37.5);
    expect(calculatePrice({ ...base, activityId: SPORT_ACTIVITY_ID }, multipliers)).toBe(32.5);
    expect(
      calculatePrice(
        { ...base, coverageType: 'multi', activityId: SPORT_ACTIVITY_ID },
        multipliers,
      ),
    ).toBe(48.75);
  });

  it('rounds to cents', () => {
    expect(calculatePrice({ ...base, dailyRate: 4.2, days: 3, activityId: 1 }, multipliers)).toBe(
      16.38,
    );
  });
});

describe('tripDays', () => {
  it('counts both trip ends as insured days', () => {
    expect(tripDays('2024-09-05', '2024-09-12')).toBe(8);
  });
});
