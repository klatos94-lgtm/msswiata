import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testMatches = [
    { round: 0, home_team: "Polska", away_team: "Niemcy", match_date: "2026-05-31T18:00:00Z" },
    { round: 0, home_team: "Brazylia", away_team: "Argentyna", match_date: "2026-05-31T18:00:00Z" },
    { round: 0, home_team: "Anglia", away_team: "Francja", match_date: "2026-05-31T18:00:00Z" },
  ];

  let added = 0;
  for (const m of testMatches) {
    const { data: existing } = await supabase
      .from("matches")
      .select("id")
      .eq("home_team", m.home_team)
      .eq("away_team", m.away_team)
      .eq("match_date", m.match_date);

    if (!existing || existing.length === 0) {
      const { error } = await supabase.from("matches").insert(m);
      if (!error) added++;
    }
  }

  return NextResponse.json({ success: true, added });
}
