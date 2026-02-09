# Production Deployment — Suitable & Scalable for DataUniverse (Client Use)

This guide is for **real client use**: reliable, scalable, and maintainable. It uses **paid, production-grade services**—no free-tier limitations, no spin-down, proper backups and support.

**Domain:** **app.datauniverse.in** (LMS) | **www.datauniverse.in** (existing Wix site, unchanged)

---

## Why This Stack (Not “Easy” or “Free”)

| Concern | Approach |
|--------|----------|
| **Uptime** | Paid hosting with SLA; no “sleep” or cold starts. |
| **Scalability** | Managed database and app hosting that can scale with students and traffic. |
| **Backups** | Automated daily DB backups; point-in-time recovery where available. |
| **Performance** | CDN for frontend; app and DB in same region (e.g. Asia) for low latency in India. |
| **Security** | HTTPS, managed DB with restricted access, secrets in env vars, no shared free-tier noise. |
| **Support** | Paid plans so you get documentation and support when something breaks. |

---

## Recommended Architecture

```
                    ┌─────────────────────────────────────┐
                    │  GoDaddy DNS (datauniverse.in)      │
                    │  www → Wix (unchanged)               │
                    │  app → Frontend (below)              │
                    └─────────────────┬─────────────────────┘
                                     │
    Users (India)                    ▼
    ─────────────►  ┌─────────────────────────────────────┐
                   │  Frontend (React)                    │
                   │  Vercel Pro OR Cloudflare Pages      │
                   │  app.datauniverse.in                 │
                   │  Global CDN, SSL, fast static assets  │
                   └─────────────────┬─────────────────────┘
                                     │ HTTPS
                                     ▼
                   ┌─────────────────────────────────────┐
                   │  Backend (Node.js + Express)         │
                   │  Railway (paid) OR VPS (DO/AWS)      │
                   │  api.datauniverse.in (optional)      │
                   └─────────────────┬─────────────────────┘
                                     │
                                     ▼
                   ┌─────────────────────────────────────┐
                   │  MySQL (managed)                    │
                   │  PlanetScale / DO Managed DB / RDS  │
                   │  Backups, scaling, no self-host      │
                   └─────────────────────────────────────┘

                   ┌─────────────────────────────────────┐
                   │  Files (videos, PDFs, uploads)      │
                   │  AWS S3 (existing) — keep as-is      │
                   └─────────────────────────────────────┘
```

---

## 1. Database — Managed MySQL (Required for Production)

**Do not** run MySQL on the same server as the app for a client. Use a **managed** service: automated backups, patches, and scaling.

### Option A: PlanetScale (recommended for scalability)

- **Why:** Branching, automatic backups, scaling, good for growth. Works well with Node/Prisma.
- **Plan:** Scaler or higher (paid). [planetscale.com](https://planetscale.com)
- **Region:** Choose **Asia (Mumbai or Singapore)** for datauniverse.in users.
- **After creation:** Connect → “General” → copy the connection string. You’ll set it as `DATABASE_URL` (with `?sslaccept=strict` if shown).

### Option B: DigitalOcean Managed MySQL

- **Why:** Simple, predictable pricing, daily backups, same provider as VPS if you use DO.
- **Plan:** Basic (1 GB RAM) or higher. [digitalocean.com](https://www.digitalocean.com/products/managed-databases-mysql)
- **Region:** Bangalore or Singapore.
- **Connection:** Use the “Connection string” or build:  
  `mysql://user:password@host:25060/defaultdb?ssl=true`

### Option C: AWS RDS (MySQL)

- **Why:** Enterprise-grade, full control, compliance if needed later.
- **Plan:** db.t3.micro or larger. Region: ap-south-1 (Mumbai).
- **Security:** DB in private subnet; only backend can connect. Use RDS-generated endpoint and port.

**Important:** Enable **automated backups** (daily, 7-day retention minimum) on whichever you choose.

---

## 2. Backend — Node.js API (Always On, Scalable)

### Option A: Railway (recommended if you want minimal server management)

- **Why:** No cold starts on paid plan, easy env and deploys, good for a small team.
- **Plan:** Paid (e.g. Team or usage-based). [railway.app](https://railway.app)
- **Steps:**
  1. New Project → Deploy from GitHub (your repo).
  2. Add service: **Root directory** = `backend`.
  3. **Build:** `npm install && npx prisma generate && npm run build`
  4. **Start:** `npx prisma migrate deploy && node dist/app.js`
  5. **Env:** `NODE_ENV=production`, `PORT=3001`, `DATABASE_URL=<from step 1>`, `JWT_SECRET=<strong random 32+ chars>`, `CORS_ORIGINS=https://app.datauniverse.in`
  6. Add custom domain: `api.datauniverse.in` (optional; or use Railway’s default URL).
  7. Always-on / no sleep: guaranteed on paid plan.

### Option B: VPS (DigitalOcean / AWS EC2 / Linode) — full control

- **Why:** You own the box; scale vertically (bigger instance) or add more instances later.
- **Sizing:** Start with 2 GB RAM (e.g. DigitalOcean Basic Droplet or AWS t3.small). Region: Mumbai or Singapore.
- **Stack:** Ubuntu 22.04, Node 20, PM2, Nginx as reverse proxy.
- **Process:**
  1. Install Node, clone repo, `cd backend && npm ci && npx prisma generate && npm run build`.
  2. Run migrations: `npx prisma migrate deploy`.
  3. Start with PM2: `pm2 start dist/app.js --name datauniverse-api`, `pm2 save`, `pm2 startup`.
  4. Nginx: server block for `api.datauniverse.in` → `proxy_pass http://localhost:3001`.
  5. SSL: `certbot --nginx -d api.datauniverse.in`.
- **Env:** Use a `.env` file (chmod 600) or systemd env; never commit secrets.

Use **Option A** if you want less ops; **Option B** if you or a devops person want full control.

---

## 3. Frontend — React App (CDN, Fast, Reliable)

### Option A: Vercel Pro (recommended)

- **Why:** Global CDN, automatic SSL, zero-downtime deploys, good DX and support for production.
- **Plan:** Pro (paid). [vercel.com](https://vercel.com)
- **Steps:**
  1. Import GitHub repo. Framework: Vite. Root: repo root.
  2. **Build command:** `npm run build`. **Output directory:** `dist`.
  3. **Env (build-time):** `VITE_API_URL=https://api.datauniverse.in/api` (or your backend URL; must end with `/api`).
  4. **Custom domain:** Add `app.datauniverse.in`. Vercel will show the CNAME target (e.g. `cname.vercel-dns.com`).

### Option B: Cloudflare Pages (paid / Workers Paid)

- **Why:** Strong CDN, DDoS protection, good for global + Indian traffic.
- **Steps:** Connect repo, build command and output same as above, add env `VITE_API_URL`, add custom domain `app.datauniverse.in`.

Use **one** of these; both are production-grade. Vercel is often easier for React/Vite.

---

## 4. Domain & DNS (GoDaddy)

- **www.datauniverse.in** → Leave pointing to Wix. Do not change.
- **app.datauniverse.in** → Points to your **frontend** (Vercel or Cloudflare).
- **api.datauniverse.in** (optional) → Points to your **backend** (Railway or your VPS).

In **GoDaddy** → **DNS** for **datauniverse.in**:

| Type  | Name | Value (example)           | TTL  |
|-------|------|---------------------------|------|
| CNAME | app  | `cname.vercel-dns.com`    | 3600 |
| CNAME | api  | `xxx.railway.app` or VPS  | 3600 |

(Use the exact target your frontend/backend host shows for the custom domain.)

---

## 5. Environment Variables Summary

**Backend (Railway or VPS):**

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mysql://...   # from managed MySQL
JWT_SECRET=<32+ char random secret>
CORS_ORIGINS=https://app.datauniverse.in
# If you use S3: AWS_*, etc.
```

**Frontend (Vercel/Cloudflare — build-time):**

```env
VITE_API_URL=https://api.datauniverse.in/api
```

(If you don’t use `api.datauniverse.in`, use the actual backend URL, e.g. `https://your-app.railway.app/api`.)

---

## 6. Post-Deploy: Backups, Monitoring, SSL

- **Database:** Automated daily backups (PlanetScale/DO/RDS). Test restore once.
- **SSL:** Vercel/Cloudflare and Railway provide HTTPS; on VPS use Let’s Encrypt (certbot).
- **Monitoring:** Uptime (e.g. UptimeRobot) for `https://app.datauniverse.in` and your API URL. Optional: error tracking (e.g. Sentry) for backend and frontend.
- **Logs:** Railway has logs; on VPS use `pm2 logs` and optionally ship to a log service.

---

## 7. Scaling Later

- **More students/traffic:** Upgrade DB plan (more RAM/connections); upgrade backend (Railway scale or bigger VPS); frontend CDN already scales.
- **Heavy video usage:** Keep S3 + CDN (CloudFront or similar) for media; ensure backend only does API work.
- **High availability:** Add a second backend instance behind a load balancer; use managed DB with multi-AZ if needed.

---

## 8. Cost (Rough, Monthly)

- **Managed MySQL:** ~$15–40 (PlanetScale Scaler / DO Basic / RDS small).
- **Backend Railway:** ~$5–20 (usage-based) or **VPS:** ~$12–24 (2 GB).
- **Frontend Vercel Pro:** ~$20.
- **Domain:** Already on GoDaddy.
- **S3:** Pay per use (you likely have this already).

**Total:** ~\$50–100/month for a production setup that is suitable and scalable for a real client.

---

## Checklist (Production)

- [ ] Managed MySQL in Asia; backups enabled; `DATABASE_URL` in backend only.
- [ ] Backend on Railway (paid) or VPS with PM2; env vars set; no sleep/cold start.
- [ ] Frontend on Vercel Pro (or Cloudflare); `VITE_API_URL` points to backend API URL.
- [ ] GoDaddy: CNAME `app` → frontend; CNAME `api` → backend (if used).
- [ ] SSL on app and api; CORS only `https://app.datauniverse.in`.
- [ ] Uptime check on app and API; optional error tracking and logs.
- [ ] One successful DB restore test from backup.

This setup is **suitable and scalable** for DataUniverse as a real client—no reliance on free or “easy” tiers that limit reliability or growth.
