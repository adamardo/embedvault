# EmbedVault

Personal embedded systems knowledge base — Phase 1 scaffold.

## What's in this phase

- Next.js 14 (App Router) + TypeScript project structure
- Tailwind CSS wired up with a dark, engineering-style theme
- Sidebar navigation matching the planned information architecture
  (Dashboard, Microcontrollers, Components, Concepts, Code, Troubleshooting,
  Projects, Favorites, Notes, Settings)
- A placeholder Dashboard page with a disabled search bar and zeroed-out
  stat cards — these become real once the database exists (Phase 2)
- `prisma/` and `lib/` folders created empty, ready for the schema and
  data-access code in Phase 2

Nothing is connected to a database yet — that's next. This phase is only
about getting the app running.

## Setup

You'll need [Node.js](https://nodejs.org) 18.18+ installed.

```bash
cd embedvault
npm install
npm run dev
```

Then open http://localhost:3000 — you should see the EmbedVault sidebar
and a dashboard with a search bar (disabled for now) and 8 stat cards
all showing 0.

## Folder structure

```
embedvault/
├── app/              Next.js pages (App Router)
│   ├── layout.tsx    Root layout — renders the sidebar + page content
│   ├── page.tsx      Dashboard page
│   └── globals.css   Tailwind base styles + theme
├── components/       Shared React components
│   └── Sidebar.tsx   Left navigation
├── lib/              (empty) — data access + search logic goes here
├── prisma/           (empty) — schema.prisma goes here in Phase 2
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## How to test

1. Run `npm install` — should finish with no errors.
2. Run `npm run dev` — terminal should print `Ready` and a localhost URL.
3. Open the URL in your browser.
4. Confirm you see:
   - A dark sidebar on the left with 10 nav links
   - "EmbedVault" title top-left
   - A dashboard heading, a disabled search input, and 8 stat cards
5. Click a few sidebar links — they'll 404 for now (those pages don't
   exist yet), that's expected at this stage.

Report back what you see (or any errors from `npm install` / `npm run dev`)
and we'll move to **Phase 2: Database & Schema**.

---

## Phase 2: Database & Schema

What's new in this phase:

- `prisma/schema.prisma` — defines every table (`Entry`, `Tag`, `CodeSnippet`,
  `TroubleshootingGuide`, `Project`, `Favorite`, `Note`, `Relation`)
- `lib/prisma.ts` — a shared database client used across the app
- `prisma/seed.ts` — fills the database with real starter data (ESP32,
  STM32F401, HC-SR04, MPU6050, SG90, relay, core concepts, troubleshooting
  guides, and code snippets)
- `app/page.tsx` (dashboard) now reads **real** counts and a "Recently
  Updated" list from the database instead of hardcoded zeros

### Setup

```bash
# 1. Create your local .env file (holds the database file path)
copy .env.example .env      # Windows PowerShell
# cp .env.example .env      # Mac/Linux

# 2. Install the newly added packages (prisma client, tsx)
npm install

# 3. Create the actual SQLite database file + tables from the schema
npx prisma migrate dev --name init

# 4. Fill it with starter data
npm run prisma:seed

# 5. Run the app
npm run dev
```

### How to test

1. Step 3 (`prisma migrate dev`) should print that it created `dev.db` and
   applied a migration, with no errors.
2. Step 4 (`prisma:seed`) should end with `Seed complete.` in the terminal.
3. Open `http://localhost:3000` — the stat cards should now show real
   numbers (e.g. 2 Microcontrollers, several Components/Concepts, a few
   Code Snippets and Troubleshooting Guides), and "Recently Updated" should
   list the seeded entries.
4. Optional: run `npm run prisma:studio` — this opens a browser-based table
   viewer at `http://localhost:5555` where you can see and edit the raw
   database rows directly. Useful for sanity-checking the seed worked.

Clicking a "Recently Updated" entry will 404 for now — individual entry
pages come in Phase 3.
