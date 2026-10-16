import { getMultipliers } from '../../_lib/catalog';
import { simulateNetwork } from '../../_lib/http';

export async function GET() {
  await simulateNetwork();
  return Response.json(getMultipliers());
}
