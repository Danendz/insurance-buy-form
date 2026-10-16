# insurance-buy-form

Multi-step insurance purchase form.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Redux Toolkit + react-redux, form state persisted to `sessionStorage`
- SCSS + CSS Modules
- Vitest + React Testing Library (jsdom)
- ESLint (next core-web-vitals + typescript) + Prettier
- pnpm

## Scripts

| Script               | Description                     |
| -------------------- | ------------------------------- |
| `pnpm dev`           | Dev server                      |
| `pnpm build`         | Production build                |
| `pnpm lint`          | ESLint (`lint:fix` to fix)      |
| `pnpm typecheck`     | `tsc --noEmit`                  |
| `pnpm format`        | Prettier write (`format:check`) |
| `pnpm test`          | Vitest in watch mode            |
| `pnpm test:run`      | Vitest single run               |
| `pnpm test:coverage` | Vitest with v8 coverage         |

## Structure

```
src/
├── app/                 # routing, layouts, page composition
│   └── api/             # mock backend: route handlers, `_data/data.json`, `_lib/`
├── features/
│   └── insurance-form/  # components/, model/, types/, index.ts, server.ts
├── store/               # store composition, typed hooks, StoreProvider, test utils
└── shared/              # api/, components/{ui,form-fields}/, hooks/, lib/, styles/, types/, utils/
```

Layers, import rules and conventions: [docs/architecture.md](docs/architecture.md).

## API

Every handler waits `API_DELAY_MS` (default 800 ms) to make loading states visible. The client calls it through RTK Query (`shared/api/baseApi.ts` + injected endpoints).

| Endpoint                           | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `GET /api/dictionary/countries`    | Countries                                                |
| `GET /api/dictionary/activities`   | Trip purposes                                            |
| `GET /api/dictionary/programs`     | Programs with coverages and daily rates                  |
| `GET /api/dictionary/multipliers`  | Price multipliers (multi-trip, sport)                    |
| `GET /api/programs?countryIds=1,2` | Programs sold in every listed country                    |
| `POST /api/quote`                  | Price per program for a trip                             |
| `POST /api/orders`                 | Validates the trip and program, returns a mock `orderId` |

Filtering, pricing and order validation run on the server.
