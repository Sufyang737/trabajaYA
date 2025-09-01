"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function SaveJobButton({ jobId, className, variant = "button" }: { jobId: string; className?: string; variant?: "button" | "icon" }) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/saves/jobs?job_id=${encodeURIComponent(jobId)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setSaved(Boolean(json.saved));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      if (saved) {
        const res = await fetch(`/api/saves/jobs?job_id=${encodeURIComponent(jobId)}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        setSaved(false);
      } else {
        const res = await fetch(`/api/saves/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: jobId }),
        });
        if (!res.ok) throw new Error(await res.text());
        setSaved(true);
      }
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <>
        <SignedIn>
          <button
            type="button"
            onClick={toggle}
            disabled={loading}
            aria-pressed={saved}
            aria-label={saved ? "Quitar de guardados" : "Guardar"}
            className={
              className ||
              `inline-flex items-center justify-center rounded-full border border-black/10 ${saved ? "bg-brand text-white" : "bg-white text-black"} shadow-sm transition hover:shadow-md ${loading ? "opacity-60" : ""} h-9 w-9`
            }
          >
            <Bookmark className="h-4 w-4" {...(saved ? { fill: "currentColor" } : {})} />
          </button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              aria-label="Guardar"
              className={
                className ||
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:shadow-md"
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </SignInButton>
        </SignedOut>
      </>
    );
  }

  return (
    <>
      <SignedIn>
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className={className || (saved ? "btn" : "btn btn-outline")}
          aria-pressed={saved}
        >
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-4 w-4" {...(saved ? { fill: "currentColor" } : {})} /> {saved ? "Guardado" : "Guardar"}
          </span>
        </button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className={className || "btn btn-outline"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <span className="inline-flex items-center gap-1">
              <Bookmark className="h-4 w-4" /> Guardar
            </span>
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
