# PostShare (CSR)

A client-side rendered React application for **PostShare** — a blog/post-publishing platform where users write posts, pay to publish them via Stripe, comment and rate each other's posts, chat in real time, and admins track activity through an analytics dashboard.

This is the pure client-side-rendered (CSR) frontend, built with React 19, React Router 7, Vite and Tailwind CSS. It talks to a separate GraphQL API (NestJS) for data and to a Socket.IO server for real-time chat.

## Tech stack

- **React 19** + **TypeScript**
- **React Router 7** — client-side routing (`src/App.tsx`)
- **Vite 8** — dev server & build tooling
- **Tailwind CSS 4**
- **graphql-request** — GraphQL client (`src/lib/graphql-client.ts`)
- **socket.io-client** — real-time chat
- **@stripe/stripe-js** — Stripe Checkout redirect for post publishing
- **Recharts** — analytics dashboard charts

## Project structure

```
src/
├── App.tsx              # Route definitions
├── main.tsx              # App entry point
├── components/           # Shared/reusable UI components
├── context/               # React context (AuthContext — auth/session state)
├── guards/                # Route guards (RequireAuth, admin-only routes)
├── hooks/                 # Custom hooks (e.g. useInfiniteScroll)
├── enums/                 # Shared enums (roles, post/payment status, form fields, socket events...)
├── pages/                 # Route-level page components
└── lib/
    ├── graphql/           # GraphQL queries/mutations, grouped by domain
    ├── graphql-client.ts  # gqlRequest wrapper + error handling
    ├── config.ts          # Env-driven config (server URL, Stripe key)
    ├── geocode.ts         # Address autocomplete (OpenStreetMap Nominatim)
    ├── paths.ts           # Centralized route path builders
    └── types.ts           # Shared domain types
```

## Navigation / routes

| Path | Page | Access |
|---|---|---|
| `/` | Posts feed | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/posts/:postId/:slug` | Post detail (comments, ratings, share) | Public |
| `/my-posts` | My posts list | Authenticated |
| `/my-posts/new` | Create post | Authenticated |
| `/my-posts/:postId/edit` | Edit / publish post | Authenticated |
| `/payments/success` | Stripe checkout success | Authenticated |
| `/payments/cancel` | Stripe checkout cancelled | Authenticated |
| `/users` | User directory / search | Authenticated |
| `/profile` | My profile | Authenticated |
| `/profile/edit` | Edit profile / avatar | Authenticated |
| `/chat` | Chat rooms list | Authenticated |
| `/chat/:roomId` | Chat room | Authenticated |
| `/analytics` | Analytics dashboard | Authenticated + Admin |
| `*` | 404 | Public |

Route paths are centralized in `src/lib/paths.ts` — use these builders instead of hardcoding URLs.

## Features

- **Authentication** — email/password login & registration, JWT stored in `localStorage`, session restored on load via `meQuery`.
- **Role-based access** — `RequireAuth` guard for authenticated routes, with an admin-only mode for `/analytics`.
- **Posts** — create, edit, list your own posts and browse all published posts with infinite scroll (`useInfiniteScroll`).
- **Paid publishing** — publishing a post redirects to Stripe Checkout; supports payment retry and refunds, with dedicated success/cancel pages.
- **Comments & ratings** — comment threads with star ratings on posts.
- **Real-time chat** — Socket.IO-powered chat rooms with join/leave, live messages, and admin broadcasts.
- **User directory** — search and browse users.
- **Profile management** — edit profile details and avatar (presigned image uploads).
- **Address autocomplete** — location search backed by OpenStreetMap Nominatim.
- **Social sharing** — generate share links (Facebook, Twitter/X, LinkedIn, Telegram, WhatsApp) for posts.
- **Admin analytics dashboard** — charts for comments per post/user/period and rating distribution (Recharts).

## Getting started

### Prerequisites

- Node.js and npm
- A running instance of the [GraphQL API backend](../graph_ql_project) (and its Socket.IO server) that this app connects to

### Setup

```bash
# install dependencies
npm install

# copy the env template and fill in your values
cp .env.example .env
```

Environment variables (`.env`):

| Variable | Description |
|---|---|
| `VITE_SERVER_URL` | Base URL of the backend API (GraphQL + Socket.IO), e.g. `http://localhost:3000` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, used to redirect to Stripe Checkout |

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (default: `http://localhost:3003`) |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript project references type-check only |
| `npm run format` | Format `src/**/*.ts(x)` with Prettier |

## Notes

- The dev server runs on port `3003` and binds to `0.0.0.0` (see `vite.config.ts`).
- This is a CSR-only app (no SSR) — see the sibling [`react_pdp_project`](../react_pdp_project) repo for the SSR/router variant of this project.
