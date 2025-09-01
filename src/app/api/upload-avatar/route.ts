import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { getPocketBase } from "@/services/pb";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure we have token for Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const fileLike = file as any;
  if (!fileLike || typeof fileLike.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const pb = getPocketBase();
  try {
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);

    const arrayBuffer: ArrayBuffer = await fileLike.arrayBuffer();
    const filenameSafe = String(fileLike.name || "avatar").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const objectName = `avatars/${profile.id}-${Date.now()}-${filenameSafe}`;
    const uploaded = await put(objectName, arrayBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: fileLike.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const photo_client = uploaded.url;
    await pb.collection("profiles").update(profile.id, { photo_client });

    return NextResponse.json({ url: photo_client });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json({ error: err?.message || "Upload error" }, { status });
  } finally {
    pb.authStore.clear();
  }
}
