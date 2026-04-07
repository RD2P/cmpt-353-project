"use client";

import { useState } from "react";

type EditPostModalProps = {
  postId: number;
  initialTitle: string;
  initialBody: string;
};

export default function EditPostModal({
  postId,
  initialTitle,
  initialBody,
}: EditPostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, title, body }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Unable to update post.");
        return;
      }

      setIsOpen(false);
      window.location.reload();
    } catch {
      window.alert("Unable to update post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onCancel() {
    setTitle(initialTitle);
    setBody(initialBody);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border-2 border-blue-700 bg-blue-200 px-2 py-1 text-xs font-semibold text-blue-950 shadow-[0_4px_0_0_rgba(30,58,138,0.35)] transition hover:-translate-y-0.5 hover:bg-blue-100"
      >
        Edit
      </button>

      {isOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg border-2 border-slate-950 bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]"
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-950">Edit Post</h2>

            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border-2 border-slate-950 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="body" className="block text-sm font-medium text-slate-700">
                Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full border-2 border-slate-950 px-3 py-2 text-sm"
                rows={5}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 border-2 border-green-700 bg-green-200 px-3 py-2 text-sm font-semibold text-green-950 shadow-[0_4px_0_0_rgba(6,95,70,0.35)] transition hover:-translate-y-0.5 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="border-2 border-slate-700 bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_4px_0_0_rgba(51,65,85,0.35)] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
