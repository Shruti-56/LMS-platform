# Deploying DataUniverse with GoDaddy Domain + Wix Site

This guide is for when you have:
- **Domain** from GoDaddy (e.g. `yourinstitute.com`)
- **Static/marketing site** already on Wix

Goal: keep Wix as your main site and run the **DataUniverse app** (login, courses, admin, etc.) on a **subdomain**.

---

## Recommended setup

| What              | Where it lives | URL example           |
|-------------------|----------------|------------------------|
| Wix (marketing)   | Wix            | `www.yourinstitute.com` or `yourinstitute.com` |
| DataUniverse app  | Your hosting   | `app.yourinstitute.com` or `learn.yourinstitute.com` |

You will:
1. Deploy the **backend** (Node + MySQL) and **frontend** (React) to a hosting provider.
2. In **GoDaddy DNS**, point a **subdomain** (e.g. `app`) to that hosting.
3. Leave the **root** or **www** domain pointing to Wix (no change there).

---

## Option A: Easiest — Render (frontend + backend + DB)

[Render](https://render.com) can host the React app, Node API, and a MySQL database. Free tier has limits and the backend may “spin down” when idle (first request can be slow); for a real client, the paid tier is recommended.

### 1. Prepare the repo

- Push the project to **GitHub** (or GitLab).
- Ensure `backend` has a **Dockerfile** or use Render’s “Native” Node + Nix.

### 2. Create MySQL database on Render

1. Render Dashboard → **New** → **PostgreSQL** or use **MySQL** (if available; otherwise use an external MySQL).
2. For **external MySQL** (e.g. [PlanetScale](https://planetscale.com), [Aiven](https://aiven.io), or a small VPS), create a database and note:
   - Host, port, database name, user, password  
   - Connection string format:  
     `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

### 3. Create Backend service on Render

1. **New** → **Web Service**.
2. Connect your GitHub repo.
3. **Root Directory**: `backend`.
4. **Build**: `npm install && npx prisma generate && npm run build`
5. **Start**: `npm run prisma migrate deploy && node dist/app.js`
6. **Environment** (replace with your values):

   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=mysql://...
   JWT_SECRET=your-very-long-random-secret-at-least-32-chars
   CORS_ORIGINS=https://app.yourinstitute.com
   ```

7. Deploy. Note the URL Render gives you, e.g. `https://your-app-name.onrender.com`.

### 4. Create Frontend (static site) on Render

1. **New** → **Static Site**.
2. Connect same repo.
3. **Root Directory**: leave default (repo root).
4. **Build**: `npm install && npm run build`
5. **Publish directory**: `dist`
6. **Environment**:

   ```env
   VITE_API_URL=https://your-app-name.onrender.com/api
   ```
   (Use the **backend** URL from step 3, with `/api` at the end.)

7. Deploy. You’ll get a URL like `https://your-frontend.onrender.com`.

### 5. GoDaddy DNS — point subdomain to the app

You want: **app.yourinstitute.com** → your deployed app (the **frontend**).

- If Render gave you a **custom domain** for the static site (e.g. `app.yourinstitute.com`):
  1. In Render (static site) → **Settings** → **Custom Domain** → add `app.yourinstitute.com`.
  2. Render will show what to add in DNS (usually a **CNAME** for `app` to `your-frontend.onrender.com`, or an **A** record).

- In **GoDaddy**:
  1. Go to **My Products** → **DNS** for `yourinstitute.com`.
  2. Add a record:
     - **Type**: CNAME (or A if Render says so).
     - **Name**: `app` (so it’s `app.yourinstitute.com`).
     - **Value**: the hostname Render tells you (e.g. `your-frontend.onrender.com` for CNAME).
  3. Save. Wait 5–60 minutes for DNS to update.

### 6. Use your domain in the app

- **Frontend env** (Render static site): set  
  `VITE_API_URL=https://your-backend.onrender.com/api`  
  (backend URL + `/api`).  
  Rebuild/redeploy after changing env.
- **Backend env**: set  
  `CORS_ORIGINS=https://app.yourinstitute.com`  
  so only your app domain can call the API.

After DNS propagates, open **https://app.yourinstitute.com** — it should load the DataUniverse app. Wix stays on **www** or root.

---

## Option B: Vercel (frontend) + Railway (backend + MySQL)

- **Vercel**: host the React app (connect GitHub, set `VITE_API_URL`, build command `npm run build`, output `dist` or default).
- **Railway**: create a **MySQL** service and a **Web Service** for the Node backend; add `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://app.yourinstitute.com`.
- **Custom domain**: In Vercel, add `app.yourinstitute.com` to the project; Vercel shows the CNAME target. In GoDaddy, add CNAME `app` → that target.
- Same idea: Wix stays on main domain, app on `app.yourinstitute.com`.

---

## Option C: Your own server (VPS)

If you have a Linux server (DigitalOcean, Linode, AWS EC2, etc.):

1. **Server**: Install Node, Nginx, and MySQL (or use a managed MySQL elsewhere and set `DATABASE_URL`).
2. **Backend**: Run with PM2: `cd backend && npm run build && npx prisma migrate deploy && pm2 start dist/app.js --name api`.
3. **Frontend**: Build with `VITE_API_URL=https://api.yourinstitute.com/api`, then serve the `dist/` folder with Nginx.
4. **Nginx**: Two server blocks:
   - `app.yourinstitute.com` → root = frontend `dist/`, `try_files $uri /index.html`.
   - `api.yourinstitute.com` → proxy_pass to `http://localhost:3001`.
5. **SSL**: Use Let’s Encrypt: `certbot --nginx -d app.yourinstitute.com -d api.yourinstitute.com`.
6. **GoDaddy DNS**: A record for `app` and `api` to your server’s IP (or CNAME if you use a hostname).

Again, leave **www** / root pointing to Wix in GoDaddy (A or CNAME to Wix as they instruct).

---

## GoDaddy DNS — summary

- **Do not change** the records that point your **main domain** or **www** to Wix (Wix’s instructions).
- **Add** a new record for the **subdomain** only:
  - **Name**: `app` (or `learn`, `lms`, etc.)
  - **Type**: CNAME (usually) or A
  - **Value**: what your app host (Render/Vercel/Railway/your server) tells you
- **SSL**: Render, Vercel, and Railway provide HTTPS for your subdomain. On your own server, use Certbot.

---

## Checklist before go-live

- [ ] Backend env: `NODE_ENV=production`, `JWT_SECRET` (strong, random), `DATABASE_URL`, `CORS_ORIGINS=https://app.yourinstitute.com`
- [ ] Frontend env: `VITE_API_URL=https://your-backend-url/api` (no trailing slash)
- [ ] Migrations: `cd backend && npx prisma migrate deploy`
- [ ] In GoDaddy, subdomain (e.g. `app`) points to the frontend host
- [ ] Wix still serves the main site on www/root
- [ ] Test login, API, and course flow on `https://app.yourinstitute.com`

---

## Quick reference — env vars

**Backend (production)**  
`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://app.yourinstitute.com`, `NODE_ENV=production`, `PORT`

**Frontend (build-time)**  
`VITE_API_URL=https://your-api-host/api`

If you tell me your chosen option (Render vs Vercel+Railway vs VPS) and your exact domain, I can give you a copy-paste DNS and env setup for that case.
