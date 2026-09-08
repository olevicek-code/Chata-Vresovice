# Chata Vřesovice

Prezentační a rezervační web pro chatu Vřesovice, postavený na
[Next.js](https://nextjs.org) (App Router), TypeScriptu a Tailwind CSS.

## Co web obsahuje

- **Úvodní stránka (`/`)** – hero sekce, sekce *O chatě* (popis + vybavení),
  *Okolí* (aktivity + orientační mapa), *Galerie* (náhledy s lightboxem) a
  patička s kontaktem.
- **Rezervace (`/rezervace`)** – interaktivní kalendář (obsazené dny jsou
  needitovatelné) a formulář pro odeslání žádosti o rezervaci.
- **API (`/api/reservations`)** – `GET` vrací seznam obsazených termínů,
  `POST` přijme novou žádost o rezervaci a ověří, že se nepřekrývá s
  existující rezervací.

## Video na úvodní stránce

Hero sekce (`src/components/VideoScene.tsx`) používá 4 volně použitelná
videa z [Pexels](https://www.pexels.com) (Pexels License – zdarma pro
komerční i nekomerční použití, bez nutnosti uvádět autora), uložená v
`public/videos/`:

- `hills.mp4` – [pexels.com/video/15070555](https://www.pexels.com/video/drone-footage-of-green-trees-15070555/)
- `deer.mp4` – [pexels.com/video/8553227](https://www.pexels.com/video/a-deer-grazing-at-sequoia-national-park-8553227/)
- `fawn.mp4` – [pexels.com/video/9422693](https://www.pexels.com/video/a-deer-in-a-forest-9422693/)
- `birds.mp4` – [pexels.com/video/28588755](https://www.pexels.com/video/serene-forest-landscape-with-flying-birds-28588755/)

Až budete mít vlastní záběry z okolí chaty, stačí nahradit soubory ve
stejném formátu (H.264 MP4, cca 1280×720) a případně upravit pořadí/délku
přehrávání v `PLAYLIST` v `VideoScene.tsx`.

## Placeholder obsah

Web je zatím naplněn ukázkovým textem a barevnými zástupnými "fotkami"
(gradientové bloky s ikonkou a popiskem). Než web zveřejníte, doporučujeme
nahradit:

- reálné fotografie v `src/components/Gallery.tsx` a `src/components/About.tsx`
  (aktuálně `<div>` s gradientem – klidně nahraďte komponentou `next/image`),
- souřadnice mapy v `src/components/Surroundings.tsx` (parametr `bbox` v URL
  `iframe`),
- kontaktní údaje (e-mail, telefon) v `src/components/Footer.tsx`,
- popisné texty a vybavení chaty v `src/components/About.tsx` a
  `src/components/Surroundings.tsx`.

## Rezervační systém – jak to funguje a omezení

Rezervace se ukládají do souboru `data/reservations.json`. To je jednoduché
řešení vhodné pro první fázi (např. rezervace jen pro rodinu a přátele), ale
má dvě důležitá omezení:

1. **Serverless hosting (např. Vercel) má efemérní souborový systém** – po
   každém nasazení nebo restartu funkce se soubor vrátí do stavu z repozitáře.
   Pro produkční provoz s reálnými hosty proto doporučujeme přejít na
   opravdovou databázi (např. [Turso/libSQL](https://turso.tech/),
   [Vercel Postgres](https://vercel.com/storage/postgres), nebo Supabase) –
   logiku v `src/lib/reservations.ts` lze nahradit jen úpravou pár funkcí.
2. **E-mailové upozornění na novou žádost** už web umí (`src/lib/email.ts`,
   přes [Resend](https://resend.com/) – volané rovnou přes jejich HTTP API,
   takže to nepřidává žádnou novou závislost do `package.json`). Aby to
   fungovalo, nastavte ve Vercelu (Project → Settings → Environment
   Variables):
   - `RESEND_API_KEY` – vytvoříte zdarma na [resend.com](https://resend.com/)
     (Sign up → API Keys → Create API Key). Volný tarif zvládne 100 e-mailů
     denně / 3000 měsíčně, na rezervační formulář bohatě stačí.
   - `RESERVATION_NOTIFY_EMAIL` – váš e-mail, kam chodí upozornění na novou
     žádost. Bez tohoto nastavení se pošle jen potvrzovací e-mail hostovi,
     vy žádné upozornění nedostanete.
   - `RESERVATION_FROM_EMAIL` (nepovinné) – odesílací adresa. Bez nastavení
     se použije sdílená adresa `onboarding@resend.dev`, která funguje hned
     bez ověřování domény (ale hostům může přijít jako "podezřelejší"
     odesílatel). Jakmile bude web na vlastní doméně, doporučujeme v Resendu
     ověřit doménu (Domains → Add Domain, přidáte pár DNS záznamů) a nastavit
     např. `Chata Vřesovice <rezervace@chatavresovice.cz>`.

   Po změně proměnných je potřeba web ve Vercelu znovu nasadit (redeploy),
   aby se nové hodnoty projevily.
3. Rezervace se momentálně automaticky ukládají se stavem `pending` a nikde
   v UI nejde stav změnit na `confirmed`/`cancelled` – to je zatím potřeba
   dělat manuální úpravou `data/reservations.json`. Časem lze doplnit
   jednoduchou administraci chráněnou heslem.

## Spuštění lokálně

```bash
npm install
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000).

## Build a lint

```bash
npm run build
npm run lint
```

## Nasazení

Nejjednodušší je nasazení na [Vercel](https://vercel.com/new) – po připojení
tohoto GitHub repozitáře se web nasadí automaticky při každém push do `main`.
Pamatujte na omezení souborového úložiště zmíněné výše.
