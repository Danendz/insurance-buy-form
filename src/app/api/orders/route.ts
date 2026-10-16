import { hasErrors, validateDetails } from '@/features/insurance-form/server';
import { isValidPhone } from '@/shared/utils/phone';
import { getTripPrograms } from '../_lib/catalog';
import {
  badRequest,
  earliestClientToday,
  parseTripDetails,
  readJson,
  simulateNetwork,
} from '../_lib/http';

export async function POST(request: Request) {
  await simulateNetwork();
  const body = await readJson(request);
  const details = parseTripDetails(body);
  if (!details) return badRequest({ message: 'Invalid JSON body' });

  const errors = validateDetails(details, earliestClientToday(), {
    phoneValid: isValidPhone(details.phone),
  });
  if (hasErrors(errors)) return badRequest({ errors });

  const programId = (body as { programId?: unknown }).programId;
  const programs = getTripPrograms(details.countryIds as number[]) ?? [];
  if (!programs.some((program) => program.id === programId)) {
    return badRequest({ errors: { programId: 'Программа недоступна для выбранных стран' } });
  }

  return Response.json({ orderId: crypto.randomUUID() }, { status: 201 });
}
