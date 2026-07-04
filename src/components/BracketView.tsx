"use client";

import type { Match } from "@/types/match";
import Flag from "@/components/Flag";
import { useServerTime } from "@/lib/server-time";
import { getMatchWinner } from "@/lib/winner";
import { roundLabels } from "@/lib/bracket";
import { useMemo } from "react";

interface Props {
  matches: Match[];
}

const MATCH_H = 44;

function getMatch(matches: Match[], order: number): Match | undefined {
  return matches.find((m) => m.bracket_order === order);
}

function teamDisplay(team: string): string {
  return team || "?";
}

function TeamLine({ team, score, winner }: { team: string; score: number | null; winner?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-1 px-2 py-0.5 ${winner ? "bg-emerald-50" : ""}`}>
      <div className="flex items-center gap-1 min-w-0">
        <Flag team={team} />
        <span className="text-[10px] font-semibold text-slate-800 truncate max-w-[80px] leading-tight">
          {teamDisplay(team)}
        </span>
      </div>
      {score != null && (
        <span className={`text-[11px] font-bold tabular-nums ${winner ? "text-emerald-700" : "text-slate-400"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

function MatchBox({ match }: { match?: Match }) {
  const { now } = useServerTime();
  const hasTeams = match?.home_team || match?.away_team;

  if (!match) {
    return <div className="bg-white rounded border border-dashed border-slate-200 w-[140px] h-[38px]" />;
  }
  if (!hasTeams) {
    return (
      <div className="bg-white rounded border border-dashed border-slate-200 w-[140px] h-[38px] flex items-center justify-center text-[9px] text-slate-300">
        {new Date(match.match_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}{" "}
        {new Date(match.match_date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
      </div>
    );
  }

  const winner = getMatchWinner(match);
  const homeWin = winner === match.home_team;
  const awayWin = winner === match.away_team;
  const isLive = !match.finished && new Date(match.match_date) <= now;

  return (
    <div
      className={`
        bg-white rounded border w-[140px] divide-y divide-slate-100
        ${match.finished ? "border-emerald-300" : isLive ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"}
      `}
    >
      <TeamLine team={match.home_team} score={match.home_score} winner={homeWin} />
      <TeamLine team={match.away_team} score={match.away_score} winner={awayWin} />
    </div>
  );
}

const COL_W = 140;
const GAP_COL = 48;

interface ColumnDef {
  label: string;
  orders: number[];
}

interface ConnectorDef {
  pairs: [number, number][];
  targets: number[];
}

export default function BracketView({ matches }: Props) {
  const layout = useMemo(() => {
    const positions = new Map<number, number>();
    const GAP = 4;

    const r4Visual: number[] = [1, 4, 3, 6, 2, 5, 7, 8, 12, 11, 10, 9, 15, 14, 13, 16];
    r4Visual.forEach((o, i) => {
      positions.set(o, i * (MATCH_H + GAP) + MATCH_H / 2);
    });

    const r4Pairs: [number, number][] = [
      [1, 4], [3, 6], [2, 5], [7, 8],
      [12, 11], [10, 9], [15, 14], [13, 16],
    ];
    const r5: number[] = [17, 18, 19, 20, 21, 22, 23, 24];
    r4Pairs.forEach(([a, b], i) => {
      positions.set(r5[i], (positions.get(a)! + positions.get(b)!) / 2);
    });

    const r5Pairs: [number, number][] = [
      [17, 18], [21, 22], [19, 20], [23, 24],
    ];
    const r6: number[] = [25, 26, 27, 28];
    r5Pairs.forEach(([a, b], i) => {
      positions.set(r6[i], (positions.get(a)! + positions.get(b)!) / 2);
    });

    const r6Pairs: [number, number][] = [[25, 26], [27, 28]];
    const r7: number[] = [29, 30];
    r6Pairs.forEach(([a, b], i) => {
      positions.set(r7[i], (positions.get(a)! + positions.get(b)!) / 2);
    });

    const r8FinalY = (positions.get(29)! + positions.get(30)!) / 2;
    positions.set(32, r8FinalY);
    positions.set(31, r8FinalY + MATCH_H + GAP);

    return { positions, r4Pairs, r5, r5Pairs, r6, r6Pairs, r7 };
  }, []);

  const columns: ColumnDef[] = [
    { label: roundLabels[5]?.short ?? "1/8", orders: layout.r5 },
    { label: roundLabels[6]?.short ?? "QF", orders: layout.r6 },
    { label: roundLabels[7]?.short ?? "SF", orders: [29, 30] },
    { label: roundLabels[8]?.short ?? "F", orders: [32, 31] },
  ];

  const connectors: ConnectorDef[] = [
    { pairs: layout.r4Pairs, targets: layout.r5 },
    { pairs: layout.r5Pairs, targets: layout.r6 },
    { pairs: layout.r6Pairs, targets: [29, 30] },
    { pairs: [[29, 30], [29, 30]], targets: [32, 31] },
  ];

  const totalH = Math.max(...layout.positions.values()) + MATCH_H + 20;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-0 min-w-[950px]" style={{ height: totalH }}>
        {/* Round 4 label column */}
        <div style={{ width: COL_W }}>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
            {roundLabels[4]?.short ?? "1/16"}
          </div>
          <div className="relative">
            {[1, 4, 3, 6, 2, 5, 7, 8, 12, 11, 10, 9, 15, 14, 13, 16].map((order) => {
              const y = layout.positions.get(order) ?? 0;
              return (
                <div key={order} className="absolute" style={{ top: y - MATCH_H / 2 + 2, left: 0 }}>
                  <MatchBox match={getMatch(matches, order)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Connector + Round 5+ columns */}
        {columns.map((col, ci) => {
          const conn = connectors[ci];
          return (
            <div key={ci} className="flex">
              {/* SVG connector */}
              <svg
                className="flex-shrink-0 pointer-events-none"
                style={{ width: GAP_COL, height: totalH, overflow: "visible" }}
              >
                {conn.pairs.map(([a, b], i) => {
                  const y1 = layout.positions.get(a) ?? 0;
                  const y2 = layout.positions.get(b) ?? 0;
                  const t = conn.targets[i];
                  const yT = layout.positions.get(t) ?? 0;
                  const midY = (y1 + y2) / 2;
                  return (
                    <g key={i}>
                      <path
                        d={`M 0 ${y1} L ${GAP_COL * 0.4} ${y1} L ${GAP_COL * 0.4} ${midY} L ${GAP_COL * 0.6} ${midY} L ${GAP_COL * 0.6} ${yT} L ${GAP_COL} ${yT}`}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                      <path
                        d={`M 0 ${y2} L ${GAP_COL * 0.4} ${y2} L ${GAP_COL * 0.4} ${midY}`}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Column */}
              <div style={{ width: COL_W }}>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                  {col.label}
                </div>
                <div className="relative">
                  {col.orders.map((order) => {
                    const y = layout.positions.get(order) ?? 0;
                    return (
                      <div key={order} className="absolute" style={{ top: y - MATCH_H / 2 + 2, left: 0 }}>
                        <MatchBox match={getMatch(matches, order)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
