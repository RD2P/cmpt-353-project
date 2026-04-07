
import Link from "next/link";

export default function Home() {
  const features = [
    "Browse and create channels",
    "Post a question or message in a channel",
    "Reply to posts and replies in threads",
    "Attach screenshots to posts and replies",
    "Vote up or down on posts and replies",
    "Search across content and users",
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50">

      <header className="relative z-10 flex w-full items-center justify-end gap-2 p-4 sm:p-6">
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
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center border-2 border-slate-950 bg-white px-3 py-1 text-xs font-medium text-slate-950 shadow-[0_8px_0_0_rgba(15,23,42,1)]">
              A friendly place for questions, threads, and screenshots
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Que-Query keeps conversations tidy, useful, and a little more
                fun.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-800 sm:text-lg">
                Jump into channels, ask a question, thread replies, attach a
                screenshot when words are not enough, and keep the best ideas
                bubbling to the top with voting and search.
              </p>
            </div>

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
                I already have an account
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="border-2 border-slate-950 bg-white px-4 py-3 text-sm text-slate-800 shadow-[0_8px_0_0_rgba(15,23,42,1)]"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <aside className="relative">
            <div className="absolute inset-0 -z-10 bg-sky-200/40 blur-3xl" />
            <div className="border-2 border-slate-950 bg-white p-5 shadow-[0_18px_0_0_rgba(15,23,42,1)] sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b-2 border-slate-950 pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                    What you can do
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    A quick tour of the app
                  </p>
                </div>
                <div className="border-2 border-sky-700 bg-sky-400 px-3 py-1 text-xs font-medium text-slate-950 shadow-[0_8px_0_0_rgba(30,64,175,0.45)]">
                  Ready to go
                </div>
              </div>

              <div className="space-y-3 pt-4 text-sm leading-6 text-slate-800">
                <p>Start a channel for a topic, team, or class.</p>
                <p>Drop a question or a casual message into the right place.</p>
                <p>Keep the conversation going with threaded replies.</p>
                <p>Attach a screenshot when the problem needs a visual.</p>
                <p>Vote on helpful posts so the good stuff rises up.</p>
                <p>Search people and content without digging through noise.</p>
              </div>

              <div className="mt-5 border-2 border-slate-950 bg-sky-100 px-4 py-4 text-slate-950 shadow-[0_10px_0_0_rgba(15,23,42,1)]">
                <p className="text-sm font-medium">Light, quick, and organized.</p>
                <p className="mt-1 text-sm text-slate-800">
                  Built for conversations that stay easy to follow.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
