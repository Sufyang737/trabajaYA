"use client";

import { ClipLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center py-16">
      <ClipLoader color="#3b82f6" size={28} />
    </div>
  );
}

