"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { Match } from "@/types/match";
import { GROUPS } from "@/lib/groups";
import Flag from "@/components/Flag";

interface TeamStats {
  team: string;
  group: string;
  pld: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export default function GrupyPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
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

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (matchesData) setMatches(matchesData);

    setLoading(false);
  };

  const finishedGroupMatches = matches.filter(
    (m) => m.finished && m.stage === 1
  );

  const statsByGroup = new Map<string, Map<string, TeamStats>>();

  for (const group of GROUPS) {
    const groupStats = new Map<string, TeamStats>();
    for (const team of group.teams) {
      groupStats.set(team, {
        team,
        group: group.label,
        pld: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      });
    }
    statsByGroup.set(group.label, groupStats);
  }

  for (const match of finishedGroupMatches) {
    if (match.home_score === null || match.away_score === null) continue;

    for (const [groupLabel, groupStats] of statsByGroup) {
      const home = groupStats.get(match.home_team);
      const away = groupStats.get(match.away_team);
      if (!home || !away) continue;

      home.pld++;
      away.pld++;
      home.gf += match.home_score;
      home.ga += match.away_score;
      away.gf += match.away_score;
      away.ga += match.home_score;

      if (match.home_score > match.away_score) {
        home.w++;
        home.pts += 3;
        away.l++;
      } else if (match.home_score < match.away_score) {
        away.w++;
        away.pts += 3;
        home.l++;
      } else {
        home.d++;
        home.pts += 1;
        away.d++;
        away.pts += 1;
      }

      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    }
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">🏟️</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Tabele Grup</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Mistrzostwa Świata 2026</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
          Ładowanie...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => {
            const stats = statsByGroup.get(group.label)!;
            const sorted = Array.from(stats.values()).sort((a, b) => {
              if (b.pts !== a.pts) return b.pts - a.pts;
              if (b.gd !== a.gd) return b.gd - a.gd;
              return b.gf - a.gf;
            });

            return (
              <div key={group.label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#001e28] px-3 py-2">
                  <span className="text-white font-bold text-sm">Grupa {group.label}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="px-2 py-1.5 text-left">#</th>
                        <th className="px-2 py-1.5 text-left">Drużyna</th>
                        <th className="px-1.5 py-1.5 text-center">M</th>
                        <th className="px-1.5 py-1.5 text-center">W</th>
                        <th className="px-1.5 py-1.5 text-center">R</th>
                        <th className="px-1.5 py-1.5 text-center">P</th>
                        <th className="px-1.5 py-1.5 text-center">BZ</th>
                        <th className="px-1.5 py-1.5 text-center">BS</th>
                        <th className="px-1.5 py-1.5 text-center">+/-</th>
                        <th className="px-2 py-1.5 text-center font-bold">Pkt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((entry, idx) => {
                        const isTop2 = idx < 2;
                        return (
                          <tr
                            key={entry.team}
                            className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                              isTop2 ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            <td className="px-2 py-1.5 text-slate-400 font-medium text-center">
                              {isTop2 ? (
                                <span className="text-emerald-600 font-bold">{idx + 1}</span>
                              ) : (
                                idx + 1
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="flex items-center gap-1">
                                <Flag team={entry.team} />
                                <span className="font-semibold text-slate-700 truncate max-w-[100px]">
                                  {entry.team.split(" ").pop()}
                                </span>
                              </span>
                            </td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.pld}</td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.w}</td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.d}</td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.l}</td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.gf}</td>
                            <td className="px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.ga}</td>
                            <td className={`px-1.5 py-1.5 text-center tabular-nums font-medium ${
                              entry.gd > 0 ? "text-emerald-600" : entry.gd < 0 ? "text-red-500" : "text-slate-500"
                            }`}>
                              {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                            </td>
                            <td className="px-2 py-1.5 text-center font-bold tabular-nums text-amber-600">{entry.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
