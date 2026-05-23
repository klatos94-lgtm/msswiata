import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        Brak danych w rankingu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-3">Użytkownik</th>
            <th className="pb-2 text-right">Punkty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.user_id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition">
              <td className="py-2 pr-3">
                {index < 3 ? (
                  <span className="text-base">{medals[index]}</span>
                ) : (
                  <span className="text-slate-400 text-sm font-medium">{index + 1}</span>
                )}
              </td>
              <td className="py-2 pr-3">
                <span className="text-slate-800 text-sm font-medium">
                  {entry.nickname || entry.email}
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="text-amber-600 font-bold text-base">
                  {entry.total_points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
