# Railway Deployment Guide - Step by Step

Follow these steps **exactly** to deploy to Railway.

## Prerequisites
- GitHub account (create at https://github.com if you don't have one)
- Railway account (sign up at https://railway.app)

---

## STEP 1: Create GitHub Account (5 minutes)

1. Go to https://github.com
2. Click "Sign up"
3. Enter email, create password, choose username
4. Verify email
5. Complete setup

---

## STEP 2: Create GitHub Repository (2 minutes)

1. Log in to GitHub
2. Click "+" icon (top right) → "New repository"
3. Name: `shift-swap-platform`
4. **IMPORTANT**: Leave all checkboxes UNCHECKED
5. Click "Create repository"
6. **Copy the URL** shown

---

## STEP 3: Push Code to GitHub (5 minutes)

Open terminal and run:

```bash
cd ~/Desktop/shift-swap-platform

git init
git add .
git commit -m "Initial commit: Shift swap platform"
git remote add origin https://github.com/YOUR_USERNAME/shift-swap-platform.git
git branch -M main
git push -u origin main
```

---

## STEP 4: Sign Up for Railway (2 minutes)

1. Go to https://railway.app
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Railway

---

## STEP 5: Deploy to Railway (3 minutes)

1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select `shift-swap-platform` repository
4. Click "Deploy"

Wait for build to complete (2-3 minutes).

---

## STEP 6: Configure Environment Variables (2 minutes)

1. After deploy, click your project
2. Click the `web` service
3. Go to "Variables" tab
4. Add these variables:

```
NODE_ENV=production
JWT_SECRET=shift-swap-secret-key-123456
```

5. Save

App will redeploy automatically.

---

## STEP 7: Get Your Live URL (1 minute)

1. In Railway, go to "Settings"
2. Look for "Domains"
3. You'll see your live URL!
4. Click it to open your app

---

## STEP 8: Create Admin Account

The admin account is created when you run `npm run setup` locally, but you'll need to create it on the live app too.

1. Register as normal user
2. Tell me the email
3. I can help set you as admin on the live database

---

## Troubleshooting

### Build failed
- Check Railway logs
- Ensure all files are committed to GitHub
- Try redeploying

### App won't start
- Check environment variables
- Wait 2-3 minutes for startup
- Check Rails logs

### Database issues
- Database auto-creates on first start
- No setup needed on Railway

---

**You're ready! Go create your GitHub account and repo, then deploy!**
