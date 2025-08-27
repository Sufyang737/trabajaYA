"use client";

import { useRef, useState } from "react";
import { Heart, X } from "lucide-react";

type Item = {
  id: string;
  name: string;
  bio?: string;
  image?: string | null;
  location?: string;
  category: "workers" | "creators" | "providers";
  subcategoryLabel?: string;
};

export default function SwipeCards({ initialItems }: { initialItems: Item[] }) {
  const [index, setIndex] = useState(0);
  const items = initialItems;
  const topRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0, dx: 0, dy: 0, dragging: false });

  const current = items[index];
  const next = items[index + 1];

  function onDown(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    pos.current.dragging = true;
    if ("touches" in e && e.touches.length) {
      pos.current.x = e.touches[0].clientX;
      pos.current.y = e.touches[0].clientY;
    } else {
      const me = e as React.MouseEvent<HTMLDivElement>;
      pos.current.x = me.clientX;
      pos.current.y = me.clientY;
    }
  }
  function onMove(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    if (!pos.current.dragging) return;
    if ("touches" in e && e.touches.length) {
      pos.current.dx = e.touches[0].clientX - pos.current.x;
      pos.current.dy = e.touches[0].clientY - pos.current.y;
    } else {
      const me = e as React.MouseEvent<HTMLDivElement>;
      pos.current.dx = me.clientX - pos.current.x;
      pos.current.dy = me.clientY - pos.current.y;
    }
    if (topRef.current) {
      topRef.current.style.transform = `translate(${pos.current.dx}px, ${pos.current.dy}px) rotate(${pos.current.dx / 20}deg)`;
      topRef.current.style.transition = "none";
    }
  }
  function resetCard() {
    if (topRef.current) {
      topRef.current.style.transform = "";
      topRef.current.style.transition = "transform 200ms ease";
    }
    pos.current = { x: 0, y: 0, dx: 0, dy: 0, dragging: false };
  }
  function submitSwipe(action: "like" | "pass") {
    const offX = action === "like" ? 800 : -800;
    if (topRef.current) {
      topRef.current.style.transition = "transform 250ms ease";
      topRef.current.style.transform = `translate(${offX}px, ${pos.current.dy}px) rotate(${offX / 20}deg)`;
    }
    try {
      fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: current?.id, action }),
      }).catch(() => {});
    } catch {}
    setTimeout(() => {
      setIndex((i) => Math.min(i + 1, items.length));
      resetCard();
    }, 220);
  }

  function onUp() {
    if (!pos.current.dragging) return resetCard();
    const shouldLike = pos.current.dx > 100;
    const shouldSkip = pos.current.dx < -100;
    if (shouldLike) return submitSwipe("like");
    if (shouldSkip) return submitSwipe("pass");
    resetCard();
  }

  function actionSkip() {
    submitSwipe("pass");
  }
  function actionLike() {
    submitSwipe("like");
  }

  const remaining = items.length - index;

  if (!current) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-black/60">
        No hay más perfiles por ahora.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="relative h-[520px] w-full">
        {next && (
          <div className="absolute inset-0 -z-0 scale-[0.98] rounded-2xl border border-black/10 bg-white shadow-sm" />
        )}
        {current && (
          <div
            ref={topRef}
            className="absolute inset-0 z-10 select-none overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md"
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          >
            {current.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.image} alt={current.name} className="h-60 w-full object-cover" />
            ) : (
              <div className="h-60 w-full bg-brand/10" />
            )}
            <div className="grid gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{current.name}</h3>
                  <div className="mt-0.5 text-xs text-black/60">
                    {(current.subcategoryLabel || current.category) + (current.location ? ` • ${current.location}` : "")}
                  </div>
                </div>
                <div className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-black">{current.category}</div>
              </div>
              {current.bio && <p className="line-clamp-3 text-sm text-black/80">{current.bio}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <button onClick={actionSkip} className="btn btn-outline inline-flex items-center gap-1">
          <X className="h-4 w-4" /> Pasar
        </button>
        <div className="text-xs text-black/50">{remaining} restantes</div>
        <button onClick={actionLike} className="btn btn-primary inline-flex items-center gap-1">
          <Heart className="h-4 w-4" /> Me gusta
        </button>
      </div>
    </div>
  );
}
