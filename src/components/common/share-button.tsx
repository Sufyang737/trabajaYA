"use client";

import React from "react";
import { Copy, Check, X, Share2, ExternalLink } from "lucide-react";

type Props = {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function ShareButton({ url, title, text, className, children }: Props) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string>("");

  function onOpen() {
    setShareUrl(url || (typeof window !== "undefined" ? window.location.href : ""));
    setOpen(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (_) {
      // Fallback: select text for manual copy
      const ok = window.prompt("Copiá el enlace:", shareUrl);
      if (ok !== null) setCopied(true);
    }
  }

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        setOpen(false);
      }
    } catch (_) {
      // ignore cancel
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={onOpen}>
        {children ?? (
          <span className="inline-flex items-center gap-1">
            <Share2 className="h-4 w-4" /> Compartir
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md rounded-2xl border border-brand/15 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Compartir enlace</h3>
                  <p className="mt-1 text-sm text-black/70">Copiá y compartí la URL de esta publicación.</p>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-brand hover:bg-brand/5"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-brand/15 bg-white p-2">
                  <input
                    className="flex-1 rounded-lg border-none bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    value={shareUrl}
                    readOnly
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand/90"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>

                {typeof navigator !== "undefined" && (navigator as any).share && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-2 text-sm text-brand hover:bg-brand/5"
                  >
                    <ExternalLink className="h-4 w-4" /> Compartir con apps
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
