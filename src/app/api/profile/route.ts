import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import PocketBase from "pocketbase";

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pbUrl = process.env.POCKETBASE_URL || "https://pocketbase-trabajaya.srv.clostech.tech";
  const token = process.env.POCKETBASE_ADMIN_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing POCKETBASE_ADMIN_TOKEN" }, { status: 500 });

  const pb = new PocketBase(pbUrl);
  pb.authStore.save(token, null);

  try {
    const record = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    return NextResponse.json({ record });
  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500;
    return NextResponse.json({ error: e?.message || "PocketBase error" }, { status });
  } finally {
    pb.authStore.clear();
  }
}

