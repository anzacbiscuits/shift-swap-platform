# Railway Deployment Guide

The GitHub repo (`anzacbiscuits/shift-swap-platform`) and Railway build config
are already set up. Follow these steps to get a live deployment.

---

## STEP 1: Push the code to GitHub

The repo remote is already configured. From the project folder, commit and push:

```bash
cd ~/Desktop/shift-swap-platform
git add -A
git commit -m "Fix admin seeding and Railway build config"
git push -u origin main
```

(If this is the first push and you're prompted to log in, use your GitHub
username and a personal access token as the password.)

---

## STEP 2: Deploy on Railway

1. Go to https://railway.app and sign in with GitHub.
2. New Project → Deploy from GitHub repo → select `shift-swap-platform`.
3. Railway auto-detects the config (`nixpacks.toml`) and builds it.

---

## STEP 3: Set environment variables

In the service → **Variables** tab, add:

```
NODE_ENV=production
JWT_SECRET=<a long random string>
ADMIN_EMAIL=arjun@psychiatry.health
ADMIN_PASSWORD=<choose a strong password>
ADMIN_NAME=Arjun Mahadevan
```

The admin account is created automatically on startup from these values, so
admin login works immediately after deploy. Change ADMIN_PASSWORD from the old
default.

---

## STEP 4: Add a persistent volume (so data survives redeploys)

By default SQLite data is wiped on every redeploy. To keep users and swaps:

1. In the service, add a **Volume** and set its mount path to `/data`.
2. Add another variable: `DB_PATH=/data/shiftswap.db`
3. Redeploy.

Skip this only if you're just testing and don't mind data resetting.

---

## STEP 5: Get your live URL

Service → **Settings** → **Networking** → **Generate Domain**. Open the URL and
log in with your admin email/password.

---

## Troubleshooting

- **Build fails:** check the Railway build logs. The build installs client deps
  and runs the React build via `nixpacks.toml`.
- **Can't log in as admin:** confirm ADMIN_EMAIL / ADMIN_PASSWORD are set, then
  check the deploy logs for the "Admin account seeded" line.
- **Data disappears on redeploy:** you haven't attached a volume (see Step 4).
