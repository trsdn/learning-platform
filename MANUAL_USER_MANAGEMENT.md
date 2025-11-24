# Manual User Management Guide

**Last Updated:** 2025-11-24
**Purpose:** Create and manage users manually via Supabase Dashboard

---

## 🎯 Overview

Public registration is disabled. Users must be created manually by admins through the Supabase Dashboard.

---

## Creating New Users

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `knzjdckrtewoigosaxoh`
3. Navigate to **Authentication** → **Users**

### Step 2: Add New User

1. Click **Add user** button (top right)
2. Choose creation method:

#### Option A: Email + Auto-Generated Password
```
Email: user@example.com
☑ Auto Confirm User (skip email verification)
☑ Auto Generate Password
```
Click **Create user**

#### Option B: Email + Manual Password
```
Email: user@example.com
Password: [enter secure password]
☑ Auto Confirm User (skip email verification)
```
Click **Create user**

### Step 3: Get User Credentials

**Auto-Generated Password:**
- Password shown once after creation
- **Important:** Copy and send to user immediately
- Password cannot be viewed again

**Manual Password:**
- You set the password
- Share securely with the user

### Step 4: Verify User Created

1. User appears in the users list
2. Status: **Confirmed** (green)
3. Email confirmation not required

---

## User Login

Users can now log in at:
```
https://learning-platform-lac-tau.vercel.app
```

**Login Process:**
1. Click **🔑 Anmelden** button
2. Enter email and password
3. Click **🔑 Anmelden**
4. Success! User is logged in

---

## Managing Existing Users

### Reset User Password

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click **⋯** (three dots) → **Reset password**
4. Choose method:
   - **Send email** (user resets via email link)
   - **Generate new password** (you set it manually)

### Delete User

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click **⋯** (three dots) → **Delete user**
4. Confirm deletion

**Warning:** This permanently deletes:
- User account
- All user progress
- All user data

### Disable User Temporarily

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click **⋯** (three dots) → **Ban user**
4. User cannot log in (but data preserved)

To re-enable:
- Click **⋯** → **Unban user**

---

## Bulk User Creation

### Option 1: Supabase Dashboard (Small batches)
- Create users one by one (up to 10-20 users)
- Good for initial setup

### Option 2: SQL Script (Large batches)

For creating many users at once, use SQL:

1. Go to Supabase Dashboard → **SQL Editor**
2. Create new query
3. Use this template:

```sql
-- Insert users into auth.users table
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
  (
    'user1@example.com',
    crypt('password123', gen_salt('bf')),  -- Password: password123
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "User One"}',
    false,
    'authenticated'
  ),
  (
    'user2@example.com',
    crypt('password456', gen_salt('bf')),  -- Password: password456
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "User Two"}',
    false,
    'authenticated'
  );
```

4. Click **Run** to create users
5. Users can now log in with their passwords

---

## User Roles & Permissions

### Current Setup: All Users Equal

- All users have same access level
- No admin/moderator distinction yet
- All users can:
  - ✅ Access all learning content
  - ✅ Track their own progress
  - ✅ Use all features

### Future: Role-Based Access (Optional)

If you want to add roles later:
- Admin: Can manage users, content
- Teacher: Can view student progress
- Student: Can only access learning content

(Not implemented yet, but possible)

---

## Security Best Practices

### Password Requirements

Supabase enforces:
- ✅ Minimum 6 characters
- ⚠️ No complexity requirements (consider enabling)

**Recommendation:** Use strong passwords:
- 12+ characters
- Mix of letters, numbers, symbols
- Example: `MyS3cure!Pass2025`

### Password Distribution

**Secure Methods:**
- ✅ In-person handoff
- ✅ Encrypted messaging (Signal, WhatsApp)
- ✅ Password manager sharing (1Password, Bitwarden)

**Avoid:**
- ❌ Plain text email
- ❌ SMS (unless necessary)
- ❌ Slack/Teams direct messages

### Force Password Change

To require users change their password on first login:

1. Create user with temporary password
2. Tell user to:
   - Log in with temporary password
   - Click profile/settings (when implemented)
   - Change password

(Password change UI needs to be implemented)

---

## Monitoring Users

### View Active Users

1. Go to Supabase Dashboard → Authentication → Users
2. Check **Last sign in** column
3. See who's actively using the platform

### View User Progress

1. Go to Supabase Dashboard → **Table Editor**
2. Select **user_progress** table
3. Filter by `user_id` to see specific user's progress

### Check User Activity

1. Go to Supabase Dashboard → **Logs**
2. Filter by:
   - **Auth logs**: Login attempts, successes, failures
   - **API logs**: User actions, data access

---

## Common Issues

### Issue: User Can't Log In

**Possible Causes:**
1. Wrong email or password
2. Account not confirmed
3. Account banned
4. Account deleted

**Solutions:**
1. Verify email spelling
2. Check user status in dashboard (should be "Confirmed")
3. Check if user is banned (Unban if needed)
4. Reset password for user

### Issue: User Forgot Password

**Solution:**
1. Go to Dashboard → Users
2. Find user → Reset password
3. Choose:
   - Send email (user resets themselves)
   - Generate new (you give them new password)

### Issue: Need to Delete User Data

**Important:** User deletion also deletes all their data due to foreign key constraints.

**To delete user:**
1. Dashboard → Users → Find user
2. **⋯** → Delete user
3. Confirm

All user's progress, sessions, and history automatically deleted.

---

## User Communication

### Welcome Email Template

When you create a new user, send them this:

```
Subject: Willkommen bei MindForge Academy! 🧠

Hallo [Name],

Dein Account wurde erstellt! Hier sind deine Zugangsdaten:

Website: https://learning-platform-lac-tau.vercel.app
E-Mail: [email]
Passwort: [password]

So geht's los:
1. Öffne die Website
2. Klicke auf "🔑 Anmelden"
3. Gib deine Zugangsdaten ein
4. Wähle ein Thema und starte das Lernen!

Viel Erfolg!
Das MindForge Academy Team
```

### Password Reset Email Template

```
Subject: Passwort zurücksetzen - MindForge Academy

Hallo [Name],

Dein neues Passwort:

Passwort: [new_password]

Bitte ändere dein Passwort nach dem Login.

Beste Grüße,
Das MindForge Academy Team
```

---

## Statistics

### View Total Users

1. Dashboard → Authentication → Users
2. Total count shown at top
3. Or run SQL:

```sql
SELECT COUNT(*) as total_users
FROM auth.users
WHERE deleted_at IS NULL;
```

### View Active Users (Last 7 Days)

```sql
SELECT COUNT(*) as active_users
FROM auth.users
WHERE last_sign_in_at > NOW() - INTERVAL '7 days'
  AND deleted_at IS NULL;
```

### View New Signups (Last 30 Days)

```sql
SELECT COUNT(*) as new_users
FROM auth.users
WHERE created_at > NOW() - INTERVAL '30 days'
  AND deleted_at IS NULL;
```

---

## Backup Users

### Export User List

1. Go to Dashboard → Authentication → Users
2. Click **⋯** → **Export**
3. Download CSV with:
   - Email
   - Created date
   - Last sign in
   - User ID

**Note:** Passwords are NOT exported (they're encrypted)

### Backup User Data

To backup all user progress:

1. Go to Dashboard → SQL Editor
2. Run:

```sql
COPY (
  SELECT * FROM user_progress
) TO '/tmp/user_progress_backup.csv' WITH CSV HEADER;
```

(Download via Supabase storage or API)

---

## FAQ

### Q: Can users register themselves?

**A:** No, registration is disabled. Admins must create all user accounts manually.

### Q: How many users can I create?

**A:** Supabase free tier: Up to 50,000 monthly active users

### Q: Can users change their email?

**A:** Not yet implemented in the app. You can change it manually in the dashboard.

### Q: Can users delete their own account?

**A:** Not yet implemented. You must delete accounts manually.

### Q: What happens to user data when deleted?

**A:** All data is permanently deleted:
- User account
- Progress tracking
- Practice sessions
- Answer history
- Cannot be recovered

---

## Support

For issues with user management:
1. Check Supabase logs: Dashboard → Logs
2. Check auth status: Dashboard → Authentication → Users
3. Create GitHub issue: https://github.com/torstenmahr/learning-platform/issues

---

## Next Steps

After creating users:
1. ✅ Create first user account
2. ✅ Test login with that user
3. ✅ Verify user can access learning content
4. ✅ Create additional user accounts as needed
5. ✅ Send welcome emails with credentials

**Your users are ready to start learning!** 🚀
