# World Cup Betting

Aplikacja do obstawiania wyników Mistrzostw Świata.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + PostgreSQL)
- **Vercel** (deploy)

## Funkcje

- Logowanie przez email/hasło
- Terminarz meczów z możliwością typowania
- Automatyczne przeliczanie punktów (3 za dokładny wynik, 1 za zwycięzcę/remis)
- Ranking użytkowników
- Panel admina do zarządzania meczami
- Ciemny motyw, responsywny UI

## Wymagania

- Node.js 18+
- Konto Supabase (https://supabase.com)
- Konto Vercel (https://vercel.com)

## Uruchomienie lokalne

1. Sklonuj repozytorium:

```bash
git clone <repo-url>
cd worldcup-betting
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Skopiuj plik `.env.local.example` jako `.env.local` i uzupełnij dane z Supabase:

```bash
cp .env.local.example .env.local
```

4. Uruchom SQL schema w SQL Editor w panelu Supabase (plik `sql/schema.sql`)

5. Uruchom aplikację:

```bash
npm run dev
```

6. Otwórz http://localhost:3000

## Deploy na Vercel

1. Wrzuć kod na GitHub:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

2. Wejdź na https://vercel.com/new
3. Importuj repozytorium z GitHub
4. Dodaj zmienne środowiskowe:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
5. Kliknij **Deploy**

## Panel Admina

Dostęp do panelu admina ma użytkownik, którego email jest ustawiony jako `NEXT_PUBLIC_ADMIN_EMAIL`.

## Punktacja

| Wynik | Punkty |
|-------|--------|
| Dokładny wynik | 3 |
| Poprawny zwycięzca / remis | 1 |
| Błędny typ | 0 |

## SQL - Tabele

Tabele są tworzone automatycznie przez skrypt `sql/schema.sql`. Wymagane tabele:

- `users` - profile użytkowników
- `matches` - mecze
- `predictions` - typowania
