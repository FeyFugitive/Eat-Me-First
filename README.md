# EatMeFirst（先吃我）

Your fridge's eat-me-first list — before it rots.

Mobile-first PWA (Next.js App Router + TypeScript + Tailwind). Prompt 1 scaffold + Prompt 2 data layer: types, `data/foods.json` seed, localStorage inventory store, urgency helper. No backend or auth in v1.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Inventory: `/`
- Add: `/add`
- Eat First: `/today`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — serve production build
- `npm run lint` — ESLint
- `npm test` — unit tests (urgency, foods seed, localStorage store)

## Data layer (Prompt 2)

- Types: `src/lib/types.ts`
- Seed foods (60–80): `data/foods.json` (+ `src/lib/foods.ts` helpers)
- Inventory persistence: `src/lib/store.ts` (`localStorage` key `eat-me-first:inventory`)
- Urgency (pure): `src/lib/urgency.ts` — red / yellow / green from shelf-day ranges

## Out of scope (v1)

Login, cloud sync, barcode, OCR, recipes, gram-level quantities, multi-user sharing, native push.
