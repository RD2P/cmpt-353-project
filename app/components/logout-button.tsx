"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isSubmitting}
      className="inline-flex items-center justify-center border-2 border-red-700 bg-red-200 px-4 py-2 text-sm font-semibold text-red-950 shadow-[0_8px_0_0_rgba(127,29,29,0.35)] transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Logging out..." : "Log out"}
    </button>
  );
}
