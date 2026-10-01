import { getStripePublishableKey } from './config';

// Stripe's hosted Checkout redirect only needs the session URL - `stripe.redirectToCheckout` was
// removed from @stripe/stripe-js. Loading Stripe.js first is still Stripe's recommended practice on
// any page that completes a payment (it initializes their fraud-detection scripts), so it is loaded
// here - but only once the user actually starts a checkout. The `/pure` entry is side-effect free:
// the root `@stripe/stripe-js` entry injects Stripe.js as soon as the module is imported, which put
// the script on every page that rendered a post.
export async function redirectToCheckout(checkoutUrl: string): Promise<void> {
  const stripePublishableKey = getStripePublishableKey();
  if (stripePublishableKey) {
    try {
      const { loadStripe } = await import('@stripe/stripe-js/pure');
      await loadStripe(stripePublishableKey);
    } catch {
      // Stripe.js is best-effort here; the hosted Checkout page works without it.
    }
  }
  window.location.assign(checkoutUrl);
}
