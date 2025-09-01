import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase } from "@/services/pb";

const ALLOWED_FIELDS = [
  "title",
  "description",
  "category",
  "subcategory",
  "price",
  "currency",
  "price_unit",
  "modality",
  "status",
  "expires_at",
  "city",
  "neighborhood",
  "photo_job",
] as const;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const job = await pb.collection("jobs").getOne(id);
    if (job.profile_id !== profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ record: job });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const body = await req.json();
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const job = await pb.collection("jobs").getOne(id);
    if (job.profile_id !== profile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payload: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) payload[key] = body[key];
    }

    const updated = await pb.collection("jobs").update(id, payload);
    return NextResponse.json({ record: updated });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status });
  } finally {
    pb.authStore.clear();
  }
}
