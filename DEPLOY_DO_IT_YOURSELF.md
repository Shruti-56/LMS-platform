# Deploy DataUniverse — Do It Yourself (One Path, Step by Step)

You will do the deployment. Your database is on **localhost** right now (your computer). After this, the **database will be on the internet** (a company’s server) and the **app** will be on the internet too. No need to understand servers — just follow the steps in order.

---

## What You Have Now vs After Deployment

| | **Right now (your computer)** | **After deployment (internet)** |
|---|-------------------------------|----------------------------------|
| **App (website + API)** | Runs on localhost (only you can open it) | Runs on **Render** (anyone can open app.datauniverse.in) |
| **Database (MySQL)** | Runs on localhost (only your computer) | Runs on **PlanetScale** (online; the app will connect to it) |

So: we will **create a new database online** and **put your app online**. The online app will use the online database. Your localhost database stays on your PC; we don’t “move” it — we start fresh in the cloud (you can copy data later if needed).

---

## Before You Start

- [ ] GitHub account — [github.com](https://github.com) → Sign up
- [ ] Render account — [render.com](https://render.com) → Sign up (use “Sign in with GitHub”)
- [ ] PlanetScale account — [planetscale.com](https://planetscale.com) → Sign up (for database)
- [ ] GoDaddy login — for datauniverse.in
- [ ] This project folder on your computer

---

# THE STEPS

---

## STEP 1 — Put Your Code on GitHub

GitHub will hold your code. Render will take it from GitHub and run it.

### 1.1 Create a new repo on GitHub

1. Go to [github.com](https://github.com) and log in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** `datauniverse-app` (or any name).
4. Leave **Private** or **Public** — your choice.
5. **Do not** tick “Add a README”.
6. Click **Create repository**.

### 1.2 Push your project from your computer

Open **Terminal** (Mac) or **Command Prompt** (Windows). Run these commands **one by one**. Replace `YOUR_GITHUB_USERNAME` with your real GitHub username.

```bash
cd /Users/shrutipardeshi/Desktop/DataUniverse/learnflow-demo
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/datauniverse-app.git
git push -u origin main
```

- If it asks for **username**: your GitHub username.
- If it asks for **password**: use a **Personal Access Token**, not your GitHub password.  
  To create one: GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token** → tick **repo** → Generate → copy the token and paste it when the command asks for password.

After this, your code is on GitHub. You can see it at `https://github.com/YOUR_GITHUB_USERNAME/datauniverse-app`.

---

## STEP 2 — Create the Database Online (So It’s Not on Localhost Anymore)

We use **PlanetScale** — they give you a MySQL database on the internet. The app will connect to it using a “connection string”.

### 2.1 Create the database

1. Go to [planetscale.com](https://planetscale.com) and sign up (free).
2. Click **Create a database** (or **New database**).
3. **Name:** `datauniverse`
4. **Region:** choose **Asia (Mumbai)** or **Singapore** (closer to India).
5. Click **Create database**.
6. Wait until it says the database is **Ready**.

### 2.2 Get the connection string

1. Open your database (`datauniverse`).
2. Click **Connect** (top right).
3. Choose **Connect with: General** (or **Prisma** if you see it).
4. You’ll see a string like:
   ```
   mysql://xxxxx:xxxxx@aws.connect.psdb.cloud/datauniverse?sslaccept=strict
   ```
5. Click **Copy** or **Create password** if it asks (then copy the full string).
6. **Save this string** in a Notepad file — you’ll paste it in Render in Step 3. This is your **DATABASE_URL**. Don’t share it publicly.

Your database is now **on the internet**, not on localhost. The app we deploy will use this.

---

## STEP 3 — Create the Backend on Render (The API That Uses the Database)

The “backend” is the server that handles login, courses, and talks to the database. We’ll host it on Render.

### 3.1 New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com). Log in (use GitHub if you can).
2. Click **New +** → **Web Service**.
3. **Connect** your GitHub if asked. Select the repo you created (e.g. `datauniverse-app`).
4. Fill in **exactly**:

| Field | What to type |
|-------|------------------|
| **Name** | `datauniverse-api` |
| **Region** | Singapore (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && node dist/app.js` |

### 3.2 Add environment variables (so the backend knows where the database is)

Scroll to **Environment** or **Environment Variables**. Click **Add** and add these **one by one**:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | *(Paste the long string you copied from PlanetScale in Step 2. Paste the whole thing.)* |
| `JWT_SECRET` | *(Type a long random string — e.g. 32 letters and numbers. You can use [randomkeygen.com](https://randomkeygen.com) and copy one “Code Ignition” key.)* |
| `CORS_ORIGINS` | `https://app.datauniverse.in` |

- **DATABASE_URL** = your PlanetScale connection string (the one that starts with `mysql://`).
- **JWT_SECRET** = any long random text (keep it secret).

Click **Create Web Service**. Wait until the deploy finishes. The status should turn **Live** (green).

### 3.3 Copy your backend URL

At the top of the page you’ll see a URL like:

**https://datauniverse-api.onrender.com**

Copy this URL (no slash at the end). You’ll use it in the next step. This is where your “database + API” live on the internet now — **not localhost**.

---

## STEP 4 — Create the Frontend on Render (The Website Users Open)

The “frontend” is the login page, dashboard, courses — what users see in the browser. We’ll host it on Render and tell it: “When you need data, call the backend URL from Step 3.”

### 4.1 New Static Site

1. In Render dashboard, click **New +** → **Static Site**.
2. Select the **same** GitHub repo (`datauniverse-app`).
3. Fill in:

| Field | What to type |
|-------|------------------|
| **Name** | `datauniverse-app` |
| **Branch** | `main` |
| **Root Directory** | *(Leave empty)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 4.2 One environment variable (so the frontend knows where the backend is)

In **Environment**, click **Add**:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://datauniverse-api.onrender.com/api` |

- Replace `datauniverse-api.onrender.com` with the **exact** backend URL you copied in Step 3.3.
- It **must** end with `/api` (no slash after `api`).

Example: if your backend URL is `https://datauniverse-api.onrender.com`, then value is `https://datauniverse-api.onrender.com/api`.

Click **Create Static Site**. Wait until the build is done (green).

### 4.3 Add your domain (app.datauniverse.in)

1. Open your **Static Site** (the one you just created).
2. Go to **Settings** → **Custom Domains**.
3. Click **Add Custom Domain**.
4. Type: **app.datauniverse.in**
5. Render will show you something like:
   - **CNAME** → `xxxxx.onrender.com`
   Copy that (e.g. `datauniverse-app.onrender.com`). You’ll need it for GoDaddy in Step 5.

---

## STEP 5 — Point app.datauniverse.in to Your App (GoDaddy)

Right now **app.datauniverse.in** doesn’t go anywhere. You’ll add one line in GoDaddy so it sends people to Render.

1. Log in to **GoDaddy**.
2. Go to **My Products** → find **datauniverse.in** → click **DNS** (or **Manage DNS**).
3. In the list of records, click **Add** (or **Add Record**).
4. Choose:
   - **Type:** **CNAME**
   - **Name:** **app**  
     (So the full name is app.datauniverse.in. Some panels have a dropdown — pick the option that means “app” only.)
   - **Value** (or “Points to”): paste what Render gave you in Step 4.3 (e.g. `datauniverse-app.onrender.com`). No `https://`, just the hostname.
   - **TTL:** 600 or leave default.
5. **Save**.

Wait **15 minutes to 1 hour**. Then open in your browser: **https://app.datauniverse.in**

You should see your app (login page). Your **database is no longer on localhost** — it’s on PlanetScale, and the app on Render uses it. **www.datauniverse.in** still goes to Wix; we didn’t change that.

---

## Summary: Where Everything Is Now

| Thing | Where it is |
|-------|-------------|
| **Code** | GitHub (datauniverse-app repo) |
| **Database (MySQL)** | PlanetScale (online) — **not localhost** |
| **Backend (API)** | Render (Web Service) |
| **Frontend (website)** | Render (Static Site) |
| **app.datauniverse.in** | GoDaddy sends it to Render (frontend) |
| **www.datauniverse.in** | Still Wix (unchanged) |

---

## If Something Goes Wrong

- **“Site can’t be reached” at app.datauniverse.in**  
  Wait a bit longer (DNS can take up to an hour). Check GoDaddy: Name = `app`, Value = the Render hostname (e.g. `datauniverse-app.onrender.com`).

- **Login doesn’t work / “Cannot connect”**  
  - Frontend: make sure `VITE_API_URL` is exactly `https://YOUR-BACKEND-URL/api` (from Step 3.3). Then in Render, for the Static Site, do **Manual Deploy** → **Deploy latest commit** (so it rebuilds with the correct URL).
  - Backend: in Render, open the **backend** service → **Logs**. If you see “database connection” error, check that `DATABASE_URL` in Step 3.2 is the full PlanetScale string (starts with `mysql://`).

- **Backend deploy failed**  
  Open the backend service on Render → **Logs**. Often it’s wrong **Root Directory** (must be `backend`) or wrong **Build/Start command**. Copy the exact commands from Step 3.1.

- **“I had data in my local database”**  
  Your local MySQL on localhost is separate. The online app uses the **new** PlanetScale database (empty at first). If you need to copy data from your PC to the cloud, we can do that in a separate step (export from local, import to PlanetScale).

---

## Checklist

- [ ] Step 1: Code is on GitHub.
- [ ] Step 2: PlanetScale database created; connection string copied.
- [ ] Step 3: Backend on Render; `DATABASE_URL` and other env vars set; deploy is Live; backend URL copied.
- [ ] Step 4: Frontend on Render; `VITE_API_URL` = backend URL + `/api`; custom domain `app.datauniverse.in` added; Render gave you a CNAME.
- [ ] Step 5: GoDaddy — CNAME record: Name `app`, Value = Render’s hostname.
- [ ] After 15–60 min: open https://app.datauniverse.in and test login.

Your database is **no longer on localhost** — it’s on PlanetScale. The app runs on Render and uses that online database.
