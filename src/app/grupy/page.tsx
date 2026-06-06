"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import Flag from "@/components/Flag";

interface TeamRow {
  team: string;
  pld: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

interface GroupData {
  group_label: string;
  teams: TeamRow[];
}

export default function GrupyPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
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
    const { data } = await supabase.rpc("get_group_table");
    if (Array.isArray(data)) setGroups(data);
    setLoading(false);
  };

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
          {groups.map((group) => (
            <div key={group.group_label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#001e28] px-3 py-2">
                <span className="text-white font-bold text-sm">Grupa {group.group_label}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="px-1 sm:px-2 py-1.5 text-left">#</th>
                      <th className="px-1 sm:px-2 py-1.5 text-left">Drużyna</th>
                      <th className="px-1 sm:px-1.5 py-1.5 text-center">M</th>
                      <th className="px-1 sm:px-1.5 py-1.5 text-center">W</th>
                      <th className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center">R</th>
                      <th className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center">P</th>
                      <th className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center">BZ</th>
                      <th className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center">BS</th>
                      <th className="px-1 sm:px-1.5 py-1.5 text-center">+/-</th>
                      <th className="px-1 sm:px-2 py-1.5 text-center font-bold">Pkt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((entry, idx) => {
                      const isTop2 = idx < 2;
                      return (
                        <tr
                          key={entry.team}
                          className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                            isTop2 ? "bg-emerald-50/40" : ""
                          }`}
                        >
                          <td className="px-1 sm:px-2 py-1.5 text-slate-400 font-medium text-center">
                            {isTop2 ? (
                              <span className="text-emerald-600 font-bold">{idx + 1}</span>
                            ) : (
                              idx + 1
                            )}
                          </td>
                          <td className="px-1 sm:px-2 py-1.5">
                            <span className="flex items-center gap-1">
                              <Flag team={entry.team} />
                              <span className="font-semibold text-slate-700 truncate max-w-[70px] sm:max-w-[120px]">
                                {entry.team}
                              </span>
                            </span>
                          </td>
                          <td className="px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.pld}</td>
                          <td className="px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.w}</td>
                          <td className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.d}</td>
                          <td className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.l}</td>
                          <td className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.gf}</td>
                          <td className="hidden sm:table-cell px-1 sm:px-1.5 py-1.5 text-center tabular-nums text-slate-600">{entry.ga}</td>
                          <td className={`px-1 sm:px-1.5 py-1.5 text-center tabular-nums font-medium ${
                            entry.gd > 0 ? "text-emerald-600" : entry.gd < 0 ? "text-red-500" : "text-slate-500"
                          }`}>
                            {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                          </td>
                          <td className="px-1 sm:px-2 py-1.5 text-center font-bold tabular-nums text-amber-600">{entry.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
