import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="relative z-10 max-w-2xl px-4 animate-[fadeIn_0.6s_ease-out]">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-white drop-shadow-lg tracking-tight">
          World Cup{' '}
          <span className="text-amber-300">Betting</span>
        </h1>
        <p className="text-emerald-100/90 text-base sm:text-lg mb-8 max-w-lg mx-auto">
          Obstawiaj wyniki meczów Mistrzostw Świata, zbieraj punkty i rywalizuj
          z innymi!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="bg-white hover:bg-amber-50 active:scale-[0.97] text-emerald-800 px-7 py-3 rounded-xl font-semibold shadow-xl transition-all duration-200"
          >
            Zaloguj się
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm active:scale-[0.97] text-white px-7 py-3 rounded-xl font-semibold border border-white/30 shadow-lg transition-all duration-200"
          >
            Ranking
          </Link>
        </div>
      </div>
    </div>
  );
}
