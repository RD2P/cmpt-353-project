"use client";

import { useState } from "react";

interface DeleteReplyButtonProps {
  replyId: number;
  onReplyDeleted?: () => void;
}

export default function DeleteReplyButton({ replyId, onReplyDeleted }: DeleteReplyButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/replies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      onReplyDeleted?.();
    } catch {
      alert("Failed to delete reply");
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="border-2 border-red-700 bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-[0_3px_0_0_rgba(185,28,28,0.35)] hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isLoading}
          className="border-2 border-slate-950 bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-950 shadow-[0_3px_0_0_rgba(15,23,42,0.35)] hover:bg-slate-300 disabled:opacity-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="border-2 border-red-700 bg-red-100 px-2 py-1 text-xs font-semibold text-red-900 shadow-[0_3px_0_0_rgba(185,28,28,0.35)] hover:bg-red-200"
    >
      Delete
    </button>
  );
}
