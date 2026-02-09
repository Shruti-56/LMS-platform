# Start Here — What You Have & What Needs to Happen

## What you have (in simple words)

1. **GoDaddy domain**  
   You own the name **datauniverse.in**. That’s like owning the signboard. Right now when people type **www.datauniverse.in** in the browser, they see your Wix site.

2. **A static site on Wix**  
   Your current website (brochure, contact, “Enroll Now”, etc.) is built and hosted on Wix. It’s already live and working. **Nothing here needs to change.**

---

## What you want

- The **DataUniverse learning app** (the one in this project: login, courses, admin, fees, certificates) to be **on the internet** so that:
  - You and your team can use the admin panel.
  - Students can log in and take courses.

- You want it at a **separate address** so the current Wix site stays as it is:

| Address                 | What people see        |
|-------------------------|------------------------|
| **www.datauniverse.in** | Same as now → Wix site  |
| **app.datauniverse.in** | New → Learning app     |

So: **Wix = marketing site. app.datauniverse.in = the actual learning platform.**

---

## What “deploy” means (one sentence)

Right now the app runs only on a computer (yours or the developer’s). **Deploy** means putting it on a company’s computers that are always on and on the internet, so anyone can open **app.datauniverse.in** and use it.

---

## What actually has to happen (no tech jargon)

1. **Host the app**  
   A company (e.g. Render, Railway, Vercel, or a server you rent) needs to “run” the app 24/7: the **website part** (what users see) and the **server part** (that handles login, courses, database).

2. **Tell your domain where to send people**  
   In GoDaddy you add **one rule**: “When someone goes to **app.datauniverse.in**, send them to that company’s address.” (That rule is called a “CNAME” or “A record” — the person doing the setup will know.)

3. **Leave Wix and www as they are**  
   You do **not** change where **www.datauniverse.in** points. It keeps pointing to Wix.

That’s all. You don’t need to understand servers, DNS, or code. You only need either to **do these two things with a hosting company** (with step-by-step help) or **give the job to someone who does**.

---

## What you should do next (choose one)

### Option 1: Give it to a developer (easiest for you)

1. You have:
   - This project (the **learnflow-demo** folder / GitHub repo).
   - GoDaddy login (for datauniverse.in).
   - This file.

2. Tell the developer (or a freelancer on Upwork/Fiverr):

   - “We have the domain **datauniverse.in** on GoDaddy and our current website is on Wix at **www.datauniverse.in**. Don’t change that.
   - We want the learning app in this project to be live at **app.datauniverse.in**.
   - Please deploy it (host the app and point **app.datauniverse.in** to it). Our Wix site should stay as it is.”

3. Give them:
   - Access to the **code** (e.g. GitHub repo).
   - This file: **DEPLOY_READ_THIS_FIRST.md**.
   - The other deployment doc that has the technical steps: **DEPLOY_PRODUCTION_SCALABLE.md** (so they use a proper, scalable setup).
   - If they need to change DNS, they’ll tell you exactly what to add in GoDaddy (one CNAME for “app”), or you can give them temporary GoDaddy access.

You don’t need to understand the technical steps; they do.

---

### Option 2: You do it yourself (with a hosting company)

If you prefer to do it yourself:

- You’ll need to create accounts on a **hosting** website (e.g. Render or Vercel).
- You’ll follow a **step-by-step guide** (like **DEPLOY_SIMPLE_STEP_BY_STEP.md** in this folder) that says: “Click here, paste this, add this in GoDaddy.”
- You won’t need to understand *why* each step works, only to follow the steps in order.

If you want to try this, open **DEPLOY_SIMPLE_STEP_BY_STEP.md** and start from Part 1. When you’re stuck, you can send a developer that file and say: “I’m stuck at Part X” — they’ll know what to do.

---

## Short summary

- **You have:** GoDaddy domain (datauniverse.in) + static site on Wix. That’s it.
- **You want:** The learning app live at **app.datauniverse.in**, and **www** / Wix unchanged.
- **What “deploy” means:** Put the app on a host so it’s on the internet 24/7 and point **app.datauniverse.in** to it.
- **What you do:** Either (1) give this + the code to a developer and ask them to deploy to **app.datauniverse.in**, or (2) follow **DEPLOY_SIMPLE_STEP_BY_STEP.md** yourself and add one DNS rule in GoDaddy when the guide says so.

No need to understand servers or code. You only need to decide: **developer** or **follow the step-by-step**.
