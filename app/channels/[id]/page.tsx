import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import CreatePostModal from "@/app/components/create-post-modal";
import DeletePostButton from "@/app/components/delete-post-button";
import LogoutButton from "@/app/components/logout-button";
import PostVoteButtons from "@/app/components/post-vote-buttons";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

type ChannelRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
};

type PostRow = RowDataPacket & {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
  authorRole: "USER" | "ADMIN";
  voteScore: number;
  userVote: number | null;
};

function formatPostTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const channelId = Number(id);

  if (!Number.isInteger(channelId) || channelId <= 0) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);
  const isSignedIn = session !== null;
  const isAdmin = session?.role === "ADMIN";

  const db = getDbPool();
  const [channelRows] = await db.execute<ChannelRow[]>(
    "SELECT `id`, `name`, `description` FROM `Channel` WHERE `id` = ? LIMIT 1",
    [channelId],
  );

  if (channelRows.length === 0) {
    notFound();
  }

  const channel = channelRows[0];
  let posts: PostRow[] = [];

  if (isSignedIn) {
    const [rows] = await db.execute<PostRow[]>(
      "SELECT p.`id`, p.`title`, p.`body`, p.`createdAt`, u.`displayName` AS `authorDisplayName`, u.`role` AS `authorRole`, COALESCE(SUM(v.`value`), 0) AS `voteScore`, MAX(CASE WHEN v.`userId` = ? THEN v.`value` ELSE NULL END) AS `userVote` FROM `Post` p INNER JOIN `User` u ON u.`id` = p.`authorId` LEFT JOIN `Vote` v ON v.`targetType` = 'POST' AND v.`targetId` = p.`id` WHERE p.`channelId` = ? GROUP BY p.`id`, p.`title`, p.`body`, p.`createdAt`, u.`displayName`, u.`role` ORDER BY p.`createdAt` DESC",
      [session.userId, channelId],
    );
    posts = rows;
  } else {
    const [rows] = await db.execute<PostRow[]>(
      "SELECT p.`id`, p.`title`, p.`body`, p.`createdAt`, u.`displayName` AS `authorDisplayName`, u.`role` AS `authorRole`, COALESCE(SUM(v.`value`), 0) AS `voteScore`, NULL AS `userVote` FROM `Post` p INNER JOIN `User` u ON u.`id` = p.`authorId` LEFT JOIN `Vote` v ON v.`targetType` = 'POST' AND v.`targetId` = p.`id` WHERE p.`channelId` = ? GROUP BY p.`id`, p.`title`, p.`body`, p.`createdAt`, u.`displayName`, u.`role` ORDER BY p.`createdAt` DESC",
      [channelId],
    );
    posts = rows;
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center border-2 border-slate-950 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-100"
        >
          Back
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
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-950">#{channel.name}</h1>
            {channel.description ? <p className="text-slate-700">{channel.description}</p> : null}
          </div>
        </div>
      </section>

      <section className="space-y-3 border-2 border-slate-950 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">Posts</h2>
          {isSignedIn ? <CreatePostModal channelId={channelId} /> : null}
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-700">No posts in this channel yet.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.id} className="space-y-2 border-2 border-slate-950 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">{post.title}</h3>
                  <div className="flex items-center gap-2">
                    {isSignedIn ? (
                      <PostVoteButtons
                        postId={post.id}
                        initialScore={Number(post.voteScore ?? 0)}
                        initialUserVote={post.userVote === null ? null : Number(post.userVote)}
                      />
                    ) : null}
                    {isAdmin ? <DeletePostButton postId={post.id} /> : null}
                  </div>
                </div>
                <p className="text-sm text-slate-800">{post.body}</p>
                <p className="text-xs font-medium text-slate-600">
                  By {post.authorDisplayName}
                  {post.authorRole === "ADMIN" ? " 👑" : ""} · {formatPostTimestamp(post.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
