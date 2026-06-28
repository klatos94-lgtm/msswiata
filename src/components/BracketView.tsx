"use client";

import type { Match } from "@/types/match";
import Flag from "@/components/Flag";
import { useServerTime } from "@/lib/server-time";

interface Props {
  matches: Match[];
}

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
        <span className="text-[10px] font-semibold text-slate-800 truncate max-w-[60px] leading-tight">
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
    return <div className="bg-white rounded border border-dashed border-slate-200 w-[130px] h-[38px] flex items-center justify-center text-[9px] text-slate-300">?</div>;
  }
  if (!hasTeams) {
    return (
      <div className="bg-white rounded border border-dashed border-slate-200 w-[130px] h-[38px] flex items-center justify-center text-[9px] text-slate-300">
        {new Date(match.match_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}{" "}
        {new Date(match.match_date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
      </div>
    );
  }

  const homeWin = match.finished && match.home_score != null && match.home_score > (match.away_score ?? 0);
  const awayWin = match.finished && match.away_score != null && match.away_score > (match.home_score ?? 0);
  const isLive = !match.finished && new Date(match.match_date) <= now;

  return (
    <div
      className={`
        bg-white rounded border w-[130px] divide-y divide-slate-100
        ${match.finished ? "border-emerald-300" : isLive ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"}
      `}
    >
      <TeamLine team={match.home_team} score={match.home_score} winner={homeWin} />
      <TeamLine team={match.away_team} score={match.away_score} winner={awayWin} />
    </div>
  );
}

function BracketPair({
  matches,
  top,
  bottom,
  target,
}: {
  matches: Match[];
  top: number;
  bottom: number;
  target: number;
}) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-0">
        <div className="flex items-center">
          <MatchBox match={getMatch(matches, top)} />
          <div className="w-2.5 h-px bg-slate-300" />
        </div>
        <div className="flex items-center">
          <MatchBox match={getMatch(matches, bottom)} />
          <div className="w-2.5 h-px bg-slate-300" />
        </div>
      </div>
      <div className="flex flex-col items-center mx-0">
        <div className="w-px h-[19px] bg-slate-300" />
        <div className="w-3 h-px bg-slate-300" />
        <div className="w-px h-[19px] bg-slate-300" />
      </div>
      <div className="flex items-center">
        <div className="w-2.5 h-px bg-slate-300" />
        <MatchBox match={getMatch(matches, target)} />
      </div>
    </div>
  );
}

function ConnectorLine({ height }: { height: number }) {
  return (
    <div className="flex flex-col items-center" style={{ height }}>
      <div className="w-px flex-1 bg-slate-300" />
    </div>
  );
}

function ConnectorSplit() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-[19px] bg-slate-300" />
      <div className="w-3 h-px bg-slate-300" />
      <div className="w-px h-[19px] bg-slate-300" />
    </div>
  );
}

export default function BracketView({ matches }: Props) {
  const topHalfPairs = [
    { top: 1, bottom: 4, target: 17 },
    { top: 3, bottom: 6, target: 18 },
    { top: 2, bottom: 5, target: 19 },
    { top: 7, bottom: 8, target: 20 },
  ];

  const bottomHalfPairs = [
    { top: 12, bottom: 11, target: 21 },
    { top: 10, bottom: 9, target: 22 },
    { top: 15, bottom: 14, target: 23 },
    { top: 13, bottom: 16, target: 24 },
  ];

  const qfPairs = [
    { top: 17, bottom: 18, target: 25 },
    { top: 21, bottom: 22, target: 26 },
    { top: 19, bottom: 20, target: 27 },
    { top: 23, bottom: 24, target: 28 },
  ];

  const sfPairs = [
    { top: 25, bottom: 26, target: 29 },
    { top: 27, bottom: 28, target: 30 },
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-0 min-w-[850px]">
        {/* Round 4 (1/16) + connectors → Round 5 (1/8) */}
        <div className="flex flex-col gap-3">
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">1/16</div>
          {topHalfPairs.map((p, i) => (
            <BracketPair key={`t${i}`} matches={matches} top={p.top} bottom={p.bottom} target={p.target} />
          ))}
          <div className="h-0" />
          {bottomHalfPairs.map((p, i) => (
            <BracketPair key={`b${i}`} matches={matches} top={p.top} bottom={p.bottom} target={p.target} />
          ))}
        </div>

        {/* Round 5 (1/8) + connectors → Round 6 (QF) */}
        <div className="flex flex-col justify-center gap-3 ml-4">
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">1/8</div>
          <div className="flex flex-col gap-0">
            {[17, 18, 19, 20, 21, 22, 23, 24].map((o, i) => (
              <div key={o} className="flex items-center">
                {i % 2 === 0 && <div className="w-2.5 h-px bg-slate-300" />}
                {i % 2 === 0 && <ConnectorSplit />}
                <div className={i % 2 === 0 ? "" : "ml-[45px]"}>
                  <MatchBox match={getMatch(matches, o)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
