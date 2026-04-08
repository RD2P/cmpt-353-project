"use client";

import { useState, useEffect } from "react";

interface AttachmentDisplayProps {
  postId: number;
}

interface Attachment {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export default function AttachmentDisplay({ postId }: AttachmentDisplayProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await fetch(`/api/attachments?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          setAttachments(data.attachments);
        }
      } catch {
        console.error("Failed to fetch attachments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachments();
  }, [postId]);

  if (isLoading) {
    return null;
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 border-t-2 border-slate-200 pt-3">
      <h4 className="text-sm font-semibold text-slate-700">Screenshots</h4>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <img
            key={attachment.id}
            src={`/api/attachments/${attachment.id}`}
            alt={attachment.filename}
            className="max-h-96 w-full rounded border-2 border-slate-300 bg-slate-100 object-contain"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
