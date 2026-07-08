import { useEffect, useState } from "react";

import { searchUsers } from "../api/users";
import type { User } from "../types/auth";

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

function UserSearch({ onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const users = await searchUsers(trimmedQuery);
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setHasSearched(true);
        setIsLoading(false);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  function handleSelect(user: User) {
    onSelectUser(user);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }

  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative w-full">
      <input
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users"
      />

      {showDropdown && (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {isLoading && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              Searching...
            </p>
          )}

          {!isLoading &&
            results.map((user) => (
              <button
                className="block w-full px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                key={user.id}
                type="button"
                onClick={() => handleSelect(user)}
              >
                <span className="block font-medium text-slate-950 dark:text-white">
                  {user.name}
                </span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </span>
              </button>
            ))}

          {!isLoading && hasSearched && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
              No users found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserSearch;
