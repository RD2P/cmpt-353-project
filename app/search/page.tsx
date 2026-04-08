import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "@/app/components/logout-button";
import {
  getRankedContent,
  getSearchChannels,
  getTopUsersByPosts,
  searchContent,
  type ContentSearchResult,
} from "@/lib/search";
import { readSessionToken, sessionCookie } from "@/lib/session";
import type { ReactNode } from "react";

function getFirstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function buildContentLink(result: ContentSearchResult): string {
  const anchor = result.kind === "REPLY" ? `#reply-${result.replyId}` : `#post-${result.postId}`;
  return `/channels/${result.channelId}${anchor}`;
}

function buildAuthorLink(author: string): string {
  const params = new URLSearchParams({ mode: "author", author });
  return `/search?${params.toString()}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode = getFirstParam(params.mode);
  const contentQuery = getFirstParam(params.q).trim();
  const authorQuery = getFirstParam(params.author).trim();
  const page = parsePositiveInt(getFirstParam(params.page)) ?? 1;
  const channelId = parsePositiveInt(getFirstParam(params.channelId));

  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);
  const isSignedIn = session !== null;
  const isAdmin = session?.role === "ADMIN";

  const [channels, contentData, topUsers, lowUsers, topContent, lowContent] = await Promise.all([
    getSearchChannels(),
    mode === "content" || mode === "author"
      ? searchContent({
          contentQuery: mode === "content" ? contentQuery : undefined,
          authorQuery: mode === "author" ? authorQuery : undefined,
          channelId,
          page,
          limit: 10,
        })
      : Promise.resolve({ results: [], hasMore: false }),
    mode === "top-users" ? getTopUsersByPosts(10, false) : Promise.resolve([]),
    mode === "bottom-users" ? getTopUsersByPosts(10, true) : Promise.resolve([]),
    mode === "top-content" ? getRankedContent({ channelId, limit: 10, ascending: false }) : Promise.resolve([]),
    mode === "bottom-content" ? getRankedContent({ channelId, limit: 10, ascending: true }) : Promise.resolve([]),
  ]);

  const selectedChannelId = channelId ? String(channelId) : "";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-100"
        >
          Home
        </Link>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <div className="relative inline-flex items-center border-2 border-emerald-700 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-[0_6px_0_0_rgba(6,95,70,0.35)]">
              {session.displayName}
              {isAdmin ? (
                <span className="absolute -right-2 -top-2 border-2 border-amber-700 bg-amber-200 px-1 text-[10px] leading-none shadow-[0_3px_0_0_rgba(146,64,14,0.35)]">
                  👑
                </span>
              ) : null}
            </div>
          ) : null}
          {isSignedIn ? <LogoutButton /> : null}
        </div>
      </div>

      <section className="space-y-3 border-2 border-slate-950 bg-white p-6 shadow-[0_14px_0_0_rgba(15,23,42,1)]">
        <div className="inline-flex items-center border-2 border-slate-950 bg-sky-100 px-3 py-1 text-xs font-semibold text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
          Search
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-950">Find posts, replies, and authors</h1>
          <p className="max-w-3xl text-sm text-slate-700">
            Search by substring, filter by channel, find content by author, or jump directly to the
            highest and lowest ranked content.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form method="get" action="/search" className="space-y-3 border-2 border-slate-950 bg-slate-50 p-4">
            <input type="hidden" name="mode" value="content" />
            <input type="hidden" name="page" value="1" />
            <h2 className="text-lg font-semibold text-slate-950">Substring search</h2>
            <label className="block text-sm font-medium text-slate-900">
              Search text
              <input
                name="q"
                defaultValue={mode === "content" ? contentQuery : ""}
                required
                minLength={2}
                className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
                placeholder="Search posts and replies"
              />
            </label>
            <label className="block text-sm font-medium text-slate-900">
              Channel filter
              <select
                name="channelId"
                defaultValue={selectedChannelId}
                className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
              >
                <option value="">All channels</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center border-2 border-sky-700 bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(30,64,175,0.45)] hover:bg-sky-300"
            >
              Search content
            </button>
          </form>

          <form method="get" action="/search" className="space-y-3 border-2 border-slate-950 bg-slate-50 p-4">
            <input type="hidden" name="mode" value="author" />
            <input type="hidden" name="page" value="1" />
            <h2 className="text-lg font-semibold text-slate-950">Content by author</h2>
            <label className="block text-sm font-medium text-slate-900">
              Author name or email
              <input
                name="author"
                defaultValue={mode === "author" ? authorQuery : ""}
                required
                minLength={2}
                className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
                placeholder="Search by display name or email"
              />
            </label>
            <label className="block text-sm font-medium text-slate-900">
              Channel filter
              <select
                name="channelId"
                defaultValue={selectedChannelId}
                className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
              >
                <option value="">All channels</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center border-2 border-sky-700 bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(30,64,175,0.45)] hover:bg-sky-300"
            >
              Search author
            </button>
          </form>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/search?mode=top-users"
            className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Most posts
          </Link>
          <Link
            href="/search?mode=bottom-users"
            className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Least posts
          </Link>
          <Link
            href={`/search?mode=top-content${channelId ? `&channelId=${channelId}` : ""}`}
            className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Highest ranked content
          </Link>
          <Link
            href={`/search?mode=bottom-content${channelId ? `&channelId=${channelId}` : ""}`}
            className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(15,23,42,1)] transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Lowest ranked content
          </Link>
        </div>
      </section>

      {mode.length === 0 ? (
        <section className="space-y-2 border-2 border-slate-950 bg-slate-50 p-4">
          <h2 className="text-xl font-semibold text-slate-950">Choose a search mode</h2>
          <p className="text-sm text-slate-700">
            Use one of the forms above to search text or author names, or open one of the ranking
            views.
          </p>
        </section>
      ) : null}

      {mode === "content" ? (
        <ResultSection
          title={`Search results for “${contentQuery}”`}
          description={channelId ? `Filtered to #${channels.find((channel) => channel.id === channelId)?.name ?? channelId}` : "Across all channels"}
          emptyMessage="No posts or replies matched that text."
          page={page}
          hasMore={contentData.hasMore}
          nextHref={buildNextHref({ mode: "content", q: contentQuery, channelId, page })}
        >
          {contentData.results.map((result) => (
            <ContentCard key={`${result.kind}-${result.contentId}`} result={result} />
          ))}
        </ResultSection>
      ) : null}

      {mode === "author" ? (
        <ResultSection
          title={`Content by ${authorQuery}`}
          description={channelId ? `Filtered to #${channels.find((channel) => channel.id === channelId)?.name ?? channelId}` : "Across all channels"}
          emptyMessage="No content matched that author."
          page={page}
          hasMore={contentData.hasMore}
          nextHref={buildNextHref({ mode: "author", author: authorQuery, channelId, page })}
        >
          {contentData.results.map((result) => (
            <ContentCard key={`${result.kind}-${result.contentId}`} result={result} />
          ))}
        </ResultSection>
      ) : null}

      {mode === "top-users" ? (
        <ResultSection title="Users with the most posts" description="Sorted by post count descending" emptyMessage="No users found.">
          {topUsers.map((user) => (
            <Link
              key={user.id}
              href={buildAuthorLink(user.displayName)}
              className="flex items-center justify-between gap-3 border-2 border-slate-950 bg-white p-3 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-950">{user.displayName}</span>
              <span className="text-sm font-medium text-slate-700">{user.postCount} posts</span>
            </Link>
          ))}
        </ResultSection>
      ) : null}

      {mode === "bottom-users" ? (
        <ResultSection title="Users with the least posts" description="Sorted by post count ascending" emptyMessage="No users found.">
          {lowUsers.map((user) => (
            <Link
              key={user.id}
              href={buildAuthorLink(user.displayName)}
              className="flex items-center justify-between gap-3 border-2 border-slate-950 bg-white p-3 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-950">{user.displayName}</span>
              <span className="text-sm font-medium text-slate-700">{user.postCount} posts</span>
            </Link>
          ))}
        </ResultSection>
      ) : null}

      {mode === "top-content" ? (
        <ResultSection title="Highest ranked content" description="Score = sum of vote values" emptyMessage="No content found.">
          {topContent.map((result) => (
            <ContentCard key={`${result.kind}-${result.contentId}`} result={result} />
          ))}
        </ResultSection>
      ) : null}

      {mode === "bottom-content" ? (
        <ResultSection title="Lowest ranked content" description="Score = sum of vote values" emptyMessage="No content found.">
          {lowContent.map((result) => (
            <ContentCard key={`${result.kind}-${result.contentId}`} result={result} />
          ))}
        </ResultSection>
      ) : null}
    </main>
  );
}

function buildNextHref({
  mode,
  q,
  author,
  channelId,
  page,
}: {
  mode: "content" | "author";
  q?: string;
  author?: string;
  channelId: number | null;
  page: number;
}): string {
  const params = new URLSearchParams({ mode, page: String(page + 1) });

  if (mode === "content" && q) {
    params.set("q", q);
  }

  if (mode === "author" && author) {
    params.set("author", author);
  }

  if (channelId) {
    params.set("channelId", String(channelId));
  }

  return `/search?${params.toString()}`;
}

function ResultSection({
  title,
  description,
  emptyMessage,
  page,
  hasMore,
  nextHref,
  children,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  page?: number;
  hasMore?: boolean;
  nextHref?: string;
  children: ReactNode;
}) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <section className="space-y-3 border-2 border-slate-950 bg-slate-50 p-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-700">{description}</p>
        {page ? <p className="text-xs font-medium text-slate-600">Page {page}</p> : null}
      </div>
      {childArray.filter(Boolean).length === 0 ? (
        <p className="text-sm text-slate-700">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
      {hasMore && nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-100"
        >
          Load more
        </Link>
      ) : null}
    </section>
  );
}

function ContentCard({ result }: { result: ContentSearchResult }) {
  return (
    <article className="space-y-2 border-2 border-slate-950 bg-white p-4 shadow-[0_6px_0_0_rgba(15,23,42,1)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span className="border border-slate-300 bg-slate-100 px-2 py-1">{result.kind}</span>
            <span>#{result.channelName}</span>
            <span>Score {result.score}</span>
          </div>
          <Link href={buildContentLink(result)} className="text-base font-semibold text-slate-950 underline">
            {result.postTitle}
          </Link>
        </div>
        <Link
          href={buildAuthorLink(result.authorDisplayName)}
          className="text-sm font-semibold text-sky-800 underline"
        >
          {result.authorDisplayName}
        </Link>
      </div>
      <p className="text-sm text-slate-700">{truncate(result.body, 220)}</p>
      <p className="text-xs font-medium text-slate-500">{formatTimestamp(result.createdAt)}</p>
    </article>
  );
}