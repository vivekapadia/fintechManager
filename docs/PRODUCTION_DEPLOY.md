# Production Deployment Guide (Zero Cost Edition) 💸

Since you want a **100% Free** solution, we cannot use a single Docker VPS. Instead, we use "Free Tiers" from different specialized providers or turn your own computer into a server.

## Option 1: The "Home Server" (Easiest for Demos) 🏠
**Best For:** Showing the app to friends/clients temporarily while your computer is on.
**Cost:** $0.

### How it works:
Your computer runs Docker. We create a secure "Tunnel" from the internet to your localhost.

### Steps (Using Cloudflare Tunnel - Recommended):
1.  **Run your app**: `docker-compose up -d --build`
2.  **Install Cloudflared**: Download from [Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).
3.  **Run Tunnel**:
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
4.  **Result**: It gives you a random URL (e.g., `https://funny-name.trycloudflare.com`). Send this to anyone!

---

## Option 2: The "Split Stack" (Permanent Public Link) ☁️
**Best For:** 24/7 availability.
**Cost:** $0 (Free Tiers).

To stay free, we must split the `docker-compose` into 3 separate free services.

### 1. Database: Supabase (Free 500MB Postgres) 🗄️
*   Go to **Supabase.com** -> New Project.
*   Get the **Connection String** (URI).
*   **Important**: Use this new URI in your `.env` for both Backend and Engine deployments.

### 2. Frontend: Vercel (Free Static Hosting) 🌐
*   Push your code to **GitHub**.
*   Go to **Vercel.com** -> Add New Project -> Import your Repo.
*   **Settings**:
    *   Root Directory: `apps/web`
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
*   **Env Vars**: set `VITE_API_URL` to your backend URL (see below).

### 3. Backend (API + Engine): Render (Free Docker) ⚙️
*   Go to **Render.com** -> New **Web Service**.
*   Connect GitHub Repo.
*   **Backend API**:
    *   Root Directory: `apps/api`
    *   Docker Command: standard Dockerfile.
    *   Env Vars: `DATABASE_URL` (from Supabase), `JWT_SECRET`.
    *   *Note: Free tier spins down after 15 mins of inactivity (50s cold start).*
*   **Analytics Engine**:
    *   Create another Web Service for `apps/engine`.
    *   Root Directory: `apps/engine`.

---

## Summary Recommendation
1.  **Just showing it off?** Use **Option 1 (Cloudflare Tunnel)**. It takes 2 minutes and uses your perfectly working local setup.
## Can I use Google Firebase or GitHub Pages? 🤔

**Short Answer:** Only for the **Frontend**.

### 1. GitHub Pages / Firebase Hosting
*   **What they do:** Host "Static" files (HTML, CSS, JS).
*   **Good for:** Your React Frontend (`apps/web`).
*   **Bad for:** Your Backend API, Python Engine, and Database. These need a "running server" (CPU/RAM), which GitHub Pages does not provide.

### 2. Can I use Firebase for Backend?
*   Technically **Yes** (via Cloud Functions), **BUT**:
    *   You would need to rewrite your Docker app to fit "Serverless" functions.
    *   You would need to pay for Google Cloud SQL (Postgres) or rewrite everything to use Firestore (NoSQL).
    *   **Verdict:** Not recommended for this specific Dockerized project.

**Best Hybrid for You:**
*   **Frontend**: Hosted on **GitHub Pages** (Free).
*   **Backend**: Hosted on **Render** (Free).
*   **Database**: Hosted on **Supabase** (Free).

