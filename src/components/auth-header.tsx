"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-base font-medium">
        Trabajaya
      </Link>
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-outline h-9">Sign in</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
