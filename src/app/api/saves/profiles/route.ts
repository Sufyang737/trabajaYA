import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase } from "@/services/pb";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pb = getPocketBase();
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("profile_id");
    if (!targetId) return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    // Use dedicated collection saved_profiles: saver_profile_id (me) and target_profile_id (profile being saved)
    const filter = `saver_profile_id = "${me.id}" && target_profile_id = "${targetId}"`;
    const list = await pb.collection("saved_profiles").getList(1, 1, { filter });
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
    const target_profile_id = body?.profile_id as string | undefined;
    if (!target_profile_id) return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const payload = { saver_profile_id: me.id, target_profile_id } as any;
    const record = await pb.collection("saved_profiles").create(payload);
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
    const targetId = searchParams.get("profile_id");
    if (!targetId) return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
    const me = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const filter = `saver_profile_id = "${me.id}" && target_profile_id = "${targetId}"`;
    const list = await pb.collection("saved_profiles").getList(1, 1, { filter });
    if (!list.items.length) return NextResponse.json({ ok: true });
    const id = (list.items[0] as any).id;
    await pb.collection("saved_profiles").delete(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json({ error: err?.message || "PocketBase error" }, { status: err?.status || 500 });
  } finally {
    pb.authStore.clear();
  }
}
