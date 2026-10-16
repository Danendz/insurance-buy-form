import { vi } from 'vitest';
import { GET as getActivities } from '../dictionary/activities/route';
import { GET as getCountryPrograms } from '../countries/[id]/programs/route';
import { GET as getCountries } from '../dictionary/countries/route';
import { GET as getMultipliers } from '../dictionary/multipliers/route';
import { POST as createOrder } from '../orders/route';
import { GET as getPrograms } from '../dictionary/programs/route';
import { POST as getQuote } from '../quote/route';

type Override = (request: Request) => Response | Promise<Response> | undefined;

/** Routes `fetch('/api/…')` to the real handlers; `override` can answer first, e.g. with an error. */
export function stubApi(override?: Override) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const overridden = await override?.(request);
    if (overridden) return overridden;

    const { pathname } = new URL(request.url);
    const programsMatch = pathname.match(/^\/api\/countries\/([^/]+)\/programs$/);
    if (programsMatch) {
      return getCountryPrograms(request, { params: Promise.resolve({ id: programsMatch[1] }) });
    }
    switch (`${request.method} ${pathname}`) {
      case 'GET /api/dictionary/countries':
        return getCountries();
      case 'GET /api/dictionary/activities':
        return getActivities();
      case 'GET /api/dictionary/programs':
        return getPrograms();
      case 'GET /api/dictionary/multipliers':
        return getMultipliers();
      case 'POST /api/quote':
        return getQuote(request);
      case 'POST /api/orders':
        return createOrder(request);
      default:
        return new Response(null, { status: 404 });
    }
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
