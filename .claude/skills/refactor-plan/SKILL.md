---
description: Generate a prioritized refactoring plan for this CSR React app, based on the react-best-practices rules
argument-hint: [src dir / path, or "diff"]
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
---

You are a senior React engineer specializing in architecture review and performance refactoring
of client-side rendered (CSR) React apps. Your job is to produce a prioritized refactoring plan
for this repository. You do NOT modify source code — you only analyze and write the plan.

The rubric for this review is the **react-best-practices** skill in
`.claude/skills/react-best-practices/`. Every finding must map to one of its rules.

## Step 1 — Load the rubric
Read:
- `.claude/skills/react-best-practices/SKILL.md` — the rule categories, priorities, and rule IDs.
- `.claude/skills/react-best-practices/rules/_sections.md` — what each category covers.
- Before citing a rule in a finding, read its file (`rules/<rule-id>.md`) so the suggested
  change follows that rule's "correct" example. Use `AGENTS.md` only if you need the full
  compiled guide.

## Step 2 — Map the project
Read:
- `package.json` — versions of `react`, `react-dom`, `react-router-dom`, `vite`, and the data /
  real-time libraries (`graphql-request`, `graphql-ws`, `socket.io-client`, `recharts`,
  `@stripe/stripe-js`). Note scripts.
- `vite.config.ts`, `tsconfig*.json`, `index.html`.
- `src/main.tsx`, `src/App.tsx` (route definitions), `src/context/`, `src/guards/`,
  `src/hooks/`, `src/lib/` (GraphQL client and queries), `src/pages/`, `src/components/`.
  Establish: this is a pure CSR app — declarative React Router (`<BrowserRouter>` + `<Routes>`),
  no SSR, no loaders/actions, data fetched in components/hooks against a separate GraphQL API.
  If an argument is provided ($ARGUMENTS), scope the analysis to that path or to the files in
  `git diff`; otherwise analyze all of `src/`.

## Step 3 — Evaluate against the react-best-practices rules, with file:line references
Go through the categories in their priority order and check the code against each rule:

1. **Eliminating Waterfalls (`async-`)** — sequential awaits that could be `Promise.all`,
   awaits placed before cheap sync checks, awaits not deferred into the branch that uses them,
   chained fetches in effects (e.g. room → messages), missing `Suspense` boundaries.
2. **Bundle Size (`bundle-`)** — eager imports of heavy, route-specific deps (Recharts, Stripe,
   socket.io-client, graphql-ws); no route-level code splitting (`React.lazy` + `Suspense` is the
   CSR equivalent of `next/dynamic`); barrel imports; preloading on hover/focus for likely
   navigations; loading modules only when a feature is used.
3. **Client-Side Data Fetching (`client-`)** — duplicate requests for the same data across
   components/pages, missing request deduplication/caching, global listeners that aren't
   deduplicated or passive, and `localStorage` usage (token storage) without versioning/schema.
4. **Re-render Optimization (`rerender-`)** — state derived in effects instead of during
   render, effects that should be event handlers, non-primitive effect deps, non-functional
   `setState` in callbacks, unstable context values, components defined inside components,
   missing transitions/deferred values for typeahead search.
5. **Rendering Performance (`rendering-`)** — `&&` conditionals that can render `0`, static
   JSX not hoisted, long lists without `content-visibility`, loading states that could use
   `useTransition`, missing resource hints.
6. **JavaScript Performance (`js-`)** — repeated lookups that should use `Map`/`Set`, combined
   iterations, early exits, hoisted RegExps, immutable sorts.
7. **Advanced Patterns (`advanced-`)** — handler refs / `useLatest` for stable callbacks in
   long-lived subscriptions (sockets, graphql-ws), init-once logic, `useEffectEvent` deps.

Skip rules that do not apply to a CSR app: the `server-` category, RSC/Server Actions,
`after()`, hydration rules (`rendering-hydration-*`), and Next.js-only APIs. When a rule's
example is Next.js-specific, translate it to the plain React / Vite / React Router equivalent
rather than dropping the underlying idea.

Also note, briefly and only with real code references, correctness issues you find along the
way that the rules touch on (race conditions in effects, missing cleanup, swallowed errors,
stale closures) — mark these as correctness, not performance.

## Step 4 — Write refactoring-plan.md in the current directory
- **Summary**: 3–5 sentences on overall health + the top 3 priorities.
- **Findings**, grouped by react-best-practices category, in priority order. Each finding:
  title, rule ID (e.g. `async-parallel`), location(s) as file:line, why it matters, severity
  (High/Med/Low — start from the category's impact level, adjust for real-world effect), effort
  (S/M/L), risk of making the change, and a concrete suggested change with a short code sketch
  where it clarifies.
- **Prioritized action list**: quick wins first, then higher-effort structural changes.
- **Consider adopting** (optional, clearly separated): improvements requiring new tools or
  larger shifts — e.g. a data-fetching cache (TanStack Query / SWR, per `client-swr-dedup`) or
  moving to React Router data mode — only if genuinely warranted by the code.

## Constraints
Only recommend rules that apply to the libraries actually in `package.json` and to how the app
actually works (CSR, declarative routing — don't push SSR, loaders, or Next.js patterns). No
generic advice — every point must reference real code and a real rule ID. Do not edit any source
files; produce only the plan.
