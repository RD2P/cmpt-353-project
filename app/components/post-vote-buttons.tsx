"use client";

import { useState } from "react";

type PostVoteButtonsProps = {
  postId: number;
  initialScore: number;
  initialUserVote: number | null;
};

export default function PostVoteButtons({
  postId,
  initialScore,
  initialUserVote,
}: PostVoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitVote(value: 1 | -1) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "POST",
          targetId: postId,
          value,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        vote?: { score: number; userVote: number | null };
      };

      if (!response.ok || !data.vote) {
        window.alert(data.error ?? "Unable to vote.");
        return;
      }

      setScore(data.vote.score);
      setUserVote(data.vote.userVote);
    } catch {
      window.alert("Unable to vote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => submitVote(1)}
        className={`border-2 px-2 py-1 text-xs font-semibold shadow-[0_4px_0_0_rgba(15,23,42,0.35)] transition disabled:cursor-not-allowed disabled:opacity-70 ${
          userVote === 1
            ? "border-sky-700 bg-sky-300 text-slate-950"
            : "border-slate-950 bg-white text-slate-950 hover:bg-slate-100"
        }`}
      >
        👍
      </button>
      <span className="min-w-8 text-center text-xs font-semibold text-slate-700">{score}</span>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => submitVote(-1)}
        className={`border-2 px-2 py-1 text-xs font-semibold shadow-[0_4px_0_0_rgba(15,23,42,0.35)] transition disabled:cursor-not-allowed disabled:opacity-70 ${
          userVote === -1
            ? "border-rose-700 bg-rose-300 text-slate-950"
            : "border-slate-950 bg-white text-slate-950 hover:bg-slate-100"
        }`}
      >
        👎
      </button>
    </div>
  );
}
