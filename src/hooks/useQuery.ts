import { useCallback, useEffect, useEffectEvent, useState, type SetStateAction } from 'react';

import { errorMessage } from '../lib/error-message';

interface QueryState<T> {
  key: string | null;
  data: T | undefined;
  error: string | undefined;
  isLoading: boolean;
}

// Minimal data hook shared by every page that loads data on mount: one place for loading/error
// state and for discarding responses that arrive after the component moved on. `key` identifies
// the request - when it changes the query re-runs and a stale in-flight response is dropped, and
// `data` from a previous key is never returned. Pass `null` to skip fetching (e.g. no token yet).
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({
    key,
    data: undefined,
    error: undefined,
    isLoading: key !== null,
  });
  const [version, setVersion] = useState(0);
  const runFetcher = useEffectEvent(fetcher);

  useEffect(() => {
    if (key === null) return;

    let cancelled = false;
    setState((prev) => ({
      key,
      data: prev.key === key ? prev.data : undefined,
      error: undefined,
      isLoading: true,
    }));

    async function load() {
      try {
        const data = await runFetcher();
        if (!cancelled) setState({ key, data, error: undefined, isLoading: false });
      } catch (error: unknown) {
        if (!cancelled)
          setState((prev) => ({
            ...prev,
            error: errorMessage(error),
            isLoading: false,
          }));
      }
    }
    void load();

    return () => {
      cancelled = true;
    };
  }, [key, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const setData = useCallback((action: SetStateAction<T | undefined>) => {
    setState((prev) => ({
      ...prev,
      data: typeof action === 'function' ? (action as (prev: T | undefined) => T | undefined)(prev.data) : action,
    }));
  }, []);

  const isCurrent = state.key === key;

  return {
    data: isCurrent ? state.data : undefined,
    error: isCurrent ? state.error : undefined,
    isLoading: key !== null && (!isCurrent || state.isLoading),
    setData,
    refetch,
  };
}
