"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import PredictionForm from "@/components/PredictionForm";
import Flag from "@/components/Flag";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ nickname: string } | null>(null);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctResults, setCorrectResults] = useState(0);
  const [exactScores, setExactScores] = useState(0);
  const [allMatches, setAllMatches] = useState<Match[]>([]);

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
      setAllMatches(matches);
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const todayEnd = new Date(todayStart.getTime() + 86400000);
      const today = matches.filter((m) => {
        const d = new Date(m.match_date);
        return d >= todayStart && d < todayEnd;
      });
      setTodayMatches(today);
    }

    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);
    if (predictions) {
      setUserPredictions(predictions);
      const total = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
      setTotalPoints(total);
      setCorrectResults(predictions.filter((p) => p.points === 1).length);
      setExactScores(predictions.filter((p) => p.points === 3).length);
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Dashboard</h1>
            <p className="text-emerald-400 text-[11px] font-medium">
              {profile?.nickname || user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Punkty</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5 tabular-nums">{totalPoints}</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Typy</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5 tabular-nums">{userPredictions.length}</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Trafione wyniki</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5 tabular-nums">{correctResults}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">1 pkt za trafiony rezultat</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Trafione typy</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5 tabular-nums">{exactScores}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">3 pkt za dokładny wynik</p>
        </div>
      </div>

      <div className="animate-slide-up">
        <h2 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
          {todayMatches.length > 0 ? "Mecze dzisiaj" : "Brak meczów dzisiaj"}
        </h2>

        {todayMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
            <p className="text-slate-500 text-sm">Dzisiaj nie ma żadnych meczów.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {todayMatches.map((match) => {
              const pred = userPredictions.find((p) => p.match_id === match.id) || null;
              const matchDate = new Date(match.match_date);
              const now = new Date();
              const locked = matchDate <= now;
              const finished = match.finished;

              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all ${
                    locked && !finished
                      ? "border-red-400 bg-red-50/30"
                      : finished
                      ? "border-slate-200"
                      : "border-emerald-200"
                  }`}
                >
                  <div className="flex items-center px-3 py-2.5 gap-2">
                    <div className="w-16 flex-shrink-0 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase leading-tight">
                        {`${String(matchDate.getDate()).padStart(2, "0")}.${String(matchDate.getMonth() + 1).padStart(2, "0")}.`}
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 tabular-nums">
                        {matchDate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" })}
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                      <span className="text-[13px] font-semibold text-slate-700 truncate text-right max-w-[110px]">
                        {match.home_team}
                      </span>
                      <Flag team={match.home_team} className="flex-shrink-0" />
                    </div>

                    <div className="flex-shrink-0 min-w-[50px] text-center">
                      {finished && match.home_score !== null ? (
                        <span className="text-sm font-extrabold text-slate-800 tabular-nums bg-slate-100 px-2 py-0.5 rounded-md">
                          {match.home_score}:{match.away_score}
                        </span>
                      ) : locked ? (
                        <span className="text-[10px] font-bold text-red-400">🔒</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600">VS</span>
                      )}
                    </div>

                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <Flag team={match.away_team} className="flex-shrink-0" />
                      <span className="text-[13px] font-semibold text-slate-700 truncate max-w-[110px]">
                        {match.away_team}
                      </span>
                    </div>

                    <div className="w-14 flex-shrink-0 text-right">
                      {pred ? (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          finished
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-amber-600 bg-amber-50 border border-amber-200"
                        }`}>
                          {pred.predicted_home}:{pred.predicted_away}
                        </span>
                      ) : locked ? (
                        <span className="text-[10px] text-slate-400">—</span>
                      ) : null}
                    </div>
                  </div>

                  {!locked && !finished && (
                    <div className="pb-2 px-3">
                      <PredictionForm
                        matchId={match.id}
                        userId={user.id}
                        matchDate={match.match_date}
                        existingPrediction={pred}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
