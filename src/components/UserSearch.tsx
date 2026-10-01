import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { searchUsersQuery } from '../lib/graphql/users';
import { startDirectMessageMutation } from '../lib/graphql/chat';
import { paths } from '../lib/paths';
import { MIN_QUERY_LENGTH } from '../lib/search-constants';
import { errorMessage } from '../lib/error-message';
import type { ChatMessageUser } from '../lib/types';

const DEBOUNCE_MS = 300;

interface UserSearchProps {
  // Which chat room route a newly started DM lands on - Chat (Socket.IO) and Chat V2 (GraphQL
  // subscriptions) share the same rooms but have their own room pages.
  roomPath?: (id: string) => string;
}

export function UserSearch({ roomPath = paths.chatRoom }: UserSearchProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatMessageUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingDm, setIsStartingDm] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const trimmedQuery = query.trim();

  function handleQueryChange(value: string) {
    setQuery(value);
    setError(undefined);
    // Drop results for the previous query right away, so typing a new one never flashes a stale list.
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (!token || trimmedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    // `cancelled` drops responses for a query the user has already typed past - without it a slow
    // response could overwrite the results of a newer one.
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await searchUsersQuery(token, trimmedQuery);
        if (!cancelled) setResults(users);
      } catch (searchError: unknown) {
        if (!cancelled) setError(errorMessage(searchError, 'Could not search users.'));
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmedQuery, token]);

  async function handleSelect(userId: string) {
    if (!token || isStartingDm) return;
    setIsStartingDm(true);
    setError(undefined);
    try {
      const room = await startDirectMessageMutation(token, userId);
      navigate(roomPath(room.id));
    } catch (startError) {
      setError(errorMessage(startError, 'Could not start the conversation.'));
    } finally {
      setIsStartingDm(false);
    }
  }

  return (
    <div>
      <input
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Search users to message (type at least 3 letters)..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {trimmedQuery.length >= MIN_QUERY_LENGTH && (
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">{isSearching ? 'Searching...' : 'No users found.'}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    disabled={isStartingDm}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    <span className="font-semibold text-slate-800">{user.name}</span>
                    <span className="text-slate-400 ml-2">{user.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
