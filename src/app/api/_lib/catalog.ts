import 'server-only';
import {
  calculatePrice,
  tripDays,
  type Activity,
  type Country,
  type PriceMultipliers,
  type Program,
  type Quote,
  type QuoteRequest,
} from '@/features/insurance-form/server';
import { titleCaseUpper } from '@/shared/utils/format';
import data from '../_data/data.json';

const programsById = new Map<number, Program>(
  data.programs.map((program) => [program.id, program]),
);

const ACTIVITY_ORDER = [0, 2, 4, 1];

const COUNTRY_NAME_CASE = {
  lowercase: new Set(['и', 'в']),
  uppercase: new Set(['США']),
};

export function getCountries(): Country[] {
  // The source data repeats some ids; the first entry wins.
  const unique = new Map(data.countries.toReversed().map((country) => [country.id, country]));
  return [...unique.values()]
    .map(({ id, name, isInSchengen }) => ({
      id,
      name: titleCaseUpper(name, COUNTRY_NAME_CASE),
      isInSchengen,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getActivities(): Activity[] {
  return ACTIVITY_ORDER.map((id) => data.activities.find((activity) => activity.id === id)).filter(
    (activity) => activity !== undefined,
  );
}

export function getPrograms(): Program[] {
  return data.programs;
}

export function getMultipliers(): PriceMultipliers {
  return data.multipliers;
}

/** Programs sold in every country of the trip; `undefined` if a country is unknown. */
export function getTripPrograms(countryIds: number[]): Program[] | undefined {
  const countries = countryIds.map((countryId) =>
    data.countries.find(({ id }) => id === countryId),
  );
  if (countries.length === 0 || countries.includes(undefined)) return undefined;

  const [first, ...rest] = countries as (typeof data.countries)[number][];
  return first.programIds
    .filter((programId) => rest.every((country) => country.programIds.includes(programId)))
    .map((programId) => programsById.get(programId))
    .filter((program) => program !== undefined);
}

export function calculateQuote(request: QuoteRequest): Quote | undefined {
  const programs = getTripPrograms(request.countryIds);
  if (!programs) return undefined;

  const days = tripDays(request.startDate, request.endDate);
  return Object.fromEntries(
    programs.map((program) => [
      program.id,
      calculatePrice({ ...request, dailyRate: program.dailyRate, days }, data.multipliers),
    ]),
  );
}
