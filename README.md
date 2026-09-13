# WHITE F.P.G — Showroom

Showroom digitale premium, dark e cinematico per WHITE F.P.G, con pannello
admin per pubblicare nuove opere senza toccare il codice.

## Avvio rapido

```bash
npm install
npm run dev
```

Apri http://localhost:3000. Il sito è vuoto finché non pubblichi la prima
opera da /admin.

**Pannello admin:** http://localhost:3000/admin
**Password di default:** `whitefpg-2026-change-me`

### Cambiare subito la password admin

```bash
node scripts/hash-password.js "la-tua-nuova-password"
```

Copia l'hash stampato in `.env.local`, alla riga `ADMIN_PASSWORD_HASH`.

> IMPORTANTE: nei file `.env*`, il carattere `$` viene interpretato da
> Next.js come inizio di una variabile da espandere. Un hash bcrypt
> contiene sempre `$` (es. `$2b$10$...`): per questo ogni `$` nell'hash
> va scritto come `\$` dentro `.env.local`, altrimenti l'hash viene
> troncato e il login smette di funzionare. Lo script `hash-password.js`
> stampa già il valore nel formato corretto: copialo così com'è.

Dopo aver modificato `.env.local`, riavvia il server (`npm run dev`), oppure
se sei in produzione rilancia anche `npm run build` prima di `npm run start`
(le variabili d'ambiente vengono "congelate" al momento della build).

## Come aggiungere una nuova opera

1. Vai su `/admin` ed effettua il login.
2. Compila il form "Nuovo artwork": file PNG/JPG/WebP, titolo, categoria,
   anno, descrizione, tag, featured, pubblica subito o no.
3. Clicca "Carica artwork".
4. Se hai spuntato "Pubblica subito", l'opera compare immediatamente in
   `/showroom` e — se è tra le migliori impostate come Featured — anche in
   home.

Nessuna modifica al codice è mai necessaria: puoi caricare un'opera oggi,
una domani, una tra un mese.

Dalla dashboard admin puoi anche: modificare titolo/categoria/anno/tag/
descrizione, attivare/disattivare Featured, pubblicare/nascondere,
riordinare (frecce su/giù) ed eliminare un'opera (rimuove anche il file
originale e le versioni in cache).

## Architettura

| Livello | Scelta | Perché |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript + Tailwind | Richiesto dal brief; SSR per SEO e velocità |
| Database | SQLite via `better-sqlite3` | Zero servizi esterni da configurare, un solo file, velocissimo fino a diverse migliaia di record. Migrabile a Postgres in futuro cambiando solo `lib/db.ts` |
| Storage originali | Filesystem privato in `storage/originals/`, **fuori da `/public`** | Mai raggiungibile con un URL diretto |
| Elaborazione immagini | `sharp` | Genera thumbnail, preview e watermark on-demand, poi mette in cache su `storage/cache/` |
| Autenticazione admin | Cookie di sessione firmato (JWT, `jose`) + password con hash `bcrypt` | Nessun account "cloud" da configurare; sufficiente per un singolo amministratore |
| Serving immagini | `/api/img/[id]/[variant]` | Unico punto d'accesso: verifica sempre se l'opera è pubblicata/l'utente è admin prima di generare/servire il file |

### Perché non Prisma / Postgres / S3 in questo ambiente

Ho iniziato con Prisma + Postgres/S3 (lo stack "da manuale" per un progetto
di questa scala), ma il motore Prisma richiede di scaricare un binario da
`binaries.prisma.sh` — un dominio non raggiungibile nell'ambiente in cui ho
sviluppato ed eseguito i test. Ho quindi scelto `better-sqlite3` (libreria
nativa compilata via npm, nessun binario esterno) e storage locale su disco.
**È un'architettura di produzione legittima per uno showroom con centinaia/
migliaia di opere gestito da un solo studio** — non un compromesso "demo".
Se in futuro vorrai passare a Postgres gestito (Neon, Supabase) e storage
oggetti (S3, Cloudflare R2) per scalare su più server o più admin
contemporanei, la separazione in `lib/db.ts` e `lib/images.ts` rende il
cambio contenuto a quei due file.

## Sistema immagini e protezione

- **Originali**: mai serviti pubblicamente. Restano in `storage/originals/`,
  raggiungibili solo dal codice server.
- **Varianti pubbliche** (`thumb` per la griglia, `preview` per il viewer):
  generate con `sharp`, convertite in WebP, con watermark `WHITE F.P.G © 2026`
  composito via SVG (pattern ripetuto discreto + firma leggibile in basso a
  destra) — cachate su disco alla prima richiesta.
- **Variante admin** (`admin-preview`): senza watermark, ma comunque non
  l'originale grezzo; accessibile solo con sessione admin valida.
- **Deterrenti lato client**: nessun bottone download, `draggable={false}`,
  `contextmenu` disabilitato sulle immagini, overlay trasparente sopra ogni
  immagine in griglia.
- **Limite onesto**: come richiesto nel brief, questa è una protezione
  *deterrente*, non un blocco tecnico assoluto — uno screenshot è sempre
  possibile in qualunque sito web. L'obiettivo è rendere scomodo il furto
  casuale e non esporre mai il file originale ad alta risoluzione.

## Struttura cartelle

```
app/
  page.tsx                    Home (hero + selezione featured)
  showroom/page.tsx           Showroom pubblico
  admin/page.tsx              Login o dashboard admin
  api/
    artworks/route.ts         Elenco pubblico opere pubblicate
    img/[id]/[variant]/       Serving protetto delle immagini
    admin/
      login, logout, session  Autenticazione
      artworks/                CRUD + reorder
components/                   Hero, Filters, ArtworkGrid, ArtworkViewer,
                               WatermarkedImage, AdminUpload, AdminDashboard...
lib/
  db.ts                       Accesso SQLite (server-only)
  images.ts                   Pipeline sharp (server-only)
  auth.ts                     Sessione admin (server-only)
  types.ts                    Tipi condivisi client/server
storage/
  originals/                  File caricati (mai pubblici)
  cache/                      Varianti generate
  showroom.db                 Database SQLite (creato al primo avvio)
scripts/
  hash-password.js            Genera un hash bcrypt per la password admin
```

## Scalabilità

- Testato con decine di opere; l'architettura (indice su categoria/ordine,
  cache su disco delle immagini) regge comodamente centinaia/migliaia di
  record: SQLite gestisce bene database fino a diversi GB, e le immagini
  pesanti sono servite dalla cache dopo la prima generazione.
- Se in futuro servirà più di un admin in contemporanea o hosting
  distribuito su più server, il passo naturale è: Postgres al posto di
  SQLite e uno storage oggetti (S3/R2) al posto del filesystem locale —
  entrambi isolati in `lib/db.ts` e `lib/images.ts`.

## Deployment

Qualunque host che supporti Next.js con un filesystem persistente (per
`storage/`) funziona: un VPS, Railway, Render, un container Docker con un
volume montato su `storage/`. Su piattaforme serverless "stateless" (dove il
filesystem non persiste tra le richieste, es. Vercel di default) andranno
sostituiti `storage/originals` con uno storage oggetti e SQLite con un
database gestito, per i motivi spiegati sopra.

Variabili d'ambiente richieste in produzione: `ADMIN_PASSWORD_HASH`,
`ADMIN_SESSION_SECRET` (vedi `.env.example`). 
