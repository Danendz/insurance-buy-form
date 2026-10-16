import { getCountryPrograms } from '../../../_lib/catalog';
import { notFound, simulateNetwork } from '../../../_lib/http';

export async function GET(_request: Request, ctx: RouteContext<'/api/countries/[id]/programs'>) {
  await simulateNetwork();
  const { id } = await ctx.params;
  const programs = getCountryPrograms(Number(id));
  return programs ? Response.json(programs) : notFound();
}
