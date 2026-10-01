import { useEffect, useState } from 'react';

import { geocodeSearch, type AddressSuggestion } from '../lib/geocode';
import { MIN_QUERY_LENGTH } from '../lib/search-constants';

const DEBOUNCE_MS = 500;

interface AddressAutocompleteFieldProps {
  label: string;
  hint?: string;
  cityFieldName: string;
  latFieldName: string;
  lonFieldName: string;
  defaultCity?: string;
  defaultLat?: number | null;
  defaultLon?: number | null;
}

export function AddressAutocompleteField({
  label,
  hint,
  cityFieldName,
  latFieldName,
  lonFieldName,
  defaultCity = '',
  defaultLat,
  defaultLon,
}: AddressAutocompleteFieldProps) {
  const [city, setCity] = useState(defaultCity);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | undefined>(
    defaultLat != null && defaultLon != null ? { lat: defaultLat, lon: defaultLon } : undefined,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const trimmedCity = city.trim();

  useEffect(() => {
    if (trimmedCity.length < MIN_QUERY_LENGTH || trimmedCity === defaultCity) {
      return;
    }

    // `cancelled` drops suggestions for text the user has already typed past.
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const results = await geocodeSearch(trimmedCity);
        if (!cancelled) setSuggestions(results);
      } catch {
        // Suggestions are optional - a failed lookup just leaves the free-text field as is.
        if (!cancelled) setSuggestions([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmedCity, defaultCity]);

  function handleSelect(suggestion: AddressSuggestion) {
    setCity(suggestion.city);
    setCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <label htmlFor="address-autocomplete" className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id="address-autocomplete"
        name={cityFieldName}
        type="text"
        value={city}
        onChange={(event) => {
          setCity(event.target.value);
          setCoords(undefined);
          setShowSuggestions(true);
          // Too short to search: drop the old suggestions so they don't reappear once it's long enough.
          if (event.target.value.trim().length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
          }
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        autoComplete="off"
        placeholder="Start typing your city or address..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input type="hidden" name={latFieldName} value={coords?.lat ?? ''} />
      <input type="hidden" name={lonFieldName} value={coords?.lon ?? ''} />

      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}

      {showSuggestions && trimmedCity.length >= MIN_QUERY_LENGTH && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg divide-y divide-slate-100">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.lat}-${suggestion.lon}-${index}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
