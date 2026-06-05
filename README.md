# Meeting Room Booking System

A small full-stack meeting room booking app with role-based behavior, a Node.js API, a React frontend, and PostgreSQL via Docker.

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Frontend: Vite, React, TypeScript
- Tests: Vitest and Supertest

## Time And Booking Rules

- All API timestamps are UTC ISO strings.
- Booking ranges are half-open: `[startTime, endTime)`.
- Back-to-back bookings are allowed.
- Overlap is rejected when `newStart < existingEnd && newEnd > existingStart`.
- Admin user deletion cascades and deletes that user's bookings.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   npm run db:up
   ```

3. Copy environment defaults:

   ```bash
   cp .env.example apps/api/.env
   cp .env.example apps/web/.env
   ```

4. Run migrations and seed data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start both apps:

   ```bash
   npm run dev
   ```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`
- PostgreSQL host port: `localhost:5433`

## Demo Users

The seed script creates:

- Ada Admin, role `admin`
- Owen Owner, role `owner`
- Uma User, role `user`

The frontend uses a simple user selector. API requests send the selected user's id in the `x-user-id` header. This is intentionally demo-oriented authentication; all authorization still happens on the backend.

## Frontend Structure

- `apps/web/src/App.tsx`: application state, data loading, and feature composition
- `apps/web/src/api`: reusable API client helpers
- `apps/web/src/components`: shared layout, navigation, and UI primitives
- `apps/web/src/features`: domain-specific booking, analytics, and user-management views
- `apps/web/src/types`: shared TypeScript domain types
- `apps/web/src/utils`: formatting, permissions, routing, and small helpers

## Backend Structure

- `apps/api/src/app.ts`: Express app composition, shared middleware, and router registration
- `apps/api/src/config`: runtime configuration values
- `apps/api/src/db`: database client setup
- `apps/api/src/domain`: shared domain types
- `apps/api/src/middleware`: authentication, authorization, async, and error middleware
- `apps/api/src/modules`: feature route modules for auth, bookings, summary, and users
- `apps/api/src/repositories`: persistence contracts plus memory and Prisma implementations
- `apps/api/src/routes`: cross-cutting routes such as health checks
- `apps/api/src/shared`: validation and reusable request parsing helpers

## API

All protected endpoints require `x-user-id`.

- `GET /api/auth/users`: public login selector users
- `GET /api/users`: admin only
- `POST /api/users`: admin only
- `PATCH /api/users/:id`: admin only
- `DELETE /api/users/:id`: admin only, cascades bookings
- `GET /api/bookings`: all roles
- `POST /api/bookings`: all roles
- `DELETE /api/bookings/:id`: own booking for users, any booking for owner/admin
- `GET /api/summary`: owner/admin only

## Tests

```bash
npm test
```

## Deploy On A Contabo VPS

This repo includes a production Docker Compose stack for a Contabo Ubuntu VPS:

- `postgres`: PostgreSQL database with a persistent Docker volume
- `api`: Express API, Prisma migrations, and Node.js server
- `web`: Nginx serving the built React app and proxying `/api` to the API container

### 1. Prepare the server

SSH into the VPS, then install Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Log out and SSH back in so the Docker group change applies.

### 2. Clone the app

```bash
git clone https://github.com/kyawzin-htet/metting_romm_booking_system.git
cd metting_romm_booking_system
```

### 3. Create production environment

```bash
cp .env.production.example .env
nano .env
```

Change `POSTGRES_PASSWORD` to a strong password. Keep `WEB_PORT=80` unless another service already uses port 80.

### 4. Start the app

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Run the seed script once after the containers are running:

```bash
docker compose -f docker-compose.prod.yml exec api npm run db:seed -w apps/api
```

Open the app at:

```text
http://YOUR_SERVER_IP
```

Health check:

```bash
curl http://YOUR_SERVER_IP/health
```

### 5. Update after new commits

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
