"use client";

import { useState } from "react";

interface CreateReplyModalProps {
  postId: number;
  parentReplyId?: number | null;
  onReplyCreated?: () => void;
}

export default function CreateReplyModal({
  postId,
  parentReplyId,
  onReplyCreated,
}: CreateReplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          parentReplyId: parentReplyId || null,
          body,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create reply");
      }

      setBody("");
      setIsOpen(false);
      onReplyCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="border-2 border-blue-700 bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-900 shadow-[0_3px_0_0_rgba(29,78,216,0.35)] hover:bg-blue-200"
      >
        Reply
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border-2 border-slate-950 bg-white shadow-[0_20px_0_0_rgba(15,23,42,1)]">
            <div className="border-b-2 border-slate-950 bg-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Reply</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="border-2 border-red-700 bg-red-100 p-3 text-sm text-red-900">
                  {error}
                </div>
              )}

              <div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="w-full border-2 border-slate-950 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError("");
                  }}
                  className="flex-1 border-2 border-slate-950 bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:bg-slate-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 border-2 border-blue-700 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_0_0_rgba(29,78,216,0.5)] hover:bg-blue-600 disabled:opacity-50"
                  disabled={isLoading || !body.trim()}
                >
                  {isLoading ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
