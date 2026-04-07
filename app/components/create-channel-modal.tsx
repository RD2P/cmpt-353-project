"use client";

import { FormEvent, useState } from "react";

export default function CreateChannelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeModal() {
    setIsOpen(false);
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to create channel.");
        return;
      }

      window.location.reload();
    } catch {
      setError("Unable to create channel.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center border-2 border-sky-700 bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_0_0_rgba(30,64,175,0.45)] transition hover:-translate-y-0.5 hover:bg-sky-300"
      >
        Create channel
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="w-full max-w-md border-2 border-slate-950 bg-white p-5 shadow-[0_14px_0_0_rgba(15,23,42,1)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">New channel</h3>
              <button
                type="button"
                onClick={closeModal}
                className="border-2 border-slate-950 bg-white px-2 py-1 text-xs font-semibold text-slate-950 shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-slate-900">
                Channel name
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={64}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-900">
                Description (optional)
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="mt-1 w-full resize-y border-2 border-slate-950 bg-white px-3 py-2 text-slate-950 outline-none focus:bg-slate-100"
                />
              </label>

              {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border-2 border-slate-950 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_6px_0_0_rgba(15,23,42,1)] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 border-sky-700 bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_6px_0_0_rgba(30,64,175,0.45)] hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
