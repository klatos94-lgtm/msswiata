"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/types/user";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import Flag from "@/components/Flag";

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ nickname: string } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      loadLeaderboard();
      loadMatches();
    });
  }, []);

  const loadLeaderboard = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.rpc("get_leaderboard");
    if (data) {
      setEntries(data.map((r: { user_id: string; nickname: string; total_points: number }) => ({
        user_id: r.user_id,
        nickname: r.nickname,
        total_points: r.total_points,
      })));
    }
    setLoading(false);
  };

  const loadMatches = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (data) setMatches(data);
  };

  const handleSelectUser = async (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      return;
    }
    setSelectedUserId(userId);
    setUserPredictions([]);

    const supabase = getSupabaseClient();
    const { data } = await supabase.rpc("get_user_detail", { p_user_id: userId });
    if (data) {
      setSelectedUser({ nickname: data.nickname });
      setUserPredictions(data.predictions ?? []);
    }
  };

  const finishedMatches = matches.filter((m) => m.finished);

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Ranking</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Klasyfikacja graczy</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Ładowanie...</div>
        ) : (
          <LeaderboardTable entries={entries} onSelect={handleSelectUser} />
        )}
      </div>

      {selectedUserId && selectedUser && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
          <div className="bg-[#001e28] px-4 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-bold">
                {selectedUser.nickname || "Nieznany"}
              </div>
              <div className="text-slate-400 text-[10px] font-medium">
                Zakończone mecze &middot; {finishedMatches.length} meczów
              </div>
            </div>
            <button
              onClick={() => setSelectedUserId(null)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div>
            {finishedMatches.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Brak zakończonych meczów.
              </div>
            ) : (
              finishedMatches.map((match) => {
                const pred = userPredictions.find((p) => p.match_id === match.id);
                const matchDate = new Date(match.match_date);
                const day = `${String(matchDate.getDate()).padStart(2, "0")}.${String(matchDate.getMonth() + 1).padStart(2, "0")}.`;
                return (
                  <div key={match.id} className="flex items-center px-3 py-2 gap-2 hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0">
                    <div className="w-14 flex-shrink-0 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
                    </div>
                    <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
                      <span className="text-[13px] font-semibold text-slate-700 truncate text-right max-w-[90px]">{match.home_team}</span>
                      <Flag team={match.home_team} className="flex-shrink-0" />
                    </div>
                    <div className="flex-shrink-0 text-center min-w-[40px]">
                      <span className="text-sm font-extrabold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md tabular-nums">
                        {match.home_score}:{match.away_score}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                      <Flag team={match.away_team} className="flex-shrink-0" />
                      <span className="text-[13px] font-semibold text-slate-700 truncate max-w-[90px]">{match.away_team}</span>
                    </div>
                    <div className="w-16 flex-shrink-0 text-right">
                      {pred ? (
                        <div>
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            {pred.predicted_home}:{pred.predicted_away}
                          </span>
                          {pred.points !== null && pred.points !== undefined && (
                            <span className="text-[10px] font-bold text-emerald-600 ml-1">
                              +{pred.points}pkt
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
