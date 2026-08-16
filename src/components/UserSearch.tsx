import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { searchUsersQuery } from '../lib/graphql/users';
import { startDirectMessageMutation } from '../lib/graphql/chat';
import { paths } from '../lib/paths';
import type { ChatMessageUser } from '../lib/types';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

export function UserSearch() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatMessageUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingDm, setIsStartingDm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!token || trimmedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      searchUsersQuery(token, trimmedQuery)
        .then(setResults)
        .finally(() => setIsSearching(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [trimmedQuery, token]);

  async function handleSelect(userId: string) {
    if (!token || isStartingDm) return;
    setIsStartingDm(true);
    try {
      const room = await startDirectMessageMutation(token, userId);
      navigate(paths.chatRoom(room.id));
    } finally {
      setIsStartingDm(false);
    }
  }

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users to message (type at least 3 letters)..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

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
