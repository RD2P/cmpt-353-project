
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="w-full flex items-center justify-end gap-2 p-4">
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-md border border-foreground/20 px-3 py-2 text-sm hover:bg-foreground/5"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
        >
          Sign up
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to Que-Query
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
            Ask questions in channels, reply in threads, and share screenshots.
          </p>
        </div>
      </main>
    </div>
  );
}
