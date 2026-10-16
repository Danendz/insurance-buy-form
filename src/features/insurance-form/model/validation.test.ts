import { describe, expect, it } from 'vitest';
import type { TripDetails } from '../types';
import { MAX_TRIP_DAYS, validateDetails } from './validation';

const TODAY = '2024-09-05';

const valid: TripDetails = {
  countryId: 1,
  coverageType: 'single',
  startDate: '2024-09-05',
  endDate: '2024-09-12',
  activityId: 0,
  phone: '+998901234567',
};

describe('validateDetails', () => {
  it('accepts complete details', () => {
    expect(validateDetails(valid, TODAY)).toEqual({});
  });

  it('requires every field', () => {
    const errors = validateDetails(
      { ...valid, countryId: null, startDate: null, endDate: null, activityId: null, phone: '' },
      TODAY,
    );
    expect(Object.keys(errors).sort()).toEqual(
      ['activityId', 'countryId', 'endDate', 'phone', 'startDate'].sort(),
    );
  });

  it('rejects a start in the past', () => {
    expect(validateDetails({ ...valid, startDate: '2024-09-04' }, TODAY)).toHaveProperty(
      'startDate',
    );
  });

  it('requires the end to be after the start', () => {
    expect(validateDetails({ ...valid, endDate: '2024-09-05' }, TODAY)).toHaveProperty('endDate');
    expect(validateDetails({ ...valid, endDate: '2024-09-01' }, TODAY)).toHaveProperty('endDate');
  });

  it(`limits a trip to ${MAX_TRIP_DAYS} days`, () => {
    expect(validateDetails({ ...valid, endDate: '2025-09-05' }, TODAY)).toEqual({});
    expect(validateDetails({ ...valid, endDate: '2025-09-06' }, TODAY)).toHaveProperty('endDate');
  });

  it('reports an invalid phone only when told so', () => {
    const details = { ...valid, phone: '+99890123' };
    expect(validateDetails(details, TODAY)).toEqual({});
    expect(validateDetails(details, TODAY, { phoneValid: true })).toEqual({});
    expect(validateDetails(details, TODAY, { phoneValid: false })).toHaveProperty('phone');
  });
});
