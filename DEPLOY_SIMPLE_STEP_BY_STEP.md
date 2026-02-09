# Deploy DataUniverse — Simple Step-by-Step (No Experience Needed)

You will put the app online at **app.datauniverse.in**. Your current website **www.datauniverse.in** stays as it is.

We use **Render** (a hosting website) because it’s straightforward. You will:

1. Put your code on **GitHub**
2. Create a **database** (for users, courses, etc.)
3. Create a **backend** (the API) on Render
4. Create a **frontend** (the website users see) on Render
5. Point **app.datauniverse.in** to the frontend using **GoDaddy**

---

## What You Need Before Starting

- [ ] A **GitHub** account (free) — [github.com](https://github.com) → Sign up
- [ ] A **Render** account (free) — [render.com](https://render.com) → Sign up (can use “Sign up with GitHub”)
- [ ] **GoDaddy** login — where you manage datauniverse.in
- [ ] This project on your computer (the learnflow-demo folder)

---

## Part 1: Put Your Code on GitHub

GitHub will hold your code. Render will take it from there and run it.

### Step 1.1 — Install Git (if you don’t have it)

- **Mac**: Open Terminal and run: `xcode-select --install` (if it says “already installed”, skip).
- **Windows**: Download and install from [git-scm.com](https://git-scm.com/download/win).

### Step 1.2 — Create a new repository on GitHub

1. Go to [github.com](https://github.com) and log in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name**: e.g. `datauniverse-app`
4. Leave it **Private** if you prefer (Render can still use it).
5. Do **not** check “Add a README”.
6. Click **Create repository**.

### Step 1.3 — Upload your project to GitHub

Open **Terminal** (Mac) or **Command Prompt / PowerShell** (Windows) and run these commands **one by one**. Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

```bash
cd /Users/shrutipardeshi/Desktop/DataUniverse/learnflow-demo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/datauniverse-app.git
git push -u origin main
```

When it asks for username/password, use your **GitHub username** and a **Personal Access Token** (not your normal password). To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Give it “repo” permission.

---

## Part 2: Create a Database

Your app needs a MySQL database to store users, courses, payments, etc.

**Option A — PlanetScale (free tier, no credit card)**

1. Go to [planetscale.com](https://planetscale.com) and sign up (free).
2. **Create a database**: Name it e.g. `datauniverse`.
3. After it’s created, click **Connect** → **Connect with: General**.
4. Copy the connection string. It looks like:
   `mysql://USER:PASSWORD@HOST/database?sslaccept=strict`
5. Save this somewhere — you’ll paste it into Render as `DATABASE_URL`.

**Option B — Render MySQL (if available)**

1. In Render dashboard: **New** → **MySQL**.
2. Create the database and copy the **Internal Database URL** (you’ll use it in the next part).

---

## Part 3: Create the Backend on Render

The “backend” is the server that handles login, courses, and data.

### Step 3.1 — New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com). Log in.
2. Click **New +** → **Web Service**.
3. **Connect** your GitHub account if you haven’t. Select the repo you pushed (e.g. `datauniverse-app`).
4. Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `datauniverse-api` (or any name you like) |
| **Region** | Choose closest to India (e.g. Singapore) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && node dist/app.js` |

### Step 3.2 — Environment Variables (Backend)

Still in the same service, open **Environment** (left side or tab) and add these **Key** + **Value** pairs. Click **Add** for each.

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | *(paste the full MySQL connection string from Part 2)* |
| `JWT_SECRET` | *(create a long random string, e.g. 32+ letters/numbers — you can use [randomkeygen.com](https://randomkeygen.com) “Code Ignition” and copy one)* |
| `CORS_ORIGINS` | `https://app.datauniverse.in` |

Save. Then click **Create Web Service** (or **Save** then **Manual Deploy** → **Deploy latest commit**). Wait until the deploy finishes and the status is **Live**.

### Step 3.3 — Copy your backend URL

At the top of the service page you’ll see a URL like:

`https://datauniverse-api.onrender.com`

**Copy this URL** (without a slash at the end). You’ll use it next for the frontend. This is your “API URL”; the app will call `this-url/api`.

---

## Part 4: Create the Frontend on Render

The “frontend” is the actual website (login page, dashboard, courses) that users open in the browser.

### Step 4.1 — New Static Site

1. In Render dashboard: **New +** → **Static Site**.
2. Connect the **same** GitHub repo.
3. Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `datauniverse-app` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank — repo root)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Step 4.2 — Environment Variable (Frontend)

In **Environment**, add **one** variable:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://datauniverse-api.onrender.com/api` |

Replace `datauniverse-api.onrender.com` with the **exact** backend URL you copied in Part 3. It must end with `/api` (no trailing slash after `api`).

Save, then **Create Static Site**. Wait until the build is done.

### Step 4.3 — Add custom domain in Render

1. Open your **Static Site** (frontend) service.
2. Go to **Settings** → **Custom Domains**.
3. Click **Add Custom Domain**.
4. Type: **app.datauniverse.in**
5. Render will show you something like:
   - **CNAME** → `your-site-name.onrender.com`  
   Or it might show an **A** record. Copy what it says (host name and type).

Leave this page open — you’ll use it in the next part.

---

## Part 5: Point app.datauniverse.in to Your App (GoDaddy)

You’ll tell GoDaddy: “When someone goes to **app.datauniverse.in**, send them to Render.”

1. Log in to **GoDaddy** → **My Products**.
2. Find **datauniverse.in** → click **DNS** (or **Manage DNS**).
3. In the **DNS records** list, click **Add** (or **Add record**).
4. Choose:
   - **Type**: **CNAME**
   - **Name**: **app**  
     (Some panels have a dropdown “Host” or “Name” — choose the one that’s just the subdomain, so the full name is `app.datauniverse.in`.)
   - **Value** (or “Points to”): paste exactly what Render showed you in Part 4.3 (e.g. `your-site-name.onrender.com`).
   - **TTL**: 600 or leave default.
5. **Save**.

Wait 15–60 minutes. Then try opening **https://app.datauniverse.in** in your browser. It might take a bit for the first time; Render will issue SSL (the padlock) automatically.

---

## If Something Goes Wrong

- **“Site can’t be reached”**  
  Wait a bit longer for DNS. Double-check in GoDaddy: Name = `app`, Value = the Render hostname (no `https://`).

- **“Cannot connect to API” / blank page / login fails**  
  - Check frontend env: `VITE_API_URL` must be exactly `https://YOUR-BACKEND-URL/api`.
  - Rebuild the frontend on Render after changing env (Manual Deploy → Deploy latest commit).
  - Check backend env: `CORS_ORIGINS` = `https://app.datauniverse.in` (no trailing slash).

- **Backend “Application failed”**  
  - Check **Logs** for that service on Render. Often it’s `DATABASE_URL` wrong or migrations not run (Start Command already runs `prisma migrate deploy`).

- **Database connection error**  
  - Make sure `DATABASE_URL` is the full string from PlanetScale/Render, including `?sslaccept=strict` if PlanetScale gave it.

---

## Quick Checklist

- [ ] Code is on GitHub.
- [ ] Database created; `DATABASE_URL` copied.
- [ ] Backend Web Service on Render: Root = `backend`, env vars set, deploy successful.
- [ ] Frontend Static Site on Render: Publish = `dist`, `VITE_API_URL` = `https://.../api`, deploy successful.
- [ ] Custom domain `app.datauniverse.in` added in Render (static site).
- [ ] GoDaddy: CNAME `app` → Render hostname.
- [ ] After 15–60 min, open https://app.datauniverse.in and test login.

---

## Need Someone to Do It For You?

If you prefer not to do the steps yourself:

- You can **hire a freelancer** (e.g. on Upwork, Fiverr) and send them this file plus your repo link. They’ll need your GoDaddy (to add the CNAME) and your Render/PlanetScale (or you create the accounts and give access).
- Or ask your **technical contact** (developer/agency) to deploy using this guide; they can fill in the exact Render and GoDaddy screens for you.

Your **www.datauniverse.in** site stays unchanged; only **app.datauniverse.in** will point to this new app.
