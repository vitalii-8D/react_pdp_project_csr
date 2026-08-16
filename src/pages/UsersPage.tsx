import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { searchUsersFullQuery } from '../lib/graphql/users';
import { avatarUrl } from '../lib/images';
import { paths } from '../lib/paths';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { buttonStyles } from '../components/Button';
import type { SearchUsersInput, SearchUsersResult, UserEntity } from '../lib/types';

const RADIUS_OPTIONS = [
  { label: 'Any distance', value: '' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 25 km', value: '25' },
  { label: 'Within 100 km', value: '100' },
];

function decodeCursor(cursor: string | null): string[] | undefined {
  if (!cursor) return undefined;
  try {
    const parsed: unknown = JSON.parse(atob(cursor));
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

export default function UsersPage() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const radiusKm = searchParams.get('radiusKm') ?? '';
  const hasLocation = user!.latitude != null && user!.longitude != null;

  const [items, setItems] = useState<UserEntity[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!token) return;

    const cursor = searchParams.get('cursor');
    const input: SearchUsersInput = {
      ...(q && { query: q }),
      ...(radiusKm && hasLocation && { useMyLocation: true, radiusKm: Number(radiusKm) }),
      ...(decodeCursor(cursor) && { cursor: cursor! }),
    };

    searchUsersFullQuery(token, input).then((result: SearchUsersResult) => {
      setItems(result.items);
      setNextCursor(result.nextCursor);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, q, radiusKm]);

  const canLoadMore = Boolean(nextCursor) && !isLoadingMore;
  const loadMore = async () => {
    if (!token || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const input: SearchUsersInput = {
        ...(q && { query: q }),
        ...(radiusKm && hasLocation && { useMyLocation: true, radiusKm: Number(radiusKm) }),
        cursor: nextCursor,
      };
      const result = await searchUsersFullQuery(token, input);
      setItems((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  };
  const sentinelRef = useInfiniteScroll(loadMore, canLoadMore);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams();
    const nextQ = String(formData.get('q') ?? '');
    const nextRadius = String(formData.get('radiusKm') ?? '');
    if (nextQ) nextParams.set('q', nextQ);
    if (nextRadius) nextParams.set('radiusKm', nextRadius);
    setSearchParams(nextParams);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">Find people in the community, near you or anywhere.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-grow">
            <TextField id="q" label="Search" name="q" type="text" defaultValue={q} placeholder="Name, email, city..." />
          </div>
          <div className="w-full sm:w-56">
            <label htmlFor="radiusKm" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Near me
            </label>
            <select
              id="radiusKm"
              name="radiusKm"
              defaultValue={radiusKm}
              disabled={!hasLocation}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonStyles()}>
            Search
          </button>
        </form>
        {!hasLocation && (
          <p className="text-xs text-slate-400 mt-3">
            <Link to={paths.profileEdit()} className="text-blue-600 hover:underline">
              Add your location in your profile
            </Link>{' '}
            to search for people nearby.
          </p>
        )}
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No users found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="p-5 flex items-center space-x-4">
              <div className="relative shrink-0">
                <img
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                  src={item.avatar?.url ?? avatarUrl(item.id)}
                  alt={item.name}
                />
                {item.isOnline && (
                  <span
                    title="Online"
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-slate-400 truncate">{item.email}</p>
                {item.city && <p className="text-xs text-slate-400 truncate">{item.city}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div ref={sentinelRef} />
      {isLoadingMore && <p className="text-center text-sm text-slate-400 py-2">Loading more…</p>}
    </div>
  );
}
