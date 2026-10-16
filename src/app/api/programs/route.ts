import { getTripPrograms } from '../_lib/catalog';
import { badRequest, notFound, simulateNetwork } from '../_lib/http';

/** `?countryIds=1,238`: programs sold in every listed country. */
export async function GET(request: Request) {
  await simulateNetwork();
  const param = new URL(request.url).searchParams.get('countryIds');
  const countryIds = param ? param.split(',').map(Number) : [];
  if (countryIds.length === 0 || !countryIds.every(Number.isInteger)) {
    return badRequest({ message: 'countryIds must be a comma-separated list of ids' });
  }
  const programs = getTripPrograms(countryIds);
  return programs ? Response.json(programs) : notFound();
}
