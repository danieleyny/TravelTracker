# Travel Tracker

Simple mobile-first mileage logger for real estate drives. Log trips with from/to addresses (auto-calculated driving distance via OpenStreetMap), trip purpose, odometer, and driver name. Export a full year to CSV for tax write-offs.

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- OpenStreetMap Nominatim (geocoding) + OSRM (routing) — no API keys

## Local development
```bash
npm install
# set DATABASE_URL in a .env file pointing at a Postgres
npx prisma migrate dev
npm run dev
```

## Deploy
Configured to deploy to Railway. `DATABASE_URL` must be set in the environment; the build step runs `prisma migrate deploy`.
