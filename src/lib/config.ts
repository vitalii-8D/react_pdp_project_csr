export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';

export const GRAPHQL_HTTP_URL = `${SERVER_URL}/graphql`;

// Chat V2's graphql-ws subscriptions use the same /graphql endpoint over a WebSocket.
export const GRAPHQL_WS_URL = `${SERVER_URL.replace(/^http/, 'ws')}/graphql`;

export function getStripePublishableKey(): string {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
}
