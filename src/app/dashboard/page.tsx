"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import MatchCard from "@/components/MatchCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ nickname: string } | null>(null);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

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

    const { data: profileData } = await supabase
      .from("users")
      .select("nickname")
      .eq("id", userId)
      .single();
    if (profileData) setProfile(profileData);

    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (matches) {
      const upcoming = matches.find((m) => !m.finished);
      if (upcoming) setNextMatch(upcoming);
    }

    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);
    if (predictions) {
      setUserPredictions(predictions);
      const total = predictions.reduce(
        (sum, p) => sum + (p.points ?? 0),
        0
      );
      setTotalPoints(total);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <p className="text-gray-400 text-sm">Zalogowany jako</p>
        <p className="text-xl font-semibold">
          {profile?.nickname || user.email}
        </p>
        <p className="text-3xl font-bold text-yellow-400 mt-2">
          {totalPoints} pkt
        </p>
      </div>

      {nextMatch && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Następny mecz</h2>
          <MatchCard
            match={nextMatch}
            userId={user.id}
            userPrediction={
              userPredictions.find((p) => p.match_id === nextMatch.id) || null
            }
          />
        </div>
      )}
    </div>
  );
}
