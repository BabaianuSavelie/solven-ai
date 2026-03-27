# Solven AI

An AI chat application built with a React frontend, NestJS backend, and [Openclaw](https://github.com/openclaw/openclaw) as the AI gateway.

## Architecture

| Service    | Description                                    | Port  |
|------------|------------------------------------------------|-------|
| `openclaw` | AI gateway (connects to Anthropic Claude API)  | 18789 |
| `backend`  | NestJS REST/WebSocket API                      | 3000  |
| `frontend` | React + Vite + Tailwind CSS (served via nginx) | 82    |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 24+ (for local development only)
- An Anthropic API key

---

## Quick Start (Docker)

This is the recommended way to run the full stack.

**1. Configure environment variables**

Create a root-level `.env` (next to `docker-compose.yaml`):

```env
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

Create `backend/.env`:

```env
OPENCLAW_WS_URL=ws://openclaw:18789
OPENCLAW_API_KEY=<your-openclaw-api-key>
OPENCLAW_GATEWAY_TOKEN=<your-openclaw-gateway-token>
```

**2. Start all services**

```bash
docker compose up --build
```

**3. Approve the device in Openclaw (first run only)**

On the first start, the backend registers itself as a device in the Openclaw gateway. You need to approve it via the Openclaw CLI inside the container.

List pending device requests to get the `requestId`:

```bash
docker compose exec openclaw openclaw devices list
```

Approve the device:

```bash
docker compose exec openclaw openclaw devices approve <requestId>
```

Then restart the backend:

```bash
docker compose restart backend
```

> **Note:** Reconnection after approval is not yet handled automatically — the backend must be restarted once after approving the device.

**4. Open the app**

- Frontend: http://localhost:82
- Backend API: http://localhost:3000

To stop:

```bash
docker compose down
```

---

## Local Development

Run each service individually for faster iteration with hot-reload.

### Backend

```bash
cd backend
npm install
npm run start:dev   # watch mode, auto-restarts on changes
```

The API will be available at http://localhost:3000.

**Required `backend/.env`:**

```env
OPENCLAW_WS_URL=ws://127.0.0.1:18789
OPENCLAW_API_KEY=<your-openclaw-api-key>
OPENCLAW_GATEWAY_TOKEN=<your-openclaw-gateway-token>
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173.

By default the frontend points to `http://localhost:3000` as the API base URL. Override it with:

```bash
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

### Openclaw gateway

The Openclaw service must be running for the backend to function. Run it via Docker:

```bash
docker compose up openclaw
```

---

## Project Structure

```
solven-ai/
├── backend/          # NestJS API (TypeScript)
│   ├── src/
│   │   └── modules/  # conversations, messages, openclaw
│   ├── Dockerfile
│   └── .env          # not committed — create from the template above
├── frontend/         # React + Vite + Tailwind CSS
│   ├── src/
│   ├── Dockerfile
├── openclaw/         # Openclaw gateway data volume
└── docker-compose.yaml
```

## Available Scripts

### Backend

| Command               | Description                    |
|-----------------------|--------------------------------|
| `npm run start:dev`   | Start in watch mode            |
| `npm run build`       | Compile TypeScript             |
| `npm run start:prod`  | Run compiled output            |
| `npm run test`        | Run unit tests                 |
| `npm run test:e2e`    | Run end-to-end tests           |
| `npm run lint`        | Lint and auto-fix              |

### Frontend

| Command          | Description                         |
|------------------|-------------------------------------|
| `npm run dev`    | Start Vite dev server (hot reload)  |
| `npm run build`  | Build for production                |
| `npm run lint`   | Lint source files                   |
