import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import { searchPostsQuery } from '../lib/graphql/posts';
import { categoriesQuery } from '../lib/graphql/categories';
import { PostCard } from '../components/PostCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAuth } from '../context/AuthContext';
import type { CategoryEntity, PostEntity, SearchPostsInput } from '../lib/types';

const READING_TIME_BUCKETS = [
  { label: 'Any length', value: '' },
  { label: 'Under 5 min', value: '5' },
  { label: 'Under 15 min', value: '15' },
];

export default function PostsPage() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const categories = searchParams.getAll('category');
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const maxReading = searchParams.get('maxReading') ?? '';

  const [allCategories, setAllCategories] = useState<CategoryEntity[]>([]);
  const [items, setItems] = useState<PostEntity[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const baseInput: SearchPostsInput = {
    ...(q && { query: q }),
    ...(categories.length > 0 && { categories }),
    ...((from || to) && { createdAt: { ...(from && { from }), ...(to && { to }) } }),
    ...(maxReading && { readingTime: { max: Number(maxReading) } }),
  };
  const baseKey = JSON.stringify(baseInput);

  useEffect(() => {
    let cancelled = false;
    Promise.all([searchPostsQuery(token ?? undefined, baseInput), categoriesQuery(token ?? undefined)]).then(
      ([result, cats]) => {
        if (cancelled) return;
        setItems(result.items);
        setNextCursor(result.nextCursor);
        setAllCategories(cats);
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey, token]);

  const refetch = useCallback(() => {
    searchPostsQuery(token ?? undefined, baseInput).then((result) => {
      setItems(result.items);
      setNextCursor(result.nextCursor);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey, token]);

  const canLoadMore = Boolean(nextCursor) && !isLoadingMore;
  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    searchPostsQuery(token ?? undefined, { ...baseInput, cursor: nextCursor })
      .then((result) => {
        setItems((prev) => [...prev, ...result.items]);
        setNextCursor(result.nextCursor);
      })
      .finally(() => setIsLoadingMore(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, isLoadingMore, baseKey, token]);
  const sentinelRef = useInfiniteScroll(loadMore, canLoadMore);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams();
    const newQ = String(formData.get('q') ?? '');
    const newFrom = String(formData.get('from') ?? '');
    const newTo = String(formData.get('to') ?? '');
    const newMaxReading = String(formData.get('maxReading') ?? '');
    if (newQ) nextParams.set('q', newQ);
    if (newFrom) nextParams.set('from', newFrom);
    if (newTo) nextParams.set('to', newTo);
    if (newMaxReading) nextParams.set('maxReading', newMaxReading);
    for (const value of formData.getAll('category')) {
      nextParams.append('category', String(value));
    }
    setSearchParams(nextParams);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Community Posts</h1>
        <p className="text-slate-500 mt-1">Explore what other creators have shared.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <TextField
                id="q"
                label="Search"
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Search title, content, author..."
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Search</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField id="from" label="From" name="from" type="date" defaultValue={from} />
            <TextField id="to" label="To" name="to" type="date" defaultValue={to} />
            <div>
              <label htmlFor="maxReading" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reading time
              </label>
              <select
                id="maxReading"
                name="maxReading"
                defaultValue={maxReading}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {READING_TIME_BUCKETS.map((bucket) => (
                  <option key={bucket.value} value={bucket.value}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {allCategories.length > 0 && (
            <div>
              <p className="block text-sm font-semibold text-slate-700 mb-1.5">Categories</p>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((category) => (
                  <label key={category.id} className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.name}
                      defaultChecked={categories.includes(category.name)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No posts match your search.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {items.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} onPostChanged={refetch} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} />
      {isLoadingMore && <p className="text-center text-sm text-slate-400 py-2">Loading more…</p>}
    </div>
  );
}
