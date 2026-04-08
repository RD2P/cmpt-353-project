"use client";

import { useEffect, useState } from "react";
import CreateReplyModal from "./create-reply-modal";
import DeleteReplyButton from "./delete-reply-button";

interface Reply {
  id: number;
  postId: number;
  parentReplyId: number | null;
  authorId: number;
  body: string;
  createdAt: string;
  authorDisplayName: string;
}

interface ReplyListProps {
  postId: number;
  isSignedIn: boolean;
  currentUserId?: number;
  isAdmin?: boolean;
  parentReplyId?: number | null;
  depth?: number;
}

function formatReplyTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ReplyList({
  postId,
  isSignedIn,
  currentUserId,
  isAdmin,
  parentReplyId = null,
  depth = 0,
}: ReplyListProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`/api/replies?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          setReplies(data.replies);
        }
      } catch {
        console.error("Failed to fetch replies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [postId, refreshKey]);

  const currentLevelReplies = replies.filter((r) => r.parentReplyId === parentReplyId);

  if (depth === 0 && isLoading) {
    return <div className="text-sm text-slate-600">Loading replies...</div>;
  }

  return (
    <div className={depth === 0 ? "space-y-2" : ""}>
      {currentLevelReplies.length === 0 && depth === 0 ? (
        <p className="text-sm text-slate-600">No replies yet.</p>
      ) : null}

      {currentLevelReplies.map((reply) => (
        <div key={reply.id} className={depth > 0 ? "border-l-4 border-slate-300 pl-4" : ""}>
          <div className="space-y-2 border-2 border-slate-300 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold text-slate-950">{reply.authorDisplayName}</span>
                <span className="text-xs text-slate-600"> • {formatReplyTimestamp(reply.createdAt)}</span>
              </div>
              {isSignedIn && (currentUserId === reply.authorId || isAdmin) ? (
                <DeleteReplyButton
                  replyId={reply.id}
                  onReplyDeleted={() => setRefreshKey((k) => k + 1)}
                />
              ) : null}
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-800">{reply.body}</p>
            {isSignedIn ? (
              <CreateReplyModal
                postId={postId}
                parentReplyId={reply.id}
                onReplyCreated={() => setRefreshKey((k) => k + 1)}
              />
            ) : null}
          </div>

          {/* Nested replies */}
          {replies.some((r) => r.parentReplyId === reply.id) ? (
            <div className="mt-2">
              <ReplyList
                postId={postId}
                isSignedIn={isSignedIn}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                parentReplyId={reply.id}
                depth={depth + 1}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
