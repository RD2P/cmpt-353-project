import type { RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";

export type SearchChannel = RowDataPacket & {
  id: number;
  name: string;
};

export type ContentSearchResult = RowDataPacket & {
  kind: "POST" | "REPLY";
  contentId: number;
  postId: number;
  replyId: number | null;
  channelId: number;
  channelName: string;
  postTitle: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
  authorEmail: string;
  score: number;
};

export type UserPostCountResult = RowDataPacket & {
  id: number;
  displayName: string;
  email: string;
  postCount: number;
};

function buildLikePattern(value: string): string {
  return `%${value.trim()}%`;
}

function buildChannelClause(channelId: number | null | undefined, alias: string): string {
  return channelId ? ` AND ${alias}.\`channelId\` = ?` : "";
}

export async function getSearchChannels(): Promise<SearchChannel[]> {
  const db = getDbPool();
  const [rows] = await db.execute<SearchChannel[]>(
    "SELECT `id`, `name` FROM `Channel` ORDER BY `name` ASC",
  );
  return rows;
}

export async function searchContent(options: {
  contentQuery?: string;
  authorQuery?: string;
  channelId?: number | null;
  page: number;
  limit: number;
}): Promise<{ results: ContentSearchResult[]; hasMore: boolean }> {
  const { contentQuery, authorQuery, channelId, page, limit } = options;
  const contentTerm = contentQuery?.trim() ?? "";
  const authorTerm = authorQuery?.trim() ?? "";

  if (contentTerm.length === 0 && authorTerm.length === 0) {
    return { results: [], hasMore: false };
  }

  const offset = Math.max(page - 1, 0) * limit;
  const postParams: Array<string | number> = [];
  const replyParams: Array<string | number> = [];

  const postWhere: string[] = [];
  const replyWhere: string[] = [];

  if (contentTerm.length > 0) {
    const pattern = buildLikePattern(contentTerm);
    postWhere.push("(p.`title` LIKE ? OR p.`body` LIKE ?)");
    replyWhere.push("r.`body` LIKE ?");
    postParams.push(pattern, pattern);
    replyParams.push(pattern);
  }

  if (authorTerm.length > 0) {
    const pattern = buildLikePattern(authorTerm);
    postWhere.push("(u.`displayName` LIKE ? OR u.`email` LIKE ?)");
    replyWhere.push("(u.`displayName` LIKE ? OR u.`email` LIKE ?)");
    postParams.push(pattern, pattern);
    replyParams.push(pattern, pattern);
  }

  if (channelId) {
    postWhere.push("p.`channelId` = ?");
    replyWhere.push("p.`channelId` = ?");
    postParams.push(channelId);
    replyParams.push(channelId);
  }

  const postSql = `
    SELECT
      'POST' AS kind,
      p.id AS contentId,
      p.id AS postId,
      NULL AS replyId,
      p.channelId AS channelId,
      c.name AS channelName,
      p.title AS postTitle,
      p.body AS body,
      p.createdAt AS createdAt,
      u.displayName AS authorDisplayName,
      u.email AS authorEmail,
      COALESCE(SUM(v.value), 0) AS score
    FROM Post p
    INNER JOIN User u ON u.id = p.authorId
    INNER JOIN Channel c ON c.id = p.channelId
    LEFT JOIN Vote v ON v.targetType = 'POST' AND v.targetId = p.id
    ${postWhere.length > 0 ? `WHERE ${postWhere.join(" AND ")}` : ""}
    GROUP BY p.id, p.channelId, c.name, p.title, p.body, p.createdAt, u.displayName, u.email
  `.replaceAll("\u007f", "`");

  const replySql = `
    SELECT
      'REPLY' AS kind,
      r.id AS contentId,
      r.postId AS postId,
      r.id AS replyId,
      p.channelId AS channelId,
      c.name AS channelName,
      p.title AS postTitle,
      r.body AS body,
      r.createdAt AS createdAt,
      u.displayName AS authorDisplayName,
      u.email AS authorEmail,
      COALESCE(SUM(v.value), 0) AS score
    FROM Reply r
    INNER JOIN Post p ON p.id = r.postId
    INNER JOIN User u ON u.id = r.authorId
    INNER JOIN Channel c ON c.id = p.channelId
    LEFT JOIN Vote v ON v.targetType = 'REPLY' AND v.targetId = r.id
    ${replyWhere.length > 0 ? `WHERE ${replyWhere.join(" AND ")}` : ""}
    GROUP BY r.id, r.postId, p.channelId, c.name, p.title, r.body, r.createdAt, u.displayName, u.email
  `.replaceAll("\u007f", "`");

  const finalParams = [...postParams, ...replyParams, limit + 1, offset];
  const sql = `
    SELECT *
    FROM (
      ${postSql}
      UNION ALL
      ${replySql}
    ) AS content_results
    ORDER BY createdAt DESC, score DESC, contentId DESC
    LIMIT ? OFFSET ?
  `;

  const db = getDbPool();
  const [rows] = await db.execute<ContentSearchResult[]>(sql, finalParams);

  return {
    results: rows.slice(0, limit),
    hasMore: rows.length > limit,
  };
}

export async function getTopUsersByPosts(limit = 10, ascending = false): Promise<UserPostCountResult[]> {
  const db = getDbPool();
  const [rows] = await db.execute<UserPostCountResult[]>(
    `SELECT
      u.id AS id,
      u.displayName AS displayName,
      u.email AS email,
      COUNT(p.id) AS postCount
    FROM User u
    LEFT JOIN Post p ON p.authorId = u.id
    GROUP BY u.id, u.displayName, u.email
    ORDER BY postCount ${ascending ? "ASC" : "DESC"}, u.displayName ASC
    LIMIT ?`.replaceAll("\u007f", "`"),
    [limit],
  );
  return rows;
}

export async function getRankedContent(options: {
  channelId?: number | null;
  limit?: number;
  ascending?: boolean;
}): Promise<ContentSearchResult[]> {
  const { channelId, limit = 10, ascending = false } = options;
  const direction = ascending ? "ASC" : "DESC";
  const postParams: Array<string | number> = [];
  const replyParams: Array<string | number> = [];

  const postChannelClause = buildChannelClause(channelId, "p");
  const replyChannelClause = buildChannelClause(channelId, "p");

  if (channelId) {
    postParams.push(channelId);
    replyParams.push(channelId);
  }

  const sql = `
    SELECT *
    FROM (
      SELECT
        'POST' AS kind,
        p.id AS contentId,
        p.id AS postId,
        NULL AS replyId,
        p.channelId AS channelId,
        c.name AS channelName,
        p.title AS postTitle,
        p.body AS body,
        p.createdAt AS createdAt,
        u.displayName AS authorDisplayName,
        u.email AS authorEmail,
        COALESCE(SUM(v.value), 0) AS score
      FROM Post p
      INNER JOIN User u ON u.id = p.authorId
      INNER JOIN Channel c ON c.id = p.channelId
      LEFT JOIN Vote v ON v.targetType = 'POST' AND v.targetId = p.id
      ${postChannelClause ? `WHERE 1 = 1${postChannelClause}` : ""}
      GROUP BY p.id, p.channelId, c.name, p.title, p.body, p.createdAt, u.displayName, u.email
      UNION ALL
      SELECT
        'REPLY' AS kind,
        r.id AS contentId,
        r.postId AS postId,
        r.id AS replyId,
        p.channelId AS channelId,
        c.name AS channelName,
        p.title AS postTitle,
        r.body AS body,
        r.createdAt AS createdAt,
        u.displayName AS authorDisplayName,
        u.email AS authorEmail,
        COALESCE(SUM(v.value), 0) AS score
      FROM Reply r
      INNER JOIN Post p ON p.id = r.postId
      INNER JOIN User u ON u.id = r.authorId
      INNER JOIN Channel c ON c.id = p.channelId
      LEFT JOIN Vote v ON v.targetType = 'REPLY' AND v.targetId = r.id
      ${replyChannelClause ? `WHERE 1 = 1${replyChannelClause}` : ""}
      GROUP BY r.id, r.postId, p.channelId, c.name, p.title, r.body, r.createdAt, u.displayName, u.email
    ) AS ranked_content
    ORDER BY score ${direction}, createdAt DESC, contentId DESC
    LIMIT ?
  `.replaceAll("\u007f", "`");

  const db = getDbPool();
  const [rows] = await db.execute<ContentSearchResult[]>(sql, [...postParams, ...replyParams, limit]);
  return rows;
}