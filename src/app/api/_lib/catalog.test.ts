import { describe, expect, it } from 'vitest';
import {
  calculateQuote,
  getActivities,
  getCountries,
  getCountryPrograms,
  getMultipliers,
  getPrograms,
} from './catalog';

describe('catalog', () => {
  it('lists countries sorted by name, without their program ids', () => {
    const countries = getCountries();
    expect(countries.length).toBeGreaterThan(200);
    expect(countries[0]).toEqual({ id: 1, name: 'АВСТРАЛИЯ', isInSchengen: false });
    const names = countries.map((country) => country.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ru')));
  });

  it('lists each country id once; the source has spelling variants of some', () => {
    const ids = getCountries().map((country) => country.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getCountries().find((country) => country.id === 98)?.name).toBe('КЫРГЫЗСТАН');
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
    const programs = getCountryPrograms(1);
    expect(programs?.map((program) => program.name)).toEqual(['Platinum', 'STOPVIRUS |']);
    expect(programs?.[0]).toMatchObject({ liability: 90000, dailyRate: 3.5 });
    expect(getCountryPrograms(238)?.map((program) => program.name)).toEqual(['Platinum']);
  });

  it('returns undefined for an unknown country', () => {
    expect(getCountryPrograms(-1)).toBeUndefined();
  });

  it('quotes every program of the country', () => {
    const quote = calculateQuote({
      countryId: 1,
      coverageType: 'single',
      startDate: '2024-09-05',
      endDate: '2024-09-14',
      activityId: 0,
    });
    expect(quote).toEqual({ 3: 35, 4: 30 });
  });
});
