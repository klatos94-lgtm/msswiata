export const flags: Record<string, string> = {
  "Polska": "🇵🇱", "Argentyna": "🇦🇷", "Niemcy": "🇩🇪", "Brazylia": "🇧🇷",
  "Francja": "🇫🇷", "Anglia": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Hiszpania": "🇪🇸", "Holandia": "🇳🇱",
  "Portugalia": "🇵🇹", "Belgia": "🇧🇪", "Chorwacja": "🇭🇷",
  "Meksyk": "🇲🇽", "Republika Południowej Afryki": "🇿🇦",
  "Korea Południowa": "🇰🇷", "Czechy": "🇨🇿",
  "Kanada": "🇨🇦", "Bośnia i Hercegowina": "🇧🇦",
  "USA": "🇺🇸", "Paragwaj": "🇵🇾",
  "Haiti": "🇭🇹", "Szkocja": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Australia": "🇦🇺", "Turcja": "🇹🇷",
  "Maroko": "🇲🇦", "Katar": "🇶🇦", "Szwajcaria": "🇨🇭",
  "Wybrzeże Kości Słoniowej": "🇨🇮", "Ekwador": "🇪🇨",
  "Curaçao": "🇨🇼", "Curacao": "🇨🇼", "Japonia": "🇯🇵",
  "Szwecja": "🇸🇪", "Tunezja": "🇹🇳",
  "Egipt": "🇪🇬", "Iran": "🇮🇷", "Nowa Zelandia": "🇳🇿",
  "Arabia Saudyjska": "🇸🇦", "Urugwaj": "🇺🇾",
  "Senegal": "🇸🇳", "Irak": "🇮🇶", "Norwegia": "🇳🇴",
  "Algieria": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "DR Konga": "🇨🇩", "Ghana": "🇬🇭", "Panama": "🇵🇦",
  "Uzbekistan": "🇺🇿", "Kolumbia": "🇨🇴",
  "Republika Zielonego Przylądka": "🇨🇻",
};

export function getFlag(team: string): string {
  return flags[team] || "🏳️";
}
