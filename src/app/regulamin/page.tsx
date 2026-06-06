export default function RegulaminPage() {
  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">📜</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Regulamin</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Zasady uczestnictwa</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">§1. Zasady obstawiania</h2>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5">
            <li>Swoje obstawki wykonujemy w zakładce <strong>Typy</strong>.</li>
            <li>Punktacja za poprawne obstawki:
              <ul className="list-disc list-inside ml-5 mt-1 text-slate-500 space-y-0.5">
                <li><strong>3 pkt</strong> za poprawny wynik</li>
                <li><strong>1 pkt</strong> za poprawny rezultat</li>
              </ul>
            </li>
            <li>Decydujące mecze / półfinały i finał:
              <ul className="list-disc list-inside ml-5 mt-1 text-slate-500 space-y-0.5">
                <li><strong>6 pkt</strong> za poprawny wynik</li>
                <li><strong>2 pkt</strong> za poprawny rezultat</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">§2. Blokada zakładów</h2>
          <p className="text-sm text-slate-600">
            Wraz z godziną rozpoczęcia meczu zakłady blokują się. Nie ma możliwości obstawienia wyniku w meczu, który trwa. Za nieobstawione mecze zawodnik otrzymuje <strong>0 pkt</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">§3. Wyniki i ranking</h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1.5">
            <li>Obstawki są utajnione. Po rozegranym meczu zostaną wyświetlone w zakładce <strong>Tabela</strong>.</li>
            <li>Wyniki aktualizują się po rozegranym meczu, w przypadku meczy rozgrywających się w nocy wyniki będą aktualizowane ok. godziny 8:00. Wyniki i sytuacja grupowa / drabinka zostaną wyświetlone w zakładce <strong>Grupy</strong>.</li>
            <li>Rezultaty obstawek są sumowane i wyświetlane w zakładce <strong>Ranking</strong>.</li>
            <li>Indywidualne statystyki zawodnika są wyświetlane w zakładce <strong>Dashboard</strong>.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">§4. Nagrody</h2>
          <p className="text-sm text-slate-600 mb-2">
            Wyniki zliczane są pod koniec turnieju, osoby z najlepszymi wynikami otrzymują:
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">🥇</span>
              <span className="text-sm font-bold text-slate-700">1. miejsce — <span className="text-emerald-600">500 zł</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🥈</span>
              <span className="text-sm font-bold text-slate-700">2. miejsce — <span className="text-emerald-600">200 zł</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🥉</span>
              <span className="text-sm font-bold text-slate-700">3. miejsce — <span className="text-emerald-600">50 zł</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
