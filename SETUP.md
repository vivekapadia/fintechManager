# Developer Setup Guide

This guide provides step-by-step instructions to set up the **Fintech Manager** development environment on your local machine.

---

## 📋 Prerequisites

Ensure you have the following installed:

1.  **Node.js**: v18.0.0 or higher (Managed via `nvm` recommended).
2.  **Docker Desktop**: Required for the database and isolated services.
3.  **Git**: version control.
4.  **VS Code**: Recommended IDE (with Prettier and ESLint extensions).

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fintechManager
```

### 2. Install Dependencies
We use `npm` workspaces. Install dependencies from the root directory:
```bash
npm install
# Note: On Windows PowerShell if you encounter script execution errors, use:
# cmd /c npm install
```

### 3. Environment Configuration
The project uses specific Environment Variables. 
*   **API**: `apps/api/.env` (Auto-configured defaults for local dev).
*   **Web**: `apps/web/.env` (Vite handles env vars automatically).

**Default API Configuration:**
- Port: `3000`
- Database: `postgres://admin:password123@localhost:5432/fintech`
- JWT Secret: `super-secret-key`

---

## ⚡ Running the Application

### 1. Start Infrastructure (Database)
Start the PostgreSQL container using Docker Compose:
```bash
docker-compose up -d db
```
*   Verify it's running: `docker ps` (Should see `fintech-db`).

### 2. Database Migration (Prisma)
Push the Prisma schema to your local database:
```bash
cd packages/database
npx prisma db push
```
*   This creates the tables (`User`, `Asset`, `Transaction` etc.).
*   To explore data GUI: `npx prisma studio` (Opens at `http://localhost:5555`).

### 3. Start Backend API
Open a **new terminal** and run:
```bash
cd apps/api
npm run start:dev
```
*   Server listens on: `http://localhost:3000`
*   Health Check: `http://localhost:3000/health`

### 4. Start Analytics Engine (Python)
Open a **new terminal** and run:
```bash
cd apps/engine
# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py

# Windows
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*   Server listens on: `http://127.0.0.1:8000`

### 4. Start Frontend
Open a **new terminal** and run:
```bash
cd apps/web
npm run dev
```
*   App runs on: `http://localhost:5173`

---

## 🧪 Verification & System Health

To verify that everything is working, follow this checklist:

### 1. Database (PostgreSQL) ✅
*   **Status**: Running in Docker.
*   **How to Check**:
    *   Command: `docker ps` (You should see `fintech-db`).
    *   Data Check: Run `node packages/database/check-db.js` (Shows connected users).

### 2. Backend API (NestJS) ✅
*   **Status**: Running locally on port 3000.
*   **How to Check**:
    *   Visit: `http://localhost:3000/health` -> Should return `{"status":"ok"}`.
    *   Visit: `http://localhost:3000/auth/login` -> Should return **404 Not Found** (This is correct for GET requests).

### 3. Frontend (React) ✅
*   **Status**: Running locally on port 5173.
*   **How to Check**:
    *   Open Browser: `http://localhost:5173`.
    *   Navigate to `/register` or `/login`.

### 4. Full End-to-End Flow ✅
1.  Open `http://localhost:5173/register`.
2.  Create a new user.
3.  It should redirect you to `/dashboard`.
4.  If you see **"Welcome to Fintech Manager!"**, everything is working.

---

## 🛑 Troubleshooting

**Issue: `PrismaClientInitializationError` (API crashes)**
*   **Fix**: Ensure `fintech-db` container is running (`docker ps`).
*   **Fix**: Ensure you ran `npx prisma db push` in `packages/database`.

**Issue: Port Layout**
*   **3000**: API Server
*   **4000**: API Docker Mapping (Internal)
*   **5173**: Frontend Development
*   **5432**: PostgreSQL Database
*   **5555**: Prisma Studio
