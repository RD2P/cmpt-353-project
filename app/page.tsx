
import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "@/app/components/logout-button";
import { readSessionToken, sessionCookie } from "@/lib/session";

export default async function Home() {
  const features = [
    "Create channels and post questions",
    "Thread replies and attach screenshots",
    "Vote and search across people and content",
  ];

  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);
  const isSignedIn = session !== null;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50">
      <header className="relative z-10 flex w-full items-center justify-end gap-2 p-4 sm:p-6">
        {isSignedIn ? (
          <>
            <div className="inline-flex items-center border-2 border-emerald-700 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-[0_8px_0_0_rgba(6,95,70,0.35)]">
              Signed in
            </div>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_10px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center border-2 border-sky-700 bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_10px_0_0_rgba(30,64,175,0.45)] transition hover:-translate-y-0.5 hover:bg-sky-300"
            >
              Sign up
            </Link>
          </>
        )}
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-4xl items-center px-4 pb-12 sm:px-6 lg:px-8">
        <section className="w-full space-y-6 border-2 border-slate-950 bg-white p-6 shadow-[0_18px_0_0_rgba(15,23,42,1)] sm:p-8">
          <div className="inline-flex items-center border-2 border-slate-950 bg-sky-100 px-3 py-1 text-xs font-semibold text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
            Ask. Reply. Share.
          </div>

          <div className="space-y-3">
            {isSignedIn ? (
              <p className="text-base font-semibold text-emerald-800 sm:text-lg">
                Welcome, {session.displayName}
              </p>
            ) : null}
            <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Que-Query keeps Q&amp;A simple.
            </h1>
            <p className="max-w-xl text-base text-slate-800 sm:text-lg">
              Organized conversations for teams and classes.
            </p>
          </div>

          {isSignedIn ? null : (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center border-2 border-sky-700 bg-sky-400 px-5 py-3 text-sm font-medium text-slate-950 shadow-[0_10px_0_0_rgba(30,64,175,0.45)] transition hover:-translate-y-0.5 hover:bg-sky-300"
              >
                Get started
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-5 py-3 text-sm font-medium text-slate-950 shadow-[0_10px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Sign in
              </Link>
            </div>
          )}

          <ul className="space-y-2 text-sm font-medium text-slate-900 sm:text-base">
            {features.map((feature) => (
              <li key={feature} className="border-l-4 border-sky-600 pl-3">
                {feature}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
