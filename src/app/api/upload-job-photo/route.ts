import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file") as any;
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    const filenameSafe = String(file.name || "job").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const objectName = `jobs/${userId}-${Date.now()}-${filenameSafe}`;
    const uploaded = await put(objectName, arrayBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: uploaded.url });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err?.message || "Upload error" }, { status: 500 });
  }
}

