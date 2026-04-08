<div align="center">

# 🟢 Synco

**Self-hosted uptime monitoring for developers. Deploy in 60 seconds with Docker.**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)

</div>

---

## ✨ Features

- 🔍 **Automatic HTTP monitoring** — pings your URLs at intelligent, dynamic intervals
- ⚡ **Real-time dashboard** — live green/red status updates via WebSockets (no page refresh needed)
- 🔒 **Built-in authentication** — login page with configurable credentials
- 🗄️ **Persistent SQLite storage** — data survives container restarts via Docker volumes
- 🧹 **Auto database cleanup** — automatically purges check history older than 2 days at midnight
- 🐳 **One-command deployment** — single `docker compose up` to run anywhere

---

## 🚀 Quick Start (Docker)

**1. Clone the repo**
```bash
git clone https://github.com/lazxdev/keep-alive.git
cd keep-alive
```

**2. Configure your environment**
```bash
cp .env.example .env
# Edit .env with your preferred credentials and secret
```

**3. Launch**
```bash
docker compose up -d
```

That's it. Open `http://localhost:3000` and sign in.

---

## ⚙️ Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `DB_NAME` | `/app/data/keepalive.db` | Path to the SQLite database file |
| `AXIOS_TIMEOUT` | `5000` | HTTP ping timeout in milliseconds |
| `ADMIN_USERNAME` | `admin` | Dashboard login username |
| `ADMIN_PASSWORD` | `admin` | Dashboard login password |
| `JWT_SECRET` | `keepalive_secret_key` | Secret key for signing session tokens |

> [!CAUTION]
> Always change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying to a public server.

---

## 📁 Data Persistence

Your database is stored in the `./data/` folder on the host machine. This folder is mapped into the container via a Docker volume, so your monitored apps and check history are safe across restarts, updates, and re-deploys.

```
keep-alive/
└── data/
    └── keepalive.db   ← Your data lives here, safe on disk
```

---

## 🔌 REST API

All endpoints require authentication (JWT cookie).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/apps` | List all monitored apps |
| `POST` | `/apps` | Add a new app to monitor |
| `PATCH` | `/apps/:id` | Update an app |
| `DELETE` | `/apps/:id` | Remove an app and all its history |

**POST `/apps` body:**
```json
{
  "name": "My API",
  "url": "https://my-api.example.com/health",
  "enabled": true
}
```

---

## 🛠️ Running Locally (Development)

```bash
npm install
cp .env.example .env
npm run start:dev
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | SQLite via TypeORM |
| Real-time | Socket.io WebSockets |
| HTTP Client | Axios with keepAlive agents |
| Views | Handlebars (SSR) |
| Auth | JWT via HTTP-only cookies |
| Container | Docker (multi-stage, non-root) |

---

## 📄 License

MIT — free to use, modify, and distribute.
