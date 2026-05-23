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
      <h1 className="text-xl font-bold mb-4 text-slate-800">Dashboard</h1>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
            {(profile?.nickname || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-slate-500 text-xs">Zalogowany jako</p>
            <p className="text-slate-800 text-base font-semibold">
              {profile?.nickname || user.email}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-amber-600 text-xs font-medium">Punkty</p>
            <p className="text-2xl font-bold text-amber-700 mt-0.5">{totalPoints}</p>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-emerald-600 text-xs font-medium">Typy</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{userPredictions.length}</p>
          </div>
        </div>
      </div>

      {nextMatch && (
        <div>
          <h2 className="text-base font-semibold mb-2 text-slate-700">Następny mecz</h2>
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
