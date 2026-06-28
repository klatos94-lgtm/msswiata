"use client";

import type { Match } from "@/types/match";
import Flag from "@/components/Flag";
import { roundLabels, getBracketRound } from "@/lib/bracket";

interface BracketViewProps {
  matches: Match[];
}

function getMatchByOrder(matches: Match[], order: number): Match | undefined {
  return matches.find((m) => m.bracket_order === order);
}

function MatchCard({ match }: { match?: Match }) {
  if (!match) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-slate-200 p-1.5 text-center text-[9px] text-slate-300 min-w-[100px]">
        ?
      </div>
    );
  }

  const home = match.home_team;
  const away = match.away_team;
  const hasResult = match.finished && match.home_score != null;
  const isPlaceholder = !home || !away;
  const isLive = !match.finished && new Date(match.match_date) <= new Date();

  const date = new Date(match.match_date);
  const day = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <div
      className={`
        bg-white rounded-lg border p-1.5 min-w-[110px] max-w-[130px]
        transition-all duration-200
        ${hasResult ? "border-emerald-300 shadow-sm" : ""}
        ${isLive ? "border-amber-300 shadow-sm ring-1 ring-amber-200" : ""}
        ${isPlaceholder ? "border-dashed border-slate-200" : "border-slate-200"}
      `}
    >
      {isPlaceholder ? (
        <div className="text-[9px] text-slate-300 text-center py-2">
          <span className="text-xs">?</span>
          <div className="text-[7px] text-slate-200 mt-0.5">{day} {time}</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-0.5">
            <span className="text-[9px] font-semibold text-slate-800 truncate max-w-[50px] leading-tight">
              {home}
            </span>
            <Flag team={home} />
          </div>
          {hasResult ? (
            <div className="text-center font-bold text-[13px] text-slate-900 my-0.5 tabular-nums">
              {match.home_score}:{match.away_score}
            </div>
          ) : (
            <div className="text-center text-[10px] text-slate-300 font-medium my-0.5">vs</div>
          )}
          <div className="flex items-center justify-between gap-0.5">
            <span className="text-[9px] font-semibold text-slate-800 truncate max-w-[50px] leading-tight">
              {away}
            </span>
            <Flag team={away} />
          </div>
          <div className="text-[7px] text-slate-400 text-center mt-0.5 font-medium">
            {day} {time}
          </div>
        </>
      )}
    </div>
  );
}

export default function BracketView({ matches }: BracketViewProps) {
  const bracketMatches = matches.filter((m) => m.bracket_order != null && m.bracket_order >= 1 && m.bracket_order <= 32);

  function renderColumn(round: number) {
    const label = roundLabels[round];
    let orders: number[] = [];
    switch (round) {
      case 4: orders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; break;
      case 5: orders = [17, 18, 19, 20, 21, 22, 23, 24]; break;
      case 6: orders = [25, 26, 27, 28]; break;
      case 7: orders = [29, 30]; break;
      case 8: orders = [31, 32]; break;
    }

    return (
      <div key={round} className="flex flex-col gap-1">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center sticky left-0">
          {label?.short}
        </div>
        {round === 4 && (
          <>
            <div className="flex flex-col gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((o) => (
                <div key={o} className="flex items-center gap-0.5">
                  <MatchCard match={getMatchByOrder(matches, o)} />
                  <div className="w-3 h-px bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {[9, 10, 11, 12, 13, 14, 15, 16].map((o) => (
                <div key={o} className="flex items-center gap-0.5">
                  <MatchCard match={getMatchByOrder(matches, o)} />
                  <div className="w-3 h-px bg-slate-200" />
                </div>
              ))}
            </div>
          </>
        )}
        {round === 5 && (
          <div className="flex flex-col gap-1">
            {orders.map((o) => (
              <div key={o} className="flex items-center gap-0.5">
                <MatchCard match={getMatchByOrder(matches, o)} />
                <div className="w-3 h-px bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        {round === 6 && (
          <div className="flex flex-col gap-1">
            {orders.map((o) => (
              <div key={o} className="flex items-center gap-0.5">
                <MatchCard match={getMatchByOrder(matches, o)} />
                <div className="w-3 h-px bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        {round === 7 && (
          <div className="flex flex-col gap-1">
            {orders.map((o) => (
              <div key={o} className="flex items-center gap-0.5">
                <MatchCard match={getMatchByOrder(matches, o)} />
                <div className="w-3 h-px bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        {round === 8 && (
          <div className="flex flex-col gap-1">
            <div className="border-b border-slate-100 pb-1 mb-1">
              <div className="text-[7px] text-slate-400 font-medium text-center mb-0.5">3. miejsce</div>
              <MatchCard match={getMatchByOrder(matches, 31)} />
            </div>
            <div>
              <div className="text-[7px] text-amber-600 font-bold text-center mb-0.5 uppercase">Finał</div>
              <MatchCard match={getMatchByOrder(matches, 32)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-[700px]">
        {renderColumn(4)}
        <div className="flex flex-col justify-center gap-1">
          {[
            [17, 18],
            [19, 20],
            [21, 22],
            [23, 24],
          ].map((_, i) => (
            <div key={i} className="h-[52px] flex items-center">
              <div className="w-3 h-px bg-slate-200" />
            </div>
          ))}
        </div>
        {renderColumn(5)}
        <div className="flex flex-col justify-center gap-1">
          {[
            [25, 26],
            [27, 28],
          ].map((_, i) => (
            <div key={i} className="h-[52px] flex items-center">
              <div className="w-3 h-px bg-slate-200" />
            </div>
          ))}
        </div>
        {renderColumn(6)}
        <div className="flex flex-col justify-center gap-1">
          {[
            [29, 30],
          ].map((_, i) => (
            <div key={i} className="h-[52px] flex items-center">
              <div className="w-3 h-px bg-slate-200" />
            </div>
          ))}
        </div>
        {renderColumn(7)}
        <div className="flex flex-col justify-center gap-1">
          <div className="h-[52px] flex items-center">
            <div className="w-3 h-px bg-slate-200" />
          </div>
        </div>
        {renderColumn(8)}
      </div>
    </div>
  );
}
