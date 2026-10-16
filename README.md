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
├── app/            # routing, layouts, metadata, page composition only
├── features/       # isolated business modules
│   └── insurance-form/
│       ├── actions/     # server actions ('use server')
│       ├── queries/     # server data fetching (RSC)
│       ├── components/  # feature UI
│       ├── hooks/       # client hooks
│       ├── model/       # Redux slice + selectors
│       ├── types/       # domain types
│       ├── index.ts     # client-safe public API
│       └── server.ts    # server-only public API ('server-only')
├── components/     # UI kit without business logic
├── lib/            # external tool setup (Redux store, ...)
└── shared/         # general utils, SCSS variables/mixins, test utils
```

### Rules

- Import a feature only via `@/features/<name>` or `@/features/<name>/server`; ESLint rejects deep imports. Inside a feature, use relative imports.
- Never re-export server code from `index.ts`: client bundles import it.
- The Redux store is created per request (`makeStore`) in `StoreProvider`. Feature slices live in `features/*/model` and are registered in `src/lib/store/store.ts`.
- SCSS partials in `src/shared/styles` load by name: `@use 'variables' as *;`.
- Tests sit next to the code as `*.test.ts(x)`. Use `renderWithStore` from `@/shared/test-utils` for components connected to Redux.
