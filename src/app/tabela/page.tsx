"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import Flag from "@/components/Flag";
import BracketView from "@/components/BracketView";
import { useServerTime } from "@/lib/server-time";

interface UserRow {
  id: string;
  nickname: string;
}

type MatchStatus = "future" | "live" | "finished";

function getMatchStatus(match: Match, now: Date): MatchStatus {
  if (match.finished) return "finished";
  if (new Date(match.match_date) <= now) return "live";
  return "future";
}

const statusConfig: Record<MatchStatus, { dot: string; label: string; rowBg: string }> = {
  finished: { dot: "bg-emerald-500", label: "Koniec", rowBg: "" },
  live: { dot: "bg-amber-500 animate-pulse", label: "Live", rowBg: "bg-amber-50/30" },
  future: { dot: "bg-slate-300", label: "Nadchodzi", rowBg: "" },
};

export default function TabelaPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-slate-100 rounded-2xl h-96" />}>
      <TabelaContent />
    </Suspense>
  );
}

function TabelaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bracketMatches, setBracketMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const view = searchParams.get("view") === "bracket" ? "bracket" : "table";

  const setView = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`/tabela?${params.toString()}`);
  };

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient();
    const [cartesianRes, bracketRes] = await Promise.all([
      supabase.rpc("get_cartesian_table"),
      supabase.from("matches").select("*").not("bracket_order", "is", null).order("bracket_order", { ascending: true }),
    ]);
    if (cartesianRes.data) {
      if (Array.isArray(cartesianRes.data.users)) setUsers(cartesianRes.data.users);
      if (Array.isArray(cartesianRes.data.matches)) setMatches(cartesianRes.data.matches);
      if (Array.isArray(cartesianRes.data.predictions)) setPredictions(cartesianRes.data.predictions);
    }
    if (bracketRes.data) {
      setBracketMatches(bracketRes.data as Match[]);
    }
    setLoading(false);
  }, []);

  const { now } = useServerTime();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      loadData();
    });
  }, [loadData]);

  const predictionMap = new Map<string, Prediction>();
  for (const p of predictions) {
    predictionMap.set(`${p.user_id}_${p.match_id}`, p);
  }

  function shortenName(name: string): string {
    if (name.length <= 8) return name;
    return name.slice(0, 7) + "…";
  }

  if (!user) return null;

  function renderCell(match: Match, u: UserRow, isLastRow: boolean) {
    const key = `${u.id}_${match.id}`;
    const pred = predictionMap.get(key);
    const isCurrentUser = u.id === user!.id;
                  const status = getMatchStatus(match, now);

    let cellClass = "px-1 sm:px-1.5 py-1 text-center";
    if (isCurrentUser) cellClass += " border-l-2 border-r-2 border-emerald-300";
    if (isCurrentUser && isLastRow) cellClass += " border-b-2";
    const textWeight = isCurrentUser ? "font-extrabold" : "font-semibold";

    if (!pred || pred.predicted_home === null) {
      let dash = "text-slate-300";
      if (status === "finished") dash = "text-red-200";
      if (isCurrentUser && status !== "finished") dash = "text-slate-300";
      return (
        <td key={`${u.id}_${match.id}`} className={cellClass}>
          <span className={`${dash}`}>—</span>
        </td>
      );
    }

    if (status !== "finished") {
      return (
        <td key={`${u.id}_${match.id}`} className={cellClass}>
          <span className={`text-[11px] ${textWeight} tabular-nums text-slate-600`}>
            {pred.predicted_home}:{pred.predicted_away}
          </span>
        </td>
      );
    }

    const pts = pred.points ?? 0;
    const colorClass =
      pts >= 3 ? "text-emerald-600" :
      pts >= 1 ? "text-amber-600" :
      "text-red-400";
    const bgClass =
      pts >= 3 ? "bg-emerald-50/50" :
      pts >= 1 ? "bg-amber-50/50" :
      "bg-red-50/50";
    return (
      <td key={`${u.id}_${match.id}`} className={`${cellClass} ${bgClass}`}>
        <span className={`text-[11px] ${textWeight} tabular-nums ${colorClass}`}>
          {pred.predicted_home}:{pred.predicted_away}
        </span>
      </td>
    );
  }

  const colWidth = users.length > 10 ? 44 : 52;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-gradient-to-br from-slate-900 to-[#001e28] rounded-2xl shadow-lg px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${view === 'bracket' ? 'bg-amber-500/15 ring-amber-500/20' : 'bg-emerald-500/15 ring-emerald-500/20'}`}>
              <span className="text-lg">{view === 'bracket' ? '🏆' : '📊'}</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">{view === 'bracket' ? 'Drabinka' : 'Tabela Kartezjańska'}</h1>
              <p className="text-emerald-400/80 text-[11px] font-medium">{view === 'bracket' ? 'Faza pucharowa' : `${users.length} graczy &middot; ${matches.length} meczów`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 mr-3">
              {view === 'table' && (
                <>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Koniec</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Live</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Nadchodzi</span>
                </>
              )}
            </div>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                view === 'table'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setView('bracket')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                view === 'bracket'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Drabinka
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      ) : view === "bracket" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <BracketView matches={bracketMatches} />
        </div>
      ) : (
        <div className="bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-sm -mx-4 sm:-mx-0">
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-50">
                  <th className="sticky left-0 bg-slate-50 z-30 px-2 sm:px-3 py-2 text-slate-500 font-semibold uppercase tracking-wider text-[10px] w-[100px] sm:w-[220px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                    Data / Mecz
                  </th>
                  {users.map((u) => (
                    <th
                      key={u.id}
                      style={{ width: users.length > 10 ? 44 : 52 }}
                      className={`sticky top-0 z-20 px-1 py-2 text-center sm:w-[72px] ${
                        u.id === user.id
                          ? "bg-slate-50 text-emerald-700 font-extrabold border-t-2 border-l-2 border-r-2 border-emerald-300"
                          : "bg-slate-50 text-slate-500 font-medium"
                      }`}
                    >
                      <div className="text-[9px] sm:text-[10px] leading-tight truncate max-w-[44px] sm:max-w-[64px] mx-auto">
                        {shortenName(u.nickname || "User")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.map((match, matchIdx) => {
                  const isLastRow = matchIdx === matches.length - 1;
                  const d = new Date(match.match_date);
                  const day = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
                  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const status = getMatchStatus(match, now);
                  const cfg = statusConfig[status];
                  const isPast24h = status === "live" || (status === "finished" && (now.getTime() - d.getTime()) < 86400000);

                  return (
                    <tr key={match.id} className={`transition-colors ${cfg.rowBg} ${isPast24h ? "hover:bg-slate-50" : "hover:bg-slate-50/60"}`}>
                      <td className="sticky left-0 bg-white z-10 px-2 sm:px-3 py-2 w-[100px] sm:w-[220px] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[6px] after:bg-gradient-to-r after:from-black/5 after:to-transparent">
                        <div className="flex items-start gap-2">
                          <div className="hidden sm:flex flex-col items-center pt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">{day}</span>
                            <span className="text-[8px] font-medium text-slate-300">{time}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 leading-snug break-words">
                                <Flag team={match.home_team} />{" "}
                                <span className="hidden sm:inline">{match.home_team}</span>
                                <span className="sm:hidden">{match.home_team.split(" ").pop()}</span>{" "}
                                {match.finished ? (
                                  <span className="font-bold text-slate-800">{match.home_score}:{match.away_score}</span>
                                ) : (
                                  <span className="text-slate-400 font-medium">vs</span>
                                )}{" "}
                                <Flag team={match.away_team} />{" "}
                                <span className="hidden sm:inline">{match.away_team}</span>
                                <span className="sm:hidden">{match.away_team.split(" ").pop()}</span>
                              </span>
                            </div>
                            <div className="sm:hidden text-[8px] text-slate-400 font-medium mt-0.5">{day.slice(0, 5)} {time}</div>
                          </div>
                        </div>
                      </td>
                      {users.map((u) => renderCell(match, u, isLastRow))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
