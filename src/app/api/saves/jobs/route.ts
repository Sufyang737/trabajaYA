import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase } from "@/services/pb";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("job_id");
    if (!jobId) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const filter = `profile_id = "${me.id}" && job_id = "${jobId}"`;
    const list = await pb.collection("saves").getList(1, 1, { filter });
    const saved = list.items.length > 0;
    return NextResponse.json({ saved, recordId: saved ? (list.items[0] as any).id : undefined });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status: err?.status || 500 });
  } finally {
    pb.authStore.clear();
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const body = await req.json();
    const job_id = body?.job_id as string | undefined;
    if (!job_id) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const record = await pb.collection("saves").create({ profile_id: me.id, job_id });
    return NextResponse.json({ record });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status: err?.status || 500 });
  } finally {
    pb.authStore.clear();
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("job_id");
    if (!jobId) return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const filter = `profile_id = "${me.id}" && job_id = "${jobId}"`;
    const list = await pb.collection("saves").getList(1, 1, { filter });
    if (!list.items.length) return NextResponse.json({ ok: true });
    const id = (list.items[0] as any).id;
    await pb.collection("saves").delete(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status: err?.status || 500 });
  } finally {
    pb.authStore.clear();
  }
}
