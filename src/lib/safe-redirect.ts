import { paths } from './paths';

// Guards against open-redirect: only allow relative, same-origin paths.
export function safeRedirectPath(to: string | null | undefined, fallback = paths.posts()): string {
  if (!to || !to.startsWith('/') || to.startsWith('//')) {
    return fallback;
  }
  return to;
}
