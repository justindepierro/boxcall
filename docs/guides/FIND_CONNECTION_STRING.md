# 📍 How to Find Your Supabase Connection String

## Step-by-Step Guide:

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard

### 2. Select Your Project

Click on your "boxcall" project

### 3. Navigate to Database Settings

- Click **"Settings"** in the left sidebar (gear icon at bottom)
- Click **"Database"** in the settings menu

### 4. Find Connection String Section

Scroll down until you see **"Connection string"** or **"Connection info"**

### 5. Look for These Tabs:

You should see several tabs:

- **URI** ← This is what we need!
- Postgres
- JDBC
- .NET
- Etc.

### 6. Copy the URI

Click the **URI** tab and you'll see something like:

```
postgresql://postgres.lvmuiqwihlpnwppdqqfl:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres
```

### 7. Get Your Password

If you don't know your password:

- On the same page, look for **"Database password"**
- Click **"Reset database password"**
- Copy the new password (you'll need this!)

---

## Alternative: Run SQL Directly in Terminal

If you can't find the connection string, try this instead:

### Using Supabase CLI:

```bash
# Link to your project (if not already linked)
supabase link --project-ref lvmuiqwihlpnwppdqqfl

# Then run the migration
supabase db push --file database/migrations/step2_activities_minimal.sql
```

---

## Still Can't Find It?

Try these alternatives:

1. **Use the Supabase SQL Editor** (in browser)
   - Just copy/paste the SQL from `step2_activities_minimal.sql`
   - Close tab immediately after success to avoid the bug

2. **Use the Table Editor**
   - We can manually create the policies through the UI

Let me know which approach you want to try! 🚀
