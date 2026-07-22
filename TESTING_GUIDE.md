# Testing Guide - Shift Swap Platform

Your admin account is ready!

## Admin Credentials

```
Email: arjun@psychiatry.health
Password: AdminPassword123!
```

⚠️ Change this password after first login!

---

## Quick Start - Local Testing

### Step 1: Install Dependencies

```bash
cd ~/Desktop/shift-swap-platform
npm run install-all
```

### Step 2: Set Up Admin Account

```bash
cd server
npm run setup
```

### Step 3: Start the App

From project root:

```bash
npm run dev
```

Wait for both to compile.

### Step 4: Open in Browser

Go to: **http://localhost:3000**

---

## Testing Checklist

- [ ] Admin login works
- [ ] Create registrars via admin panel
- [ ] User registration works
- [ ] Create swap request (3 steps)
- [ ] Swap board displays correctly
- [ ] Matching algorithm works
- [ ] Messages send/receive
- [ ] Dashboard shows stats
- [ ] Edit swaps works
- [ ] Delete swaps works
- [ ] Admin delete registrar works
- [ ] Mobile responsive
- [ ] Cross-browser compatibility

See full testing guide in TESTING_GUIDE.md for detailed steps with each feature.

---

## Common Issues

### "Database error" on login
- Run `npm run setup` first
- Check `server/shiftswap.db` exists

### "Port 3000 already in use"
- Kill process on port 3000
- Or use different port

### Button doesn't work
- Check browser console (F12)
- Check for errors in terminal

---

## After Testing

1. Deploy to Railway (follow DEPLOYMENT_GUIDE.md)
2. Test on live URL
3. Change admin password
4. Provide registrar list
5. Go live!
