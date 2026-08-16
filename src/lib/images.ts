export function avatarUrl(seed: string | number): string {
  return `https://cataas.com/cat?width=200&height=200&u=${encodeURIComponent(seed)}`;
}
