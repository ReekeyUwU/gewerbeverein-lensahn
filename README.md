# Gewerbeverein Lensahn e.V. – Neue Webplattform

Monorepo mit Next.js Frontend, Node/Express Backend und MySQL/Redis/MinIO.

## Struktur

- `frontend/` – Next.js 15 (App Router), TailwindCSS, shadcn/ui, Framer Motion
- `backend/` – Express + TypeScript API, Prisma/MySQL, Redis, JWT-Auth mit 2FA
- `docker/` – nginx-Konfiguration
- `docker-compose.yml` – MySQL, Redis, MinIO, Backend, Frontend, nginx

## Lokale Entwicklung ohne Docker

**Voraussetzung:** lokal laufender MySQL-Server und Redis (z. B. via Docker oder nativ installiert).

```bash
# Backend
cd backend
cp .env.example .env   # DATABASE_URL etc. anpassen
npm install
npm run prisma:migrate # legt Tabellen an
npm run seed           # Testdaten (Admin-Login, echte Mitglieder/Vorstand/Termine)
npm run dev             # http://localhost:4000

# Frontend (separates Terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev              # http://localhost:3000
```

Admin-Login nach dem Seed: `admin@gewerbeverein-lensahn.de` / `ChangeMe123!` (unter `/admin/login`, **bitte nach dem ersten Login ändern**).

## Mit Docker Compose (empfohlen für Produktion/Vollintegration)

Voraussetzung: Docker Desktop.

```bash
docker compose up -d mysql redis minio
cd backend && npx prisma migrate deploy && npm run seed
cd ..
docker compose up -d --build backend frontend nginx
```

Danach erreichbar über:
- Frontend direkt: http://localhost:3000
- Backend direkt: http://localhost:4000
- Über nginx (Produktions-ähnlich): http://localhost:8080
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin)

## Wichtige Hinweise vor Live-Gang

- `JWT_ACCESS_SECRET` und alle Passwörter in `.env` durch starke, zufällige Werte ersetzen.
- Impressum (`frontend/src/lib/site-content.ts`) enthält noch keinen Vereinsregistereintrag – bitte ergänzen.
- Datenschutzerklärung ist ein DSGVO-Standardtemplate und sollte von einer Rechtsberatung geprüft werden.
- SMTP-Zugangsdaten für Bestätigungs-/Newsletter-Mails müssen noch in `backend/.env` hinterlegt werden (aktuell nur vorbereitet, kein Versand implementiert).
