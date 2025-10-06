# Website Password Protection Setup

This guide explains how to set up and manage password protection for the MindForge Academy learning platform.

## ⚠️ Important Security Notice

**This is client-side authentication only** and is NOT secure against determined attackers. This feature is designed for:
- ✅ Classroom environments
- ✅ Family use
- ✅ Basic access control

**Do NOT use for:**
- ❌ Sensitive personal data
- ❌ Confidential information
- ❌ Financial data
- ❌ Medical records

Technical users can bypass this protection by inspecting the browser's developer tools. This is intentional - it's meant for convenience, not security.

---

## Quick Setup Guide

### Step 1: Generate a Password Hash

Run the password hash generator script:

```bash
node scripts/generate-website-password-hash.js
```

The script will:
1. Prompt you to enter a password (input will be hidden)
2. Ask you to confirm the password
3. Generate a SHA-256 hash
4. Display the hash and setup instructions

**Example output:**
```
✅ Hash erfolgreich generiert!

Ihr Passwort-Hash:
b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db

Verwendung in .env.local:
VITE_APP_PASSWORD_HASH=b0a7aa881e35ee7fd26630533f82bb07910c5a236c72fac9342077ee15ab72db
```

### Step 2: Create .env.local File

Create a file named `.env.local` in the project root directory:

```bash
# .env.local
VITE_APP_PASSWORD_HASH=YOUR_GENERATED_HASH_HERE
```

**Important:**
- Replace `YOUR_GENERATED_HASH_HERE` with the hash from Step 1
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Keep this file private and secure

### Step 3: Test the Setup

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` - you should see the login screen.

---

## Using the Platform

### For Teachers/Administrators

1. Share the **password** (not the hash) with your students/users
2. Users will need to enter this password to access the platform
3. The password is case-sensitive
4. After successful login, users stay logged in until they clear browser data

### For Students/Users

1. Open the platform URL
2. You'll see a login screen: "🧠 MindForge Academy - 🔒 Zugang zur Lernplattform"
3. Enter the password provided by your teacher
4. Click "Anmelden" (Login)
5. You'll now have access to all learning content

The platform will remember you're logged in, so you won't need to enter the password again unless you:
- Clear your browser data/cookies
- Use a different browser
- Use incognito/private browsing mode

---

## Managing Passwords

### Changing the Password

To change the website password:

1. Run the hash generator with your new password:
   ```bash
   node scripts/generate-website-password-hash.js
   ```

2. Update `.env.local` with the new hash

3. Restart the development server (or rebuild for production)

4. Inform all users of the new password

**Note:** Currently logged-in users will remain logged in until they clear their browser data.

### Removing Password Protection

To remove password protection entirely:

1. Delete or comment out the `VITE_APP_PASSWORD_HASH` line in `.env.local`:
   ```bash
   # VITE_APP_PASSWORD_HASH=...
   ```

2. Restart the server

The platform will now be accessible without a password.

---

## Production Deployment

### GitHub Pages Deployment

When deploying to GitHub Pages, you need to configure the password hash as a **GitHub Secret**:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `VITE_APP_PASSWORD_HASH`
5. Value: Your password hash (from the generator script)
6. Click "Add secret"

### Build with Password Protection

The build process will automatically include the password hash from your environment:

```bash
npm run build
```

For GitHub Pages deployment:

```bash
npm run deploy
```

The password protection will be active on the deployed site.

---

## Troubleshooting

### "Kein Passwort konfiguriert" Error

**Problem:** Login screen shows "Kein Passwort konfiguriert. Bitte VITE_APP_PASSWORD_HASH in .env.local setzen."

**Solution:**
1. Make sure `.env.local` exists in the project root
2. Verify the file contains `VITE_APP_PASSWORD_HASH=your_hash_here`
3. Restart the development server (`npm run dev`)

### Wrong Password Error

**Problem:** "Das eingegebene Passwort ist nicht korrekt"

**Solutions:**
- Check password is spelled correctly (case-sensitive)
- Verify the hash in `.env.local` matches the password you're using
- Regenerate the hash if unsure

### Rate Limit Error

**Problem:** "Zu viele fehlgeschlagene Versuche. Bitte versuchen Sie es in X Minute(n) erneut."

**Solution:**
- Wait 5 minutes after 5 failed attempts
- Clear browser's LocalStorage to reset immediately:
  1. Open browser Developer Tools (F12)
  2. Go to Application → Storage → Local Storage
  3. Delete `mindforge.website.attempts` key
  4. Reload the page

### Password Works in Development but Not Production

**Problem:** Password protection works locally but not on deployed site

**Solutions:**
1. Verify GitHub Secret `VITE_APP_PASSWORD_HASH` is set correctly
2. Check deployment logs for build errors
3. Rebuild and redeploy: `npm run build && npm run deploy`

---

## Technical Details

### How It Works

1. **Password Hashing:**
   - Passwords are hashed using SHA-256
   - Only the hash is stored, never the plain password
   - Hashing happens both client-side (verification) and during setup (generation)

2. **Session Management:**
   - Authentication status stored in LocalStorage
   - Key: `mindforge.website.auth`
   - Value: `authenticated` when logged in

3. **Rate Limiting:**
   - Failed attempts tracked in LocalStorage
   - Key: `mindforge.website.attempts`
   - Maximum 5 attempts per 5-minute window

### Files Involved

- **`.env.local`** - Local environment configuration (git-ignored)
- **`.env.example`** - Template and documentation
- **`scripts/generate-website-password-hash.js`** - Password hash generator
- **`src/modules/core/services/website-auth-service.ts`** - Authentication logic
- **`src/modules/ui/components/website-login-screen.tsx`** - Login UI
- **`src/main.tsx`** - Integration point
- **`vite.config.ts`** - Environment variable loading

### Security Limitations

This is **not** a secure authentication system. Users with technical knowledge can:
- View the password hash in browser developer tools
- Bypass authentication by modifying LocalStorage
- Extract the hash from the deployed JavaScript bundle

Again, this is **intentional** - this feature is designed for convenience in trusted environments, not security.

---

## FAQ

**Q: Can I have different passwords for different users?**
A: No, this is a single shared password for the entire website.

**Q: Can users change their own password?**
A: No, only administrators (those with access to `.env.local`) can change the password.

**Q: What happens if I forget the password?**
A: Regenerate a new hash with a new password, update `.env.local`, and share the new password with users.

**Q: Is the password encrypted?**
A: The password is hashed (SHA-256), not encrypted. Hashing is one-way and cannot be reversed.

**Q: Can I see who is logged in?**
A: No, there is no user tracking or analytics for authentication.

**Q: Does this work offline (PWA)?**
A: Yes, once a user is authenticated, they remain authenticated even when offline.

---

## Support

For technical issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Open an issue on the GitHub repository
4. Contact the development team

---

**Last Updated:** 2025-10-06
**Feature:** Website Password Protection
**Version:** 1.0.0
