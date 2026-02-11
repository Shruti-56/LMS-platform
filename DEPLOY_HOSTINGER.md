# Deploy DataUniverse on Hostinger — Start to End (Step by Step)

This guide walks you through **every step** from zero to a live app at **app.datauniverse.in**, with the API at **api.datauniverse.in** and the database on Hostinger. Do the steps in order.

**Want the LMS on the main domain (datauniverse.in) instead of app.datauniverse.in?** Use **[DEPLOY_HOSTINGER_MAIN_DOMAIN.md](./DEPLOY_HOSTINGER_MAIN_DOMAIN.md)** — it explains the GoDaddy “domain is registered, but may still be available” message and how to point datauniverse.in to your Hostinger app.

---

## What You’ll Have When Done

| Part | Where it runs | URL |
|------|----------------|-----|
| **Database (MySQL)** | Hostinger | (backend connects to it; no public URL) |
| **Backend (API)** | Hostinger Node.js app #1 | **https://api.datauniverse.in** |
| **Frontend (app)** | Hostinger Node.js app #2 | **https://app.datauniverse.in** |

Your domain **datauniverse.in** stays where it is (e.g. GoDaddy). You only add DNS for **app** and **api**.

---

## What You Need Before Starting

- A computer with this project (e.g. `learnflow-demo` folder).
- **Hostinger** account with **Business** or **Cloud** plan (Node.js is not on basic shared hosting). If you’re not sure, log in at [hostinger.com](https://www.hostinger.com) and check your plan.
- **GitHub** account ([github.com](https://github.com) — sign up if needed).
- **GoDaddy** login for the domain **datauniverse.in**.
- About 30–45 minutes of time.

---

## Important: Domain “Transfer” vs “Point” (Don’t Transfer)

When you connect a domain in Hostinger, they may show options about **transferring** the domain.

- **Transfer** = moving the **registration** of datauniverse.in from GoDaddy to Hostinger (you’d manage the domain inside Hostinger instead of GoDaddy). You do **not** need to do this.
- **Point** = keeping the domain at GoDaddy and only changing **DNS** (nameservers or A/CNAME records) so that datauniverse.in (or app/api) goes to Hostinger. This is what we want.

So: choose the option that means **“I will point my domain”** or **“Domain is registered elsewhere”**. Hostinger will then give you either **nameservers** or an **A record** (IP) to set at GoDaddy. You do **not** need to click “Transfer domain”.

---

## If You Want lms.datauniverse.in (and Hostinger Says “Unsupported”)

Hostinger’s **“Connect domain”** box often accepts only **root domains** (e.g. **datauniverse.in**), not subdomains like **lms.datauniverse.in**. So when you type **lms.datauniverse.in**, they may show **“Unsupported”** or similar.

You have two approaches:

### Option A — Use app.datauniverse.in and api.datauniverse.in (recommended)

The guide uses **app.datauniverse.in** (frontend) and **api.datauniverse.in** (backend). Try typing **app.datauniverse.in** (not lms) when connecting the frontend. If that is also “unsupported”, use Option B first (add root domain), then connect the subdomain.

### Option B — Add the root domain first, then connect the subdomain

1. **Add the root domain datauniverse.in to Hostinger** (so Hostinger “knows” your domain):
   - In **hPanel** → **Websites** → **Add website** (or **Add domain**).
   - When asked for the domain, enter **datauniverse.in** (no subdomain).
   - When Hostinger asks how to connect it, choose **“Point domain”** or **“Domain is registered elsewhere”** — **do not** choose “Transfer”.
   - They will show **nameservers** or an **A record**. In **GoDaddy**, update DNS for **datauniverse.in** with those values (nameservers for the root, or A record for `@`). Wait for DNS to propagate (up to 24 hours).
2. After **datauniverse.in** is connected to your Hostinger account, go back to your **Node.js app** → **Connect domain**. The list may now include **datauniverse.in**. Select it and see if you can choose a **subdomain** (e.g. **lms**) so the app is served at **lms.datauniverse.in**. If the UI allows that, use it and then set DNS for **lms** in Hostinger’s DNS zone (or in GoDaddy if you kept DNS there) as Hostinger instructs.

### Option C — Don’t “connect” lms in Hostinger; use DNS only (workaround)

1. **Do not** try to connect **lms.datauniverse.in** in Hostinger’s “Connect domain” at all. Leave the Node.js app on its **temporary** URL (e.g. `https://your-app-xyz.hostinger.site`).
2. In **GoDaddy** → **DNS** for datauniverse.in, add a **CNAME** record:
   - **Name:** `lms`
   - **Value:** `your-app-xyz.hostinger.site` (your real temporary Hostinger URL, no `https://`)
3. After DNS propagates, **lms.datauniverse.in** will open the same app.  
**Note:** HTTPS may show a certificate warning (certificate is for `*.hostinger.site`, not lms.datauniverse.in) unless Hostinger automatically issues a cert for the hostname once DNS is pointed. If you need proper HTTPS for lms.datauniverse.in, prefer Option B.

**Summary:** You do **not** need to transfer the domain. Use **“Point domain”**. If you want **lms.datauniverse.in**, either add the root **datauniverse.in** first (Option B) or use **app** / **api** as in the guide (Option A).

---

# PHASE 0 — Put Your Code on GitHub

Hostinger will pull your app from GitHub. So first we put the code there.

---

## Step 0.1 — Create a new repository on GitHub

1. Open a browser and go to **https://github.com**. Log in.
2. Click the **+** icon (top right) → **New repository**.
3. Fill in:
   - **Repository name:** `datauniverse-app` (or any name you like).
   - **Public** or **Private:** your choice.
   - **Do not** check “Add a README file”.
4. Click **Create repository**.
5. Leave this page open; you’ll see a URL like `https://github.com/YOUR_USERNAME/datauniverse-app.git`. You’ll need it in the next step.

---

## Step 0.2 — Push your project from your computer to GitHub

1. On your computer, open **Terminal** (Mac) or **Command Prompt** (Windows).
2. Run the following commands **one by one**. Replace `YOUR_GITHUB_USERNAME` with your real GitHub username (and the repo name if you chose something other than `datauniverse-app`).

```bash
cd /Users/shrutipardeshi/Desktop/DataUniverse/learnflow-demo
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/datauniverse-app.git
git push -u origin main
```

3. If it asks for **username:** type your GitHub username and press Enter.
4. If it asks for **password:**  
   - Do **not** use your GitHub account password.  
   - Use a **Personal Access Token**. To create one:  
     - GitHub → your profile (top right) → **Settings** → **Developer settings** (left sidebar) → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.  
     - Give it a name (e.g. “Hostinger deploy”), tick **repo**, click **Generate token**, then **copy** the token.  
   - When the command asks for password, **paste this token** and press Enter.
5. When the push finishes, refresh your GitHub repo page. You should see all your project files.  
**✓ Phase 0 done.** Your code is on GitHub.

---

# PHASE 1 — Create the MySQL Database on Hostinger

---

## Step 1.1 — Log in to Hostinger and open hPanel

1. Go to **https://www.hostinger.com** and log in.
2. You should see **hPanel** (your hosting control panel). If you see a list of websites, that’s fine.

---

## Step 1.2 — Open the database section

1. In the left sidebar (or top menu), click **Websites** (or **Hosting**).
2. Click **Manage** next to the website you want to use (or the first one if you have several).  
   - If you don’t have a website yet, you may see **Add Website**; we’ll do that later for the Node.js apps. For the database, look for **Databases** in the main dashboard or under **Advanced**.
3. In the **left sidebar** of the management page, look for one of these:
   - **Databases**, or  
   - **MySQL Databases**, or  
   - **Database** under “Management” or “Advanced”.
4. Click it. You should see a section like **“Create a new MySQL database”** or **“MySQL Databases”**.

---

## Step 1.3 — Create the database and user

1. Find the form **“Create a new MySQL database”** (or “Add database”).
2. Fill in:
   - **Database name:** type `datauniverse` (Hostinger may add a prefix like `u123456789_` — that’s normal).
   - **Username:** type `datauniverse_user` (again, a prefix may be added).
   - **Password:** choose a strong password (at least 8 characters, with uppercase, lowercase, and a number). **Write this down** in a safe place.
3. Click **Create** (or **Add**).
4. Wait until you see a success message. The new database and user will appear in the list.

---

## Step 1.4 — Get the connection details and build DATABASE_URL

1. In the same **Databases** / **MySQL** page, find the database you just created (e.g. `u123456789_datauniverse`).
2. Click it or click **Manage** / **Details** so you can see:
   - **Hostname** (often `localhost`)
   - **Database name** (full name with prefix, e.g. `u123456789_datauniverse`)
   - **Username** (full name with prefix, e.g. `u123456789_datauniverse_user`)
   - **Password** (the one you set)
   - **Port** (usually `3306`)
3. Open **Notepad** (or any text editor). Build one line in this format (replace with your real values):

```
mysql://USERNAME:PASSWORD@HOSTNAME:3306/DATABASE_NAME
```

Example (yours will have different prefix and password):

```
mysql://u123456789_datauniverse_user:MySecurePass123@localhost:3306/u123456789_datauniverse
```

4. **Important:** If your password has special characters like `#`, `@`, `%`, `&`, replace them:
   - `#` → `%23`
   - `@` → `%40`
   - `%` → `%25`
   - `&` → `%26`
5. **Copy** this full line and **save it** in the Notepad file. Label it **DATABASE_URL**. You’ll paste it into Hostinger in Phase 2.  
**✓ Phase 1 done.** You have a MySQL database and your DATABASE_URL.

---

# PHASE 2 — Deploy the Backend (API) on Hostinger

---

## Step 2.1 — Add a new website and choose Node.js

1. In **hPanel**, go to **Websites** (left sidebar or top).
2. Click **Add Website** (or **Create website**).
3. You’ll see options like “Website”, “WordPress”, “Node.js Apps”, etc. Click **Node.js Apps** (or “Node.js”).
4. Choose **Import Git Repository** (or “Deploy from GitHub”). Do **not** choose “Upload files” for now.

---

## Step 2.2 — Connect GitHub and select your repo

1. If Hostinger asks to connect to **GitHub**, click **Connect** or **Authorize**.
2. You’ll be taken to GitHub. Click **Authorize** (or “Authorize Hostinger”) so Hostinger can read your repositories.
3. Back in Hostinger, you’ll see a list of your GitHub repositories. Click the one you created (e.g. **datauniverse-app**).
4. Select **Branch:** `main` (or the branch where you pushed your code).
5. Click **Next** or **Continue**.

---

## Step 2.3 — Set the root directory and build settings (Backend)

Hostinger will show build settings. We need the build to run from the **backend** folder.

1. Find **Root directory** (or “Application root”, “Source directory”).  
   - Type: **backend**  
   - So Hostinger uses the `backend` folder of your repo.
2. Find **Build command** (or “Install command” + “Build command”).  
   - Set it to exactly:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
   - This installs packages, generates Prisma, runs database migrations, and builds the API.
3. Find **Start command** (or “Run command”).  
   - Set it to: **npm start**  
   - (That runs `node dist/app.js`.)
4. If there’s a **Node.js version** dropdown, choose **20** or **22** (LTS).  
5. **Do not click Deploy yet.** We’ll add environment variables first.

---

## Step 2.4 — Add environment variables (Backend)

1. On the same page, find **Environment variables** (or “Env variables”, “Config vars”).
2. Click **Add variable** (or “Add”) and add each of these **one by one**. Use the **exact** names; values are what you have or choose.

| Name | Value |
|------|--------|
| `DATABASE_URL` | The full line you saved in Step 1.4 (starts with `mysql://...`) |
| `JWT_SECRET` | A long random string (e.g. 32 characters). You can use a password generator or type something like `DataUniverseSecretKey2024ProdXYZ` |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://app.datauniverse.in` |

3. **PORT:** Leave it **empty** unless Hostinger requires it (they often set it automatically).
4. If you use **Razorpay**, **AWS S3**, or **email (SMTP)**, add those variables too (same names as in your `backend/.env`). For now the above five are enough to run the app.
5. **Save** or keep the page open. Double-check that **DATABASE_URL** has no extra spaces and is one single line.

---

## Step 2.5 — Deploy the backend

1. Click **Deploy** (or “Build and deploy”, “Deploy website”).
2. Wait for the build to finish (a few minutes). You’ll see a log. If it fails:
   - Check that **Root directory** is exactly `backend`.
   - Check that **DATABASE_URL** is correct (especially if the password had special characters).
3. When the build **succeeds**, Hostinger will show a **temporary URL**, e.g. `https://something-12345.hostinger.site`.
4. **Test the API:** Open a new browser tab and go to:  
   `https://THAT-URL/health`  
   (Replace THAT-URL with the one Hostinger gave you.)  
   You should see something like: `{"status":"ok","timestamp":"...","environment":"production"}`.
5. **Write down the backend temporary URL** in your Notepad, e.g.  
   `Backend URL: https://something-12345.hostinger.site`  
   You’ll use it in Phase 3 for the frontend.  
**✓ Phase 2 done.** Your API is live on Hostinger.

---

# PHASE 3 — Deploy the Frontend on Hostinger

---

## Step 3.1 — Add another new website (second Node.js app)

1. In **hPanel**, go to **Websites** again.
2. Click **Add Website** again (you’re creating a **second** website).
3. Choose **Node.js Apps** → **Import Git Repository**.
4. Select the **same** repository (e.g. **datauniverse-app**) and branch **main**. Click **Next**.

---

## Step 3.2 — Set root directory and build settings (Frontend)

This time we build the **frontend** (React/Vite) from the **root** of the repo.

1. **Root directory:** Leave **empty** or type **.** (a single dot). So the build runs from the repo root, not from `backend`.
2. **Build command:** Set to:
   ```bash
   npm install && npm run build
   ```
   This creates the production build in the `dist` folder.
3. **Start command:** Set to one of these (Hostinger may suggest one for Vite/React):
   ```bash
   npx serve -s dist
   ```
   If there’s a **Framework** or **Preset** dropdown, choose **Vite** or **React**; then the start command might be set for you. The goal is to **serve** the `dist` folder.
4. **Node.js version:** 20 or 22.

---

## Step 3.3 — Add environment variables (Frontend)

The frontend must know the **API URL at build time**. Use the **backend temporary URL** you wrote down in Step 2.5.

1. Find **Environment variables** for this (frontend) app.
2. Add:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND-TEMPORARY-URL/api` |

Example: If your backend URL was `https://something-12345.hostinger.site`, then:

`VITE_API_URL` = `https://something-12345.hostinger.site/api`

(No slash at the end. Include `/api`.)

3. Optional: `VITE_INSTITUTE_NAME` = `DataUniverse`. Add `VITE_RAZORPAY_KEY_ID` if you use Razorpay in the frontend.
4. Save.

---

## Step 3.4 — Deploy the frontend

1. Click **Deploy** (or “Build and deploy”).
2. Wait for the build to finish.
3. When it’s done, Hostinger will show a **temporary URL** for the frontend, e.g. `https://another-thing-67890.hostinger.site`.
4. Open that URL in your browser. You should see the DataUniverse app (login page or home). Try logging in or loading a page to confirm it talks to the API.
5. **Write down the frontend temporary URL** in your Notepad.  
**✓ Phase 3 done.** Both backend and frontend are live on Hostinger.

---

# PHASE 4 — Connect Your Domain (app.datauniverse.in and api.datauniverse.in)

---

## Step 4.1 — Connect api.datauniverse.in to the backend (in Hostinger)

1. In **hPanel** → **Websites**, find the **backend** Node.js app (the one whose temporary URL you use for `/health`).
2. Click it to open its dashboard.
3. Look for **Domain**, **Connect domain**, **Preferred domain**, or **Custom domain**.
4. Choose **Connect existing domain** or **Add domain** and type: **api.datauniverse.in**  
   - If Hostinger asks about **transfer**, choose **“Point domain”** or **“Domain registered elsewhere”** — you do **not** transfer.  
   - If **api.datauniverse.in** is “unsupported”, see the section above: **If You Want lms.datauniverse.in (and Hostinger Says “Unsupported”)** — try adding the root **datauniverse.in** first (Option B), then connect the subdomain.
5. Hostinger will show how to point the domain. They may show:
   - An **IP address** (e.g. `123.45.67.89`), or  
   - A **CNAME** target (e.g. `xxx.hostinger.site`).  
6. **Write down** exactly what they show for **api** (IP or CNAME value). You’ll use it in Step 4.3 in GoDaddy.
7. Save or confirm in Hostinger. Don’t worry if it says “Domain not connected yet” — that’s because we haven’t set DNS at GoDaddy.

---

## Step 4.2 — Connect app.datauniverse.in to the frontend (in Hostinger)

1. In **Websites**, open the **frontend** Node.js app.
2. Find **Domain** / **Connect domain** again.
3. Add: **app.datauniverse.in** (or **lms.datauniverse.in** if you added the root domain first and the UI lets you pick the **lms** subdomain).
4. If Hostinger asks about **transfer**, choose **“Point domain”** — do **not** transfer.
5. Note the **target** Hostinger gives you for this one (IP or CNAME). Write it down for **app** (or **lms**).
5. Save/confirm.

---

## Step 4.3 — Point app and api to Hostinger in GoDaddy (DNS)

1. Log in to **GoDaddy** ([godaddy.com](https://www.godaddy.com)).
2. Go to **My Products** (or **Domains**). Find **datauniverse.in** and click **DNS** (or **Manage DNS**).
3. You’ll see a list of DNS records (A, CNAME, etc.). We’ll **add** two new records (or edit if `app` / `api` already exist).

**If Hostinger gave you an IP address (A record):**

- Click **Add** (or **Add record**).
  - **Type:** A  
  - **Name:** `api`  
  - **Value:** the IP Hostinger gave you for the backend (e.g. `123.45.67.89`)  
  - **TTL:** 600 or default.  
  Click **Save**.
- Click **Add** again.
  - **Type:** A  
  - **Name:** `app`  
  - **Value:** the IP Hostinger gave you for the frontend (may be the same or different)  
  - **TTL:** 600 or default.  
  Click **Save**.

**If Hostinger gave you a CNAME (e.g. xxx.hostinger.site):**

- Click **Add**.
  - **Type:** CNAME  
  - **Name:** `api`  
  - **Value:** the CNAME target Hostinger showed for the backend (e.g. `backend-xxx.hostinger.site`)  
  - **TTL:** 600 or default.  
  Click **Save**.
- Click **Add** again.
  - **Type:** CNAME  
  - **Name:** `app`  
  - **Value:** the CNAME target Hostinger showed for the frontend  
  - **TTL:** 600 or default.  
  Click **Save**.

4. Wait **5–60 minutes** for DNS to propagate. You can check by opening `https://api.datauniverse.in/health` and `https://app.datauniverse.in` in the browser (may take a few tries after a few minutes).

---

## Step 4.4 — Make the frontend use api.datauniverse.in (and redeploy)

Once **api.datauniverse.in** works (e.g. `/health` returns OK), we switch the frontend to use the custom API URL so we don’t depend on the temporary backend URL.

1. In **hPanel** → **Websites**, open the **frontend** Node.js app.
2. Go to **Settings** or **Environment variables**.
3. Find **VITE_API_URL**. Change its value to:
   ```
   https://api.datauniverse.in/api
   ```
4. **Save**.
5. Trigger a **Redeploy** or **Build again** for the frontend (so the new API URL is baked into the build). Wait for the build to finish.

After this, **app.datauniverse.in** will call **api.datauniverse.in** for all API requests.  
**✓ Phase 4 done.** Your domain is connected end to end.

---

# PHASE 5 — SSL (HTTPS)

1. In **hPanel** → **Websites**, open the **backend** app. Look for **SSL**, **Security**, or **HTTPS**. Enable **SSL** for **api.datauniverse.in** if it’s not already on (Hostinger often does this automatically when you connect a domain).
2. Do the same for the **frontend** app and **app.datauniverse.in**.
3. Test:  
   - **https://api.datauniverse.in/health**  
   - **https://app.datauniverse.in**  
   Both should load over HTTPS (padlock in the browser).  
**✓ Phase 5 done.**

---

# Final Checklist

- [ ] **Phase 0:** Code is on GitHub (repo + push).
- [ ] **Phase 1:** MySQL database created on Hostinger; DATABASE_URL saved.
- [ ] **Phase 2:** Backend deployed (root `backend`, env vars set); `/health` works on temporary URL.
- [ ] **Phase 3:** Frontend deployed (root repo, VITE_API_URL = temporary backend URL); app loads on temporary URL.
- [ ] **Phase 4:** api.datauniverse.in and app.datauniverse.in connected in Hostinger; DNS set in GoDaddy for `api` and `app`; VITE_API_URL updated to `https://api.datauniverse.in/api` and frontend redeployed.
- [ ] **Phase 5:** SSL enabled for both; https://api.datauniverse.in/health and https://app.datauniverse.in work.

---

# Troubleshooting

- **Backend build fails:** Check build logs. Ensure Root directory is exactly `backend` and DATABASE_URL is one line with no extra spaces. If the password has special characters, URL-encode them in DATABASE_URL.
- **Frontend build fails:** Ensure Root directory is empty or `.` and that `npm run build` works locally. Check that VITE_API_URL has no trailing slash (use `/api` at the end).
- **“CORS” or “blocked” in browser:** In the **backend** env vars, set `CORS_ORIGINS` to `https://app.datauniverse.in` (and any other frontend URLs you use), then redeploy the backend.
- **api.datauniverse.in or app.datauniverse.in not loading:** Wait longer for DNS (up to 1 hour). In GoDaddy, confirm the A or CNAME records for `api` and `app` are correct. In Hostinger, confirm both domains are attached to the right apps.
- **App loads but login/API fails:** Confirm VITE_API_URL is `https://api.datauniverse.in/api` and that you redeployed the frontend after changing it. Open browser DevTools → Network and see which URL the app is calling.

For cost and other options, see [DEPLOY_COST.md](./DEPLOY_COST.md).
