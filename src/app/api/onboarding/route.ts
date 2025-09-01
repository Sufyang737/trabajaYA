import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import PocketBase from "pocketbase";

type ProfilePatch = Partial<{
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  neighborhood: string;
  phone_number: string;
  bio: string;
  roles: string[];
  photo_client: string;
}>;

type PortfolioInput = Partial<{
  cv_url: string;
  courses_url: string;
  diplomas_url: string;
  links: string; // JSON string
}>;

type InterestInput = {
  category: string;
  subcategory?: string;
  is_job_seeker?: boolean;
  is_job_offerer?: boolean;
};

type AvailabilityItem = {
  day_of_week: string; // monday..sunday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_active?: boolean;
  work_mode?: string; // on_site | remote | hybrid
  notes?: string;
};

type OnboardingBody = {
  profile?: ProfilePatch;
  roles?: string[]; // fallback
  portfolio?: PortfolioInput;
  interests?: InterestInput[];
  weeklyAvailability?: AvailabilityItem[];
  finalize?: boolean;
  // Backward compatibility (old shape)
  first_name?: string;
  last_name?: string;
  country?: string;
  city?: string;
  neighborhood?: string;
  phone_number?: string;
  bio?: string;
  tags?: string; // old interests stringified
  links?: string; // old availability in JSON
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: OnboardingBody;
  try {
    body = (await req.json()) as OnboardingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pbUrl = process.env.POCKETBASE_URL || "https://pocketbase-trabajaya.srv.clostech.tech";
  const token = process.env.POCKETBASE_ADMIN_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing POCKETBASE_ADMIN_TOKEN" }, { status: 500 });

  const pb = new PocketBase(pbUrl);
  pb.authStore.save(token, null);

  try {
    const profile = await pb.collection("profiles").getFirstListItem(`clerk_id = "${userId}"`);

    // Build profile patch
    const profilePatch: Record<string, unknown> = {};

    const src: ProfilePatch = {
      ...body.profile,
      // support old shape
      first_name: body.profile?.first_name ?? body.first_name,
      last_name: body.profile?.last_name ?? body.last_name,
      country: body.profile?.country ?? body.country,
      city: body.profile?.city ?? body.city,
      neighborhood: body.profile?.neighborhood ?? body.neighborhood,
      phone_number: body.profile?.phone_number ?? body.phone_number,
      bio: body.profile?.bio ?? body.bio,
      roles: body.profile?.roles ?? body.roles,
      photo_client: body.profile?.photo_client,
    };

    for (const [k, v] of Object.entries(src)) {
      if (v !== undefined) profilePatch[k] = v;
    }

    // Derive flags from roles
    const roles = (src.roles || []) as string[];
    if (Array.isArray(roles) && roles.length) {
      profilePatch.is_job_offerer = roles.includes("provider");
      profilePatch.is_job_seeker = roles.includes("worker") || roles.includes("creator");
    }

    if (body.finalize) {
      profilePatch.is_onboarding_complete = true;
      if (!profilePatch.status) profilePatch.status = "active";
    }

    const updatedProfile = Object.keys(profilePatch).length
      ? await pb.collection("profiles").update(profile.id, profilePatch)
      : profile;

    // Portfolio upsert if provided
    if (body.portfolio) {
      const portfolioPayload: any = { ...body.portfolio, profile_id: profile.id };
      if (typeof portfolioPayload.links === "string") {
        try { portfolioPayload.links = JSON.parse(portfolioPayload.links); } catch {}
      }
      try {
        const existing = await pb
          .collection("portfolios")
          .getFirstListItem(`profile_id = "${profile.id}"`);
        await pb.collection("portfolios").update(existing.id, portfolioPayload);
      } catch (e: any) {
        // Not found -> create
        await pb.collection("portfolios").create(portfolioPayload);
      }
    }

    // Interests replace if provided
    if (Array.isArray(body.interests)) {
      // delete existing
      const existing = await pb
        .collection("interests")
        .getList(1, 200, { filter: `profile_id = "${profile.id}"` });
      await Promise.all(existing.items.map((it: any) => pb.collection("interests").delete(it.id)));

      const flags = {
        is_job_offerer: Boolean(profilePatch.is_job_offerer),
        is_job_seeker: Boolean(profilePatch.is_job_seeker),
      };
      for (const it of body.interests) {
        if (!it.category) continue;
        await pb.collection("interests").create({
          category: it.category,
          subcategory: it.subcategory ?? "",
          is_job_offerer: it.is_job_offerer ?? flags.is_job_offerer,
          is_job_seeker: it.is_job_seeker ?? flags.is_job_seeker,
          profile_id: profile.id,
        });
      }
    }

    // Weekly availability replace if provided
    if (Array.isArray(body.weeklyAvailability)) {
      const existing = await pb
        .collection("weekly_availabilities")
        .getList(1, 400, { filter: `profile_id = "${profile.id}"` });
      await Promise.all(
        existing.items.map((it: any) => pb.collection("weekly_availabilities").delete(it.id))
      );

      for (const a of body.weeklyAvailability) {
        if (!a.day_of_week || !a.start_time || !a.end_time) continue;
        await pb.collection("weekly_availabilities").create({
          profile_id: profile.id,
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time,
          is_active: a.is_active ?? true,
          work_mode: a.work_mode ?? "on_site",
          notes: a.notes ?? "",
        });
      }
    }

    return NextResponse.json({ ok: true, record: updatedProfile });
  } catch (e: any) {
    if (e?.status === 404) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e?.message || "PocketBase error" }, { status: 500 });
  } finally {
    pb.authStore.clear();
  }
}
