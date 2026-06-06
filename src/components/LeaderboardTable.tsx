import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  onSelect?: (userId: string) => void;
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardTable({ entries, onSelect }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Brak danych w rankingu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Użytkownik</th>
            <th className="pb-3 text-right">Punkty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rowClass = index === 0
              ? "bg-amber-50/50 border-b border-amber-200 hover:bg-amber-100/50"
              : "border-b border-slate-100 hover:bg-emerald-50/50";
            return (
              <tr key={entry.user_id} onClick={() => onSelect?.(entry.user_id)} className={`cursor-pointer transition-colors duration-150 ${rowClass}`}>
                <td className="py-3 pr-4">
                  {index < 3 ? (
                    <span className="text-xl">{medals[index]}</span>
                  ) : (
                    <span className="text-slate-400 font-medium">{index + 1}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`${index === 0 ? "text-amber-900" : "text-slate-800"} font-medium`}>
                    {entry.nickname}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-bold text-xl tabular-nums ${index === 0 ? "text-amber-600" : "text-amber-600"}`}>
                    {entry.total_points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
