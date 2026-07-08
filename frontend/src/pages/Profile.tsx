import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import { getCurrentUser, updateProfile } from "../api/users";
import type { User } from "../types/auth";

function Profile() {
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

  if (isFetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-200">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Link
          className="mb-4 inline-block text-sm font-medium text-sky-600 transition hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          to="/"
        >
          Back to Chat
        </Link>

        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
          Profile
        </h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            className="w-full rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Profile;
