import { NextResponse } from "next/server";
import { issueChallenge } from "@/lib/server/pow";

/** Challenges are single-use-ish and time-bound, so they must never be cached. */
export const dynamic = "force-dynamic";

const PURPOSES = new Set(["order", "verify", "contact"]);

export async function GET(request: Request) {
  const purpose = new URL(request.url).searchParams.get("purpose") ?? "";

  if (!PURPOSES.has(purpose)) {
    return NextResponse.json({ error: "Unknown purpose." }, { status: 400 });
  }

  return NextResponse.json(issueChallenge(purpose), {
    headers: { "Cache-Control": "no-store" },
  });
}
