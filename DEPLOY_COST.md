# Deployment Cost — DataUniverse (app.datauniverse.in)

Rough monthly cost in **USD**. You already have the domain (GoDaddy), so that’s not included.

---

## Option A — Lowest cost (good to start / test)

What the **Do It Yourself** guide uses (Render + PlanetScale free tiers):

| Service | Plan | Cost (approx/month) |
|--------|------|----------------------|
| **GitHub** | Free | **$0** |
| **PlanetScale** | Hobby (free) | **$0** |
| **Render – Backend** | Free | **$0** |
| **Render – Frontend** | Free | **$0** |
| **GoDaddy (domain)** | You already have | **$0** (already paying) |
| **Total** | | **$0 / month** |

**Catch:**  
- On Render’s **free** plan, the **backend** “sleeps” after 15 minutes of no use. The **first** person who opens the app after that may wait 30–60 seconds before the page loads. After that it’s fast until it sleeps again.  
- Free tier is fine for **testing** or **very light** use. For a **real client** with students using it daily, Option B is better.

---

## Option B — Recommended for client (always on, reliable)

Paid plans so the app is always on and stable:

| Service | Plan | Cost (approx/month) |
|--------|------|----------------------|
| **GitHub** | Free | **$0** |
| **PlanetScale** | Scaler (~$29) or Team | **~$29** |
| **Render – Backend** | Starter / paid (~$7) | **~$7** |
| **Render – Frontend** | Free (static sites often free) | **$0** |
| **GoDaddy (domain)** | You already have | **$0** (already paying) |
| **Total** | | **~$35–40 / month** |

- Backend **does not sleep**; app is fast every time.  
- Database has proper backups and support.  
- Good for **production** use (real students, daily use).

*(Exact Render/PlanetScale prices can change; check their sites. Plan names may be “Starter”, “Scaler”, etc.)*

---

## Option C — More scalable / professional

If you want even more reliability and room to grow (e.g. from DEPLOY_PRODUCTION_SCALABLE.md):

| Service | Plan | Cost (approx/month) |
|--------|------|----------------------|
| **Vercel** (frontend) | Pro | **~$20** |
| **Railway** (backend) | Paid usage | **~$5–15** |
| **PlanetScale** (database) | Scaler | **~$29** |
| **Total** | | **~$55–65 / month** |

---

## Option D — Hostinger (all-in-one)

**Yes, you can use Hostinger.** They support Node.js on **Business** and **Cloud** plans (Express, React, GitHub deploy). You can run your backend and serve the frontend there, and use **Hostinger's MySQL** instead of PlanetScale so everything is in one place.

| Service | Plan | Cost (approx/month) |
|--------|------|----------------------|
| **Hostinger** | Business or Cloud Startup | **~$4–8** (check current prices) |
| **GoDaddy (domain)** | You already have | **$0** (already paying) |
| **Total** | | **~$4–8 / month** |

- **Backend:** Deploy your Node/Express API as a Node.js app (GitHub connect or upload).
- **Frontend:** Build the React app (`npm run build`) and deploy the static output, or use Hostinger's Node.js app for the SPA.
- **Database:** Create a MySQL database in the Hostinger panel and set `DATABASE_URL` in your app's env (same Prisma/MySQL setup).

**Trade-off:** Single provider and often cheaper than Render + PlanetScale, but setup and limits are Hostinger-specific (e.g. number of Node apps per plan). Good if you prefer one bill and are okay with Hostinger's dashboard and docs.

**Step-by-step:** See **[DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)** for full instructions (MySQL, backend app, frontend app, and domain connection).

---

## Summary

| Option | Total/month (approx) | Best for |
|--------|----------------------|----------|
| **A – Free** | **$0** | Testing, demos, very light use (backend may sleep) |
| **B – Render paid** | **~$35–40** | Real client, students, daily use, always on |
| **C – Vercel + Railway** | **~$55–65** | More scalable, very professional setup |
| **D – Hostinger** | **~$4–8** | All-in-one, lower cost, single provider |

For **DataUniverse as a real client**, **Option B** is a good balance: **about $35–40 per month**, always on, with a proper database and backups. **Option D** is a valid alternative if you want to use Hostinger and keep cost lower.

All amounts above are in **USD**. If you pay in INR, use your card/bank’s exchange rate for the month.
