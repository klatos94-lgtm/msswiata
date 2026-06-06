"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import PredictionForm from "@/components/PredictionForm";
import Flag from "@/components/Flag";

function MatchRow({
  match,
  pred,
  userId,
  onSave,
}: {
  match: Match;
  pred: Prediction | null;
  userId: string;
  onSave?: () => void;
}) {
  const matchDate = new Date(match.match_date);
  const now = new Date();
  const isPast = matchDate < now;
  const isFinished = match.finished;

  const day = `${String(matchDate.getDate()).padStart(2, "0")}.${String(matchDate.getMonth() + 1).padStart(2, "0")}.`;
  const time = matchDate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });

  return (
    <div className={`px-2 sm:px-3 py-2 sm:py-2.5 transition-colors border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 ${isFinished ? "" : ""}`}>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="w-12 sm:w-14 flex-shrink-0 text-center">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-tight">{day}</div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-700 tabular-nums">{time}</div>
        </div>

        <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="flex-1 text-right truncate">
            <span className="text-[11px] sm:text-[13px] font-semibold text-slate-700">{match.home_team}</span>
          </div>
          <div className="flex-shrink-0">
            <Flag team={match.home_team} className="flex-shrink-0" />
          </div>
        </div>

        <div className="flex-shrink-0 w-14 sm:w-16 text-center">
          {isFinished && match.home_score !== null ? (
            <span className="text-xs sm:text-sm font-extrabold text-black tabular-nums">
              {match.home_score}:{match.away_score}
            </span>
          ) : isPast ? (
            <span className="text-[10px] sm:text-[11px] font-bold text-red-400">🔒</span>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600">VS</span>
          )}
          {isFinished && pred && pred.points !== null && (
            <div className="text-[9px] sm:text-[10px] font-bold text-emerald-600 leading-tight">+{pred.points}</div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="flex-shrink-0">
            <Flag team={match.away_team} className="flex-shrink-0" />
          </div>
          <div className="flex-1 text-left truncate">
            <span className="text-[11px] sm:text-[13px] font-semibold text-slate-700">{match.away_team}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right min-w-[60px] sm:min-w-0">
          {isFinished ? (
            pred ? (
              <span className={`text-[10px] sm:text-[11px] font-semibold ${
                pred.points && pred.points > 0 ? "text-emerald-600" : "text-slate-400"
              }`}>
                {pred.predicted_home}:{pred.predicted_away}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-slate-300">—</span>
            )
          ) : isPast ? (
            pred ? (
              <span className="text-[10px] sm:text-[11px] font-semibold text-red-400">
                {pred.predicted_home}:{pred.predicted_away}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] text-slate-300">—</span>
            )
          ) : (
            <PredictionForm
              matchId={match.id}
              userId={userId}
              matchDate={match.match_date}
              existingPrediction={pred}
              onSave={onSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeRound, setActiveRound] = useState(0);

  const loadData = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.rpc("get_matches_with_predictions", { p_user_id: userId });
    if (data) {
      if (Array.isArray(data.matches)) setMatches(data.matches);
      if (Array.isArray(data.predictions)) setPredictions(data.predictions);
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });
  }, []);

  if (!user) return null;

  const byRound = new Map<number, Match[]>();
  for (const match of matches) {
    const r = match.round ?? 1;
    if (!byRound.has(r)) byRound.set(r, []);
    byRound.get(r)!.push(match);
  }

  const sortedRounds = [...byRound.entries()].sort(([a], [b]) => a - b);
  const roundKeys = sortedRounds.map(([r]) => r);

  const nearestRound = (() => {
    if (matches.length === 0) return 1;
    const now = new Date();
    const nearest = sortedRounds.find(([, ms]) =>
      ms.some(m => new Date(m.match_date) > now)
    );
    return nearest ? nearest[0] : roundKeys[roundKeys.length - 1] || 1;
  })();

  const currentRound = activeRound || nearestRound;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Mistrzostwa Świata</h1>
              <p className="text-emerald-400 text-[11px] font-medium">2026 &middot; Typy</p>
            </div>
          </div>
        </div>

        <div className="flex border-t border-white/10">
          {roundKeys.length === 0 ? (
            <div className="px-4 py-2 text-[11px] font-semibold text-slate-400">
Typy
            </div>
          ) : (
            roundKeys.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRound(r)}
                className={`px-4 py-2 text-[11px] font-semibold transition-colors ${
                  currentRound === r
                    ? "border-b-2 border-emerald-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Kolejka {r}
              </button>
            ))
          )}
        </div>
      </div>

      {roundKeys.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <p className="text-slate-500 text-sm">
            Brak meczów w bazie.{' '}
            <span className="text-emerald-600 font-medium">Uruchom seed SQL w Supabase.</span>
          </p>
        </div>
      )}

      {roundKeys.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {roundKeys.map((r) => (
            <div key={r} className={r === currentRound ? "" : "hidden"}>
              {(byRound.get(r) || []).map((match) => {
                const pred = predictions.find((p) => p.match_id === match.id) || null;
                return (
                  <MatchRow
                    key={match.id}
                    match={match}
                    pred={pred}
                    userId={user.id}
                    onSave={() => loadData(user.id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
