import { type FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, updateProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import type { User } from "../types/auth";

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20.99 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.78 9.79Z" />
    </svg>
  );
}

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setName(currentUser.name);
      } catch (err) {
        if (isAxiosError<{ detail?: string }>(err)) {
          setError(err.response?.data.detail ?? "Failed to load profile");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setIsFetching(false);
      }
    }

    fetchUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const updatedUser = await updateProfile(name);
      setUser(updatedUser);
      setName(updatedUser.name);
      setSuccessMessage("Profile updated");
      window.setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      if (isAxiosError<{ detail?: string }>(err)) {
        setError(err.response?.data.detail ?? "Failed to update profile");
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Settings
          </h1>
          <Link
            className="text-sm font-medium text-sky-600 transition hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            to="/"
          >
            Back to Chat
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Profile
          </h2>

          {isFetching ? (
            <div className="mt-4 flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 dark:border-slate-700 dark:border-t-sky-400" />
            </div>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                />
              </div>

              {successMessage && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  {successMessage}
                </p>
              )}

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}

              <button
                className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Appearance
          </h2>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Dark Mode
            </span>
            <button
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Account
          </h2>
          <button
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export default Settings;
