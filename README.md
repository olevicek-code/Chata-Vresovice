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
2. **Žádosti se nyní jen ukládají**, nikam se neposílá e-mailové upozornění.
   Až budete chtít, lze do `src/app/api/reservations/route.ts` snadno doplnit
   odeslání e-mailu (např. přes [Resend](https://resend.com/) nebo podobnou
   službu) při každé nové žádosti.
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
