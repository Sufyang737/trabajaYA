import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "svix";
import PocketBase from "pocketbase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClerkEmailAddress = { id: string; email_address: string };
type ClerkPhoneNumber = { id: string; phone_number: string };

type UserCreatedEvent = {
  type: "user.created";
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    phone_numbers: ClerkPhoneNumber[];
    primary_email_address_id: string | null;
    primary_phone_number_id: string | null;
  };
};

type AnyEvent = { type: string; data: unknown };

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const body = await req.text();

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
  }

  let evt: AnyEvent;
  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt?.type as string | undefined;
  if (!eventType) {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  // Only act on user.created; acknowledge others
  if (eventType !== "user.created") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data } = evt as UserCreatedEvent;

  const emails = (data.email_addresses || []) as ClerkEmailAddress[];
  const primaryEmailId = data.primary_email_address_id as string | undefined;
  const email = emails.find((e) => e.id === primaryEmailId)?.email_address || emails[0]?.email_address || null;

  const phones = (data.phone_numbers || []) as ClerkPhoneNumber[];
  const primaryPhoneId = data.primary_phone_number_id as string | undefined;
  const phone = phones.find((p) => p.id === primaryPhoneId)?.phone_number || phones[0]?.phone_number || null;

  const profilePayload = {
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    email: email ?? "",
    clerk_id: data.id as string,
    phone_number: phone ?? "",
    bio: "",
    country: "",
    city: "",
    neighborhood: "",
    roles: ["provider"],
    is_job_seeker: true,
    is_job_offerer: true,
    tags: "[]",
    links: "[]",
    status: "draft",
    is_onboarding_complete: false,
  };

  const pbUrl = process.env.POCKETBASE_URL || "https://pocketbase-trabajaya.srv.clostech.tech";
  const pb = new PocketBase(pbUrl);

  try {
    // Admin auth via token only (preferred)
    const adminToken = process.env.POCKETBASE_ADMIN_TOKEN;
    if (!adminToken) {
      return NextResponse.json({ error: "Missing POCKETBASE_ADMIN_TOKEN" }, { status: 500 });
    }
    pb.authStore.save(adminToken, null);

    // Idempotencia: si ya existe un perfil con este clerk_id, no crear otro
    try {
      await pb.collection("profiles").getFirstListItem(`clerk_id = "${profilePayload.clerk_id}"`);
      return NextResponse.json({ ok: true, duplicate: true });
    } catch (_) {
      // not found -> proceed to create
    }

    const record = await pb.collection("profiles").create(profilePayload);
    return NextResponse.json({ ok: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "PocketBase error" }, { status: 500 });
  } finally {
    pb.authStore.clear();
  }
}
