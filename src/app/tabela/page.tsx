"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import { getFlag } from "@/lib/flags";

interface UserRow {
  id: string;
  nickname: string;
  email: string;
}

export default function TabelaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const loadData = async () => {
    const supabase = getSupabaseClient();

    const { data: usersData } = await supabase
      .from("users")
      .select("id, nickname, email");
    if (usersData) setUsers(usersData);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (matchesData) setMatches(matchesData);

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*");
    if (predictionsData) setPredictions(predictionsData);

    setLoading(false);
  };

  const predictionMap = new Map<string, Prediction>();
  for (const p of predictions) {
    predictionMap.set(`${p.user_id}_${p.match_id}`, p);
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Tabela Kartezjańska</h1>
            <p className="text-emerald-400 text-[11px] font-medium">{users.length} graczy &middot; {matches.length} meczów</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
          Ładowanie...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="sticky left-0 bg-white z-10 px-2 py-1.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[130px] border-r border-slate-100">
                    Data / Mecz
                  </th>
                  {users.map((u) => (
                    <th
                      key={u.id}
                      className={`px-1.5 py-1 text-center font-medium min-w-[52px] max-w-[64px] border-r border-slate-100 last:border-r-0 ${
                        u.id === user.id
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-500"
                      }`}
                    >
                      <div className="text-[10px] leading-tight truncate">
                        {u.nickname || u.email?.split("@")[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const d = new Date(match.match_date);
                  const day = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
                  return (
                    <tr key={match.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="sticky left-0 bg-white z-10 px-2 py-1.5 border-r border-slate-100">
                        <div className="text-[10px] text-slate-600 font-medium leading-tight truncate max-w-[140px]">
                          <span className="text-slate-400">{day}</span>{" "}
                          {getFlag(match.home_team)} {match.home_team.split(" ").pop()}{" "}
                          {match.finished ? (
                            <span className="font-bold text-slate-800">
                              {match.home_score}:{match.away_score}
                            </span>
                          ) : (
                            <span className="text-slate-300">?:?</span>
                          )}{" "}
                          {getFlag(match.away_team)} {match.away_team.split(" ").pop()}
                        </div>
                      </td>
                      {users.map((u) => {
                        const key = `${u.id}_${match.id}`;
                        const pred = predictionMap.get(key);
                        const isCurrentUser = u.id === user.id;

                        let cellClass = "px-1.5 py-1 text-center border-r border-slate-100 last:border-r-0";
                        if (isCurrentUser) cellClass += " bg-emerald-50/40";

                        if (!match.finished) {
                          return (
                            <td key={match.id} className={cellClass}>
                              <span className="text-slate-300">—</span>
                            </td>
                          );
                        }

                        if (!pred) {
                          return (
                            <td key={match.id} className={cellClass}>
                              <span className="text-red-300">—</span>
                            </td>
                          );
                        }

                        const pts = pred.points ?? 0;
                        const colorClass =
                          pts >= 3 ? "text-green-600" :
                          pts >= 1 ? "text-yellow-600" :
                          "text-red-400";
                        return (
                          <td key={match.id} className={cellClass}>
                            <span className={`text-[11px] font-semibold tabular-nums ${colorClass}`}>
                              {pred.predicted_home}:{pred.predicted_away}
                            </span>
                          </td>
                        );
                      })}
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
