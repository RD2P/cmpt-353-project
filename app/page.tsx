
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
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.14),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_34%)]" />

      <header className="relative z-10 flex w-full items-center justify-end gap-2 p-4 sm:p-6">
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-full border border-sky-300/20 bg-slate-950/50 px-4 py-2 text-sm text-slate-50 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-slate-900/70"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-300"
        >
          Sign up
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-sky-300/15 bg-slate-950/50 px-3 py-1 text-xs font-medium text-sky-100/80 shadow-sm backdrop-blur-sm">
              A friendly place for questions, threads, and screenshots
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Que-Query keeps conversations tidy, useful, and a little more
                fun.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-200/75 sm:text-lg">
                Jump into channels, ask a question, thread replies, attach a
                screenshot when words are not enough, and keep the best ideas
                bubbling to the top with voting and search.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-300"
              >
                Get started
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-full border border-sky-300/20 bg-slate-950/50 px-5 py-3 text-sm font-medium text-slate-50 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-slate-900/70"
              >
                I already have an account
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-sky-300/12 bg-slate-950/55 px-4 py-3 text-sm text-slate-200/80 shadow-sm backdrop-blur-sm"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <aside className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-sky-500/10 blur-3xl" />
            <div className="rounded-[2rem] border border-sky-300/12 bg-slate-950/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-sky-300/10 pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300/55">
                    What you can do
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-50">
                    A quick tour of the app
                  </p>
                </div>
                <div className="rounded-full bg-sky-400 px-3 py-1 text-xs font-medium text-slate-950">
                  Ready to go
                </div>
              </div>

              <div className="space-y-3 pt-4 text-sm leading-6 text-slate-200/80">
                <p>Start a channel for a topic, team, or class.</p>
                <p>Drop a question or a casual message into the right place.</p>
                <p>Keep the conversation going with threaded replies.</p>
                <p>Attach a screenshot when the problem needs a visual.</p>
                <p>Vote on helpful posts so the good stuff rises up.</p>
                <p>Search people and content without digging through noise.</p>
              </div>

              <div className="mt-5 rounded-2xl bg-sky-400 px-4 py-4 text-slate-950">
                <p className="text-sm font-medium">Light, quick, and organized.</p>
                <p className="mt-1 text-sm text-slate-950/75">
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
