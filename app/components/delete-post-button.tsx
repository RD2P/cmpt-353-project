"use client";

import { useState } from "react";

type DeletePostButtonProps = {
  postId: number;
};

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    const shouldDelete = window.confirm("Delete this post?");
    if (!shouldDelete) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Unable to delete post.");
        return;
      }

      window.location.reload();
    } catch {
      window.alert("Unable to delete post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isSubmitting}
      className="border-2 border-red-700 bg-red-200 px-2 py-1 text-xs font-semibold text-red-950 shadow-[0_4px_0_0_rgba(127,29,29,0.35)] transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Deleting..." : "Delete"}
    </button>
  );
}
