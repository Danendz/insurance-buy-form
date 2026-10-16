import { hasErrors, validateTrip } from '@/features/insurance-form/server';
import { calculateQuote } from '../_lib/catalog';
import {
  badRequest,
  earliestClientToday,
  parseTripDetails,
  readJson,
  simulateNetwork,
} from '../_lib/http';

export async function POST(request: Request) {
  await simulateNetwork();
  const details = parseTripDetails(await readJson(request));
  if (!details) return badRequest({ message: 'Invalid JSON body' });

  const errors = validateTrip(details, earliestClientToday());
  if (hasErrors(errors)) return badRequest({ errors });

  const quote = calculateQuote({
    countryIds: details.countryIds as number[],
    coverageType: details.coverageType,
    startDate: details.startDate!,
    endDate: details.endDate!,
    activityId: details.activityId!,
  });
  return quote
    ? Response.json(quote)
    : badRequest({ errors: { countryIds: 'Неизвестная страна' } });
}
