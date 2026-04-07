"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md border-2 border-slate-950 bg-white p-6 shadow-[0_14px_0_0_rgba(15,23,42,1)]">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-700">Welcome back.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-900">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-900">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border-2 border-sky-700 bg-sky-400 px-4 py-2 font-medium text-slate-950 shadow-[0_8px_0_0_rgba(30,64,175,0.45)] transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-700">
          New here? <Link href="/signup" className="font-semibold text-slate-950 underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
