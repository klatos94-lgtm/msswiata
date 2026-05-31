import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import matchesData from "../../../../data/matches.json";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error: deleteError } = await supabase.from("predictions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { error: deleteMatchesError } = await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteMatchesError) return NextResponse.json({ error: deleteMatchesError.message }, { status: 500 });

  const { error: insertError } = await supabase.from("matches").insert(matchesData);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ success: true, count: matchesData.length });
}
