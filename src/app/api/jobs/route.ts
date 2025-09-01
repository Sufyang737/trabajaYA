import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPocketBase } from "@/services/pb";

interface JobInput {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price?: number;
  currency?: string;
  price_unit?: string;
  modality?: string;
  status?: string;
  expires_at?: string;
  city?: string;
  neighborhood?: string;
  photo_job?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: JobInput;
  try {
    body = (await req.json()) as JobInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pb = getPocketBase();

  try {
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const record = await pb.collection("jobs").create({
      ...body,
      profile_id: profile.id,
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

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pb = getPocketBase();

  try {
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("perPage") || 20);
    const sort = searchParams.get("sort") || "-created";

    const list = await pb.collection("jobs").getList(page, perPage, {
      filter: `profile_id = "${profile.id}"`,
      sort,
    });
    return NextResponse.json(list);
  } catch (e: unknown) {
    const error = e as { status?: number; message?: string };
    const status = typeof error?.status === "number" ? error.status : 500;
    return NextResponse.json({ error: error?.message || "PocketBase error" }, { status });
  } finally {
    pb.authStore.clear();
  }
}
