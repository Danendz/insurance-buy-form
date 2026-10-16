import { describe, expect, it } from 'vitest';
import {
  calculateQuote,
  getActivities,
  getCountries,
  getTripPrograms,
  getMultipliers,
  getPrograms,
} from './catalog';

describe('catalog', () => {
  it('lists countries sorted by name, without their program ids', () => {
    const countries = getCountries();
    expect(countries.length).toBeGreaterThan(200);
    expect(countries[0]).toEqual({ id: 1, name: 'Австралия', isInSchengen: false });
    const names = countries.map((country) => country.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ru')));
  });

  it('serves country names in title case', () => {
    const names = getCountries().map((country) => country.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'Босния и Герцеговина',
        'Малые Островные Территории США',
        'Виргинские Острова(США)',
        'Весь мир',
      ]),
    );
  });

  it('lists each country id once; the source has spelling variants of some', () => {
    const ids = getCountries().map((country) => country.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getCountries().find((country) => country.id === 98)?.name).toBe('Кыргызстан');
  });

  it('returns the four shown purposes in display order', () => {
    expect(getActivities().map((activity) => activity.name)).toEqual([
      'Туризм',
      'Работа',
      'Учёба',
      'Спорт',
    ]);
  });

  it('exposes the programs and price multipliers dictionaries', () => {
    expect(getPrograms().map((program) => program.name)).toEqual([
      'Silver',
      'Gold',
      'Platinum',
      'STOPVIRUS |',
      'STOPVIRUS ||',
    ]);
    expect(getMultipliers()).toEqual({ multiTrip: 1.5, sport: 1.3 });
  });

  it('returns full details for the programs of a country', () => {
    const programs = getTripPrograms([1]);
    expect(programs?.map((program) => program.name)).toEqual(['Platinum', 'STOPVIRUS |']);
    expect(programs?.[0]).toMatchObject({ liability: 90000, dailyRate: 3.5 });
    expect(getTripPrograms([238])?.map((program) => program.name)).toEqual(['Platinum']);
  });

  it('returns only the programs sold in every country of the trip', () => {
    const names = (countryIds: number[]) =>
      getTripPrograms(countryIds)?.map((program) => program.name);
    expect(names([3, 1])).toEqual(['Platinum', 'STOPVIRUS |']);
    expect(names([1, 238])).toEqual(['Platinum']);
    expect(names([1, 239])).toEqual([]);
  });

  it('returns undefined when a country is unknown', () => {
    expect(getTripPrograms([-1])).toBeUndefined();
    expect(getTripPrograms([1, -1])).toBeUndefined();
  });

  it('quotes every program of the trip', () => {
    const quote = calculateQuote({
      countryIds: [3, 1],
      coverageType: 'single',
      startDate: '2024-09-05',
      endDate: '2024-09-14',
      activityId: 0,
    });
    expect(quote).toEqual({ 3: 35, 4: 30 });
  });
});
