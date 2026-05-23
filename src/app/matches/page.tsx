"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import MatchCard from "@/components/MatchCard";

export default function MatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      loadData(data.user.id);
    });
  }, []);

  const loadData = async (userId: string) => {
    const supabase = getSupabaseClient();

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (matchesData) setMatches(matchesData);

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);
    if (predictionsData) setPredictions(predictionsData);
  };

  if (!user) return null;

  const upcoming = matches.filter((m) => !m.finished);
  const finished = matches.filter((m) => m.finished);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Mecze</h1>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-emerald-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Nadchodzące
          </h2>
          <div className="grid gap-4">
            {upcoming.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userId={user.id}
                userPrediction={
                  predictions.find((p) => p.match_id === match.id) || null
                }
              />
            ))}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            Zakończone
          </h2>
          <div className="grid gap-4">
            {finished.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userId={user.id}
                userPrediction={
                  predictions.find((p) => p.match_id === match.id) || null
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
