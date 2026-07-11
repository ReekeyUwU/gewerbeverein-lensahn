# Gewerbeverein Lensahn e.V. – Neue Webplattform

Monorepo mit Next.js Frontend, Node/Express Backend und MySQL.

## Struktur

- `frontend/` – Next.js 15 (App Router), TailwindCSS, shadcn/ui, Framer Motion
- `backend/` – Express + TypeScript API, Prisma/MySQL, JWT-Auth mit 2FA, lokale Datei-Uploads
- `docker/` – nginx-Konfiguration (nur für den Docker-Weg)
- `docker-compose.yml` – MySQL, MinIO, Backend, Frontend, nginx (Docker-Weg, optional)

Es wird **kein Redis mehr benötigt** (war ungenutzt) und Datei-Uploads landen standardmäßig lokal auf der Festplatte (`backend/uploads/`) statt in MinIO/S3 – dadurch läuft das Projekt auch auf normalem Shared-Hosting ohne Zusatzdienste. MinIO/S3 bleibt optional (`STORAGE_DRIVER=s3`) für den Docker-Weg.

## Lokale Entwicklung

**Voraussetzung:** lokal laufender MySQL-Server (z. B. via Docker, XAMPP oder nativ installiert).

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

## Deployment auf Plesk (Shared Hosting, ohne Root, per Git)

Voraussetzung: Node.js-Erweiterung in Plesk ist aktiviert, MySQL-Datenbank kann über Plesk angelegt werden.

Das Projekt braucht **zwei Node.js-Apps** in Plesk – eine für das Backend (API) und eine für das Frontend. Am einfachsten ist eine Subdomain für die API, z. B. `api.deine-domain.de`, und die Hauptdomain für das Frontend.

### 1. MySQL-Datenbank anlegen

In Plesk unter **Websites & Domains → Datenbanken** eine neue MySQL-Datenbank + Benutzer anlegen. Verbindungs-URL merken:
`mysql://BENUTZER:PASSWORT@localhost:3306/DATENBANKNAME`

### 2. Git-Repository verbinden

In Plesk unter **Websites & Domains → Git**:
- "Von einem entfernten Repository klonen" → `https://github.com/ReekeyUwU/gewerbeverein-lensahn.git`
- Zielverzeichnis z. B. `httpdocs/app` (nicht direkt `httpdocs`, da zwei Teilprojekte drin liegen)
- Branch: `master`

### 3. Backend als Node.js-App einrichten

Unter **Websites & Domains → api.deine-domain.de → Node.js**:
- Docroot: `.../app/backend`
- Application Startup File: `dist/server.js`
- Umgebungsvariablen (siehe `backend/.env.example`), insbesondere:
  - `DATABASE_URL` (aus Schritt 1)
  - `JWT_ACCESS_SECRET` – langer zufälliger String
  - `FRONTEND_URL` – `https://deine-domain.de`
  - `STORAGE_DRIVER=local`
  - `UPLOAD_DIR=./uploads`
  - `UPLOAD_PUBLIC_URL=https://api.deine-domain.de/uploads`

### 4. Frontend als Node.js-App einrichten

Next.js ist mit `output: "standalone"` konfiguriert – der Build erzeugt einen eigenständigen `server.js`, der zu Plesk/Passenger passt.

Unter **Websites & Domains → deine-domain.de → Node.js**:
- Docroot: `.../app/frontend`
- Application Startup File: `.next/standalone/server.js`
- Umgebungsvariablen:
  - `NEXT_PUBLIC_API_URL=https://api.deine-domain.de` (**muss auch beim Build gesetzt sein**, siehe Schritt 5)

### 5. Deployment-Aktion (läuft bei jedem Git-Pull)

In Plesk unter **Git → Einstellungen für automatisches Deployment** folgendes Skript hinterlegen:

```bash
#!/bin/bash
set -e

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

cd ../frontend
npm install
NEXT_PUBLIC_API_URL="https://api.deine-domain.de" npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

touch ../backend/tmp/restart.txt 2>/dev/null || mkdir -p ../backend/tmp && touch ../backend/tmp/restart.txt
touch .next/standalone/tmp/restart.txt 2>/dev/null || mkdir -p .next/standalone/tmp && touch .next/standalone/tmp/restart.txt
```

(Die `tmp/restart.txt`-Dateien lassen Passenger die jeweilige App neu starten – alternativ in Plesk manuell auf "Neu starten" klicken.)

### 6. Erststart

Nach dem ersten Deployment einmalig per Plesk-SSH-Konsole (oder "NPM"-Button im Node.js-Panel) ausführen:

```bash
cd backend && npm run seed
```

Danach ist die Seite unter `https://deine-domain.de` erreichbar, das Backend unter `https://api.deine-domain.de`.

### Mit Docker Compose (Alternative für VPS mit Root-Zugriff)

```bash
docker compose up -d mysql minio
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

- `JWT_ACCESS_SECRET` und alle Passwörter durch starke, zufällige Werte ersetzen.
- Impressum (`frontend/src/lib/site-content.ts`) enthält noch keinen Vereinsregistereintrag – bitte ergänzen.
- Datenschutzerklärung ist ein DSGVO-Standardtemplate und sollte von einer Rechtsberatung geprüft werden.
- SMTP-Zugangsdaten für Bestätigungs-/Newsletter-Mails müssen noch in `backend/.env` hinterlegt werden (aktuell nur vorbereitet, kein Versand implementiert).
- Erstes Admin-Konto (`admin@gewerbeverein-lensahn.de` / `ChangeMe123!`) direkt nach dem ersten Login unter **Admin → Benutzerkonten** Passwort ändern bzw. eigenes Konto anlegen und das Standardkonto deaktivieren.
