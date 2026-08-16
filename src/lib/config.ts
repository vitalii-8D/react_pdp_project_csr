export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';

export function getStripePublishableKey(): string {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
}
