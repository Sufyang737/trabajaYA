"use client";

import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePanel() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <UserProfile
        appearance={{
          elements: {
            card: "shadow-none border-0",
            navbar: "hidden",
          },
        }}
      />
    </div>
  );
}

