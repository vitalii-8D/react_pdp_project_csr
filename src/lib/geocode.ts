const MIN_QUERY_LENGTH = 3;

export interface AddressSuggestion {
  label: string;
  city: string;
  lat: number;
  lon: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string };
}

// Called directly from the browser (no server to proxy through in a pure CSR app) — Nominatim's
// usage policy expects a descriptive User-Agent/Referer and a light request rate; browsers block
// setting User-Agent manually, so this relies on the Referer header and the caller's own debounce.
export async function geocodeSearch(q: string): Promise<AddressSuggestion[]> {
  const trimmed = q.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const results = (await response.json()) as NominatimResult[];
  return results.map((result) => ({
    label: result.display_name,
    city: result.address?.city ?? result.address?.town ?? result.address?.village ?? result.display_name,
    lat: Number(result.lat),
    lon: Number(result.lon),
  }));
}
