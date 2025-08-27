import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase } from "@/services/pb";

type Body = {
  profile_id?: string;
  action?: "like" | "pass";
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.profile_id || !body?.action) {
    return NextResponse.json({ error: "Missing profile_id or action" }, { status: 400 });
  }

  const pb = getPocketBase();
  try {
    const record = await pb.collection("swipes").create({
      clerk_id: userId,
      profile_id: body.profile_id,
      action: body.action,
    });
    return NextResponse.json({ record });
  } catch (e: unknown) {
    const error = e as { status?: number; message?: string };
    const status = typeof error?.status === "number" ? error.status : 500;
    return NextResponse.json({ error: error?.message || "PocketBase error" }, { status });
  } finally {
    pb.authStore.clear();
  }
}

