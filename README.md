<div align="center">

<img src="./src/dashboard/public/synco1.svg" width="96" alt="Synco Logo" />

# Synco

**Self-hosted advanced uptime monitoring for developers. Deploy in 60 seconds with Docker.**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org)

</div>

---

## ✨ Features

- 🔍 **Automatic HTTP monitoring** — Ping your URLs at intelligent, dynamic intervals.
- ⚡ **Real-time dashboard** — Live status updates via WebSockets (no page refresh needed) with a premium Cyber/Dark Mode UI.
- 📱 **Telegram Alerts** — Receive instant notifications whenever an app goes DOWN or UP, plus an automated hourly infrastructure report.
- 🔒 **Built-in authentication** — Secure login page with configurable credentials and strict JWT HTTP-Only cookies.
- 🗄️ **Persistent SQLite storage** — Data survives container restarts via Docker volumes.
- 🧹 **Auto database cleanup** — Automatically purges check history older than 2 days to maintain a small memory footprint.
- 🐳 **One-command deployment** — Single `docker compose up` to run anywhere.

---

## 🚀 Quick Start (Docker)

**1. Clone the repo**
```bash
git clone https://github.com/Synco-project/synco.git
cd synco
```

**2. Configure your environment**
```bash
cp .env.example .env
# Edit .env with your credentials and (optionally) your Telegram Bot tokens
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
| `DB_NAME` | `/app/data/synco.db` | Path to the SQLite database file |
| `AXIOS_TIMEOUT` | `5000` | HTTP ping timeout in milliseconds |
| `ADMIN_USERNAME` | `admin` | Dashboard login username |
| `ADMIN_PASSWORD` | `admin` | Dashboard login password |
| `JWT_SECRET` | `synco_secret_key` | Secret key for signing session tokens |
| `TELEGRAM_BOT_TOKEN` | (empty) | Bot token obtained from @BotFather |
| `TELEGRAM_CHAT_ID` | (empty) | Your personal or group chat ID to receive alerts |

> [!CAUTION]
> Always change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying to a public server.

---

## 📁 Data Persistence

Your database is stored in the `./data/` folder on the host machine. This folder is mapped into the container via a Docker volume, so your monitored apps and check history are safe across restarts, updates, and re-deploys.

---

## 📱 Telegram Integration (Optional)

Synco can act as your personal infrastructure radar. By providing a `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, the system will automatically:
1. Alert you instantly if any API returns a non-200 status or times out (`🔴 INCIDENCE DETECTED`).
2. Notify you the moment connectivity is restored (`🟢 SYSTEM RECOVERED`).
3. Send a detailed summary of your node network health every hour (`📊 INFRASTRUCTURE REPORT`).

---

## 🔌 REST API

All endpoints require authentication (JWT cookie).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/apps` | List all monitored apps |
| `POST` | `/apps` | Add a new app to monitor |
| `PATCH` | `/apps/:id` | Update an app |
| `DELETE` | `/apps/:id` | Remove an app and all its history |

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
| UI/UX | Handlebars (SSR) with Vanilla CSS |
| HTTP Client | Axios with synco TCP agents |
| Auth | JWT via strict HTTP-only cookies |
| Alerts | Telegram HTTP API integration |
| Container | Docker (multi-stage, non-root `node` user) |

---

## 📄 License

MIT — free to use, modify, and distribute.
