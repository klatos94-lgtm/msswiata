import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-800 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative z-10 max-w-2xl px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-white drop-shadow-lg">
          World Cup{' '}
          <span className="text-amber-300">Betting</span>
        </h1>
        <p className="text-emerald-100 text-base sm:text-lg mb-6 max-w-lg mx-auto drop-shadow">
          Obstawiaj wyniki meczów Mistrzostw Świata, zbieraj punkty i rywalizuj
          z innymi!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="bg-white hover:bg-amber-50 text-emerald-800 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
          >
            Zaloguj się
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold border border-white/40 shadow-lg transition transform hover:scale-105"
          >
            Ranking
          </Link>
        </div>
      </div>
    </div>
  );
}
