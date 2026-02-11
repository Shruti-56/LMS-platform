# Put Your LMS on datauniverse.in (Hostinger + GoDaddy)

Your boss has **Hostinger** (for hosting) and **datauniverse.in** on **GoDaddy** (for the domain). You want the **LMS app** to open when anyone visits **datauniverse.in** (no separate app subdomain). You don’t need the current static marketing site.

This guide assumes you follow the main steps in **[DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)** for deploying the app on Hostinger. Here we only change **which domain** the frontend uses and **why you see the GoDaddy message**.

---

## “Finish setting up your Business plan” on Hostinger

If Hostinger shows **Finish setting up your Business plan** (or similar), you must complete this once so the plan is active. You can still deploy the LMS (Node.js) afterward.

1. In **hPanel** → **Home**, find your plan under **Account actions** and click **Setup**.
2. When asked to **create a new website** or **migrate**, choose **Create a new website** → **Next**.
3. When asked to **select a platform** (WordPress, Website Builder):
   - Click **Skip**. You do **not** need WordPress or Website Builder for the LMS. You will add **Node.js apps** later from **Websites** → **Add Website** → **Node.js Apps**.
4. When asked for a **domain**:
   - Click **Use a temporary domain** (e.g. `yoursite.hostinger.site`). You will connect **datauniverse.in** later from GoDaddy DNS.
5. Choose **server location** (e.g. recommended one) → **Next** and wait for setup to finish.

After this, your Business plan is active. Go to **Websites** → **Add Website** → **Node.js Apps** and follow [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md) to deploy the backend and frontend (then use this guide to point datauniverse.in to the frontend).

---

## Why You See “This domain is registered, but may still be available”

That text is **GoDaddy’s default parking page**. It appears when:

- The domain **datauniverse.in** is not pointing to any hosting yet, or  
- GoDaddy’s “Website” or “Forwarding” is still set to that placeholder.

So:

- You **do** own **datauniverse.in** (it’s registered).
- To show your LMS instead of that message, you must:
  1. Deploy the LMS on Hostinger (backend + frontend).
  2. **Point** datauniverse.in to Hostinger using **DNS** in GoDaddy (no need to transfer the domain).

After DNS is set correctly, the parking message will disappear and **datauniverse.in** will show your LMS.

---

## What You’ll Have When Done

| What              | URL                      |
|-------------------|--------------------------|
| **LMS (frontend)**| **https://datauniverse.in** (and https://www.datauniverse.in) |
| **API (backend)** | **https://api.datauniverse.in** |

Database and both apps run on Hostinger; the domain stays on GoDaddy and only **points** to Hostinger.

---

## Step 1 — Deploy the LMS on Hostinger

Do **Phases 0–3** from **[DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)**:

1. **Phase 0:** Push your project to GitHub.
2. **Phase 1:** Create MySQL database on Hostinger and note `DATABASE_URL`.
3. **Phase 2:** Deploy the **backend** as a Node.js app (root directory `backend`). Set env vars (e.g. `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` — see below). Note the **temporary URL** (e.g. `https://xxx.hostinger.site`).
4. **Phase 3:** Deploy the **frontend** as a second Node.js app (root = repo root). Set **VITE_API_URL** = `https://that-temporary-backend-url/api`. Note the **temporary URL** for the frontend.

**Backend CORS:** Because the LMS will open at **datauniverse.in** (not app.datauniverse.in), set:

- **CORS_ORIGINS** = `https://datauniverse.in,https://www.datauniverse.in`

(Add both so http→https redirects and www work.)

---

## Step 2 — Connect datauniverse.in (and www) to the Frontend in Hostinger

In **DEPLOY_HOSTINGER.md**, Phase 4 uses **app.datauniverse.in** for the frontend. For you we use the **main domain** instead.

1. In **hPanel** → **Websites**, open the **frontend** Node.js app.
2. Find **Domain** / **Connect domain** / **Preferred domain**.
3. When asked which domain to connect:
   - Add **datauniverse.in** (root domain). If Hostinger offers **www** as well, add **www.datauniverse.in**.
   - If they ask about “transfer”, choose **“Point domain”** or **“Domain is registered elsewhere”** — do **not** transfer.
4. Hostinger will show either an **IP address** or a **CNAME** target for this site. **Write it down** (you’ll use it in Step 4 in GoDaddy).

---

## Step 3 — Connect api.datauniverse.in to the Backend in Hostinger

1. In **hPanel** → **Websites**, open the **backend** Node.js app.
2. **Connect domain** and add **api.datauniverse.in**.
3. Choose **“Point domain”** (not transfer).
4. Note the **IP** or **CNAME** Hostinger gives you for the backend.

---

## Step 4 — Point datauniverse.in to Hostinger in GoDaddy (DNS)

This is what removes the “This domain is registered, but may still be available” page and shows your LMS.

1. Log in to **GoDaddy** → **My Products** → **Domains** → **datauniverse.in** → **DNS** (or **Manage DNS**).
2. **Optional but recommended:** Turn off any **Domain Forwarding** or **Parking** that might be set for datauniverse.in (so the domain is controlled only by DNS records).
3. Add or edit DNS records so that **datauniverse.in** and **www** point to your **frontend** on Hostinger, and **api** points to the **backend**:

**If Hostinger gave you an IP (A record):**

| Type | Name | Value        | TTL   |
|------|------|--------------|-------|
| A    | `@`  | Hostinger IP for frontend | 600 (or default) |
| A    | `www` | Same IP (or second IP if Hostinger gave one) | 600 |
| A    | `api` | Hostinger IP for backend  | 600 |

**If Hostinger gave you a CNAME:**

| Type  | Name | Value                          | TTL   |
|-------|------|--------------------------------|-------|
| CNAME | `www` | Hostinger CNAME for frontend   | 600   |
| CNAME | `api` | Hostinger CNAME for backend    | 600   |

For the **root** (datauniverse.in with name `@`), many hosts only give an **A** record. If Hostinger gave only CNAME (e.g. `xxx.hostinger.site`), check their help: sometimes you add an **A** record they specify for `@`, or they ask you to use their **nameservers** so they can set `@` for you.

4. **Save** the records. Wait **5–60 minutes** (sometimes up to 24 hours). Then try **https://datauniverse.in** — you should see your LMS instead of the GoDaddy message.

---

## Step 5 — Point API and Set Frontend API URL

1. Ensure **api.datauniverse.in** DNS is set (Step 4). Test: open **https://api.datauniverse.in/health** — you should see `{"status":"ok",...}`.
2. In Hostinger, open the **frontend** app → **Environment variables**.
3. Set **VITE_API_URL** = `https://api.datauniverse.in/api`
4. **Redeploy** the frontend so the new API URL is used.

After this, **datauniverse.in** will load the LMS and the LMS will call **api.datauniverse.in** for the API.

---

## Step 6 — SSL (HTTPS)

In Hostinger, enable **SSL** for:

- **datauniverse.in** (and **www.datauniverse.in** if you added it) on the **frontend** app  
- **api.datauniverse.in** on the **backend** app  

Hostinger often does this automatically when you connect the domain. Check **SSL** / **Security** in each app’s settings.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Deploy backend + frontend on Hostinger (see [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md) Phases 0–3). Use **CORS_ORIGINS** = `https://datauniverse.in,https://www.datauniverse.in`. |
| 2 | In Hostinger, connect **datauniverse.in** (and **www**) to the **frontend** app. Note target (IP or CNAME). |
| 3 | In Hostinger, connect **api.datauniverse.in** to the **backend** app. Note target. |
| 4 | In **GoDaddy** DNS, point **@** and **www** to frontend target, **api** to backend target. This removes the “domain is registered, but may still be available” page. |
| 5 | Set **VITE_API_URL** = `https://api.datauniverse.in/api` and redeploy frontend. |
| 6 | Enable SSL for datauniverse.in, www, and api.datauniverse.in. |

Result: **datauniverse.in** (and **www.datauniverse.in**) open your LMS; **api.datauniverse.in** is the API. The old static site is replaced because the whole domain now points to the Hostinger frontend app.

For the full Hostinger walkthrough (GitHub, MySQL, build commands, env vars), use **[DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)** and only change the domain steps as above.
