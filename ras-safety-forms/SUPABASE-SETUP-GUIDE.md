# Supabase Setup Guide for RAS Safety Forms

This guide walks you through setting up the Supabase backend for the RAS Safety Forms application.

## Prerequisites

- A Supabase account (free tier works fine)
- Your Next.js project cloned and dependencies installed

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: `ras-safety-forms`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `West US (Oregon)`)
   - **Pricing Plan**: Free
4. Click "Create new project" and wait for provisioning (~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-setup.sql` from this repository
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. You should see "Success. No rows returned" - this is correct!

This creates all tables, relationships, RLS policies, and seed data.

## Step 3: Create Storage Bucket

1. Go to **Storage** in the sidebar
2. Click **New bucket**
3. Name it: `safety-photos`
4. Make it **Public** (check the public checkbox)
5. Click **Create bucket**

### Configure Storage Policies

1. Click on the `safety-photos` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Use this policy for uploads:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'safety-photos');

-- Allow public to view
CREATE POLICY "Allow public to view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'safety-photos');
```

## Step 4: Create Test Users

### Create Admin User

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in:
   - **Email**: `admin@rasltd.ca`
   - **Password**: Create a secure password (e.g., `RasAdmin2026!`)
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**
5. **Copy the UUID** that was generated (you'll need it next)

### Create Framer User

1. Click **Add user** > **Create new user** again
2. Fill in:
   - **Email**: `framer@rasltd.ca`
   - **Password**: Create a secure password (e.g., `RasFramer2026!`)
   - **Auto Confirm User**: ✅ Check this box
3. Click **Create user**
4. **Copy the UUID** that was generated

### Link Auth Users to Database

1. Go back to **SQL Editor**
2. Create a new query with the UUIDs you copied:

```sql
-- Replace 'ADMIN-UUID-HERE' and 'FRAMER-UUID-HERE' with actual UUIDs from Auth

INSERT INTO users (id, email, full_name, role) VALUES
  ('ADMIN-UUID-HERE', 'admin@rasltd.ca', 'Sarah Anderson', 'admin'),
  ('FRAMER-UUID-HERE', 'framer@rasltd.ca', 'Mike Thompson', 'framer');

-- Example with real UUIDs:
-- INSERT INTO users (id, email, full_name, role) VALUES
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@rasltd.ca', 'Sarah Anderson', 'admin'),
--   ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'framer@rasltd.ca', 'Mike Thompson', 'framer');
```

3. Run the query

## Step 5: Get API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (long string)

## Step 6: Configure Environment Variables

1. In your project root, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace with your actual values from Step 5

## Step 7: Verify Setup

### Check Database Tables

1. Go to **Table Editor**
2. You should see 4 tables:
   - `users`
   - `job_sites`
   - `safety_submissions`
   - `submission_photos`

### Check Job Sites

1. Click on `job_sites` table
2. You should see 6 sites including **Kestrel Ridge**

### Check Users

1. Click on `users` table
2. You should see your 2 test users (admin and framer)

## Step 8: Test the Application

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Login with:
   - **Admin**: `admin@rasltd.ca` / your admin password
   - **Framer**: `framer@rasltd.ca` / your framer password

## Troubleshooting

### "Invalid API Key" Error

- Double-check your `.env.local` file has correct URL and key
- Restart your dev server after creating `.env.local`
- Make sure there are no extra spaces in the values

### Users Can't Login

- Verify users were created in Authentication > Users
- Make sure "Auto Confirm User" was checked
- Check that user records exist in the `users` table
- Verify the UUIDs match between Auth and the `users` table

### RLS Policy Errors

- Go to SQL Editor and run:
  ```sql
  SELECT * FROM auth.users();
  ```
  This should return your test users
- If RLS policies block access, temporarily disable RLS:
  ```sql
  ALTER TABLE safety_submissions DISABLE ROW LEVEL SECURITY;
  ```
  Then re-enable after testing:
  ```sql
  ALTER TABLE safety_submissions ENABLE ROW LEVEL SECURITY;
  ```

### Photo Upload Fails

- Verify the `safety-photos` bucket exists and is public
- Check storage policies are applied
- Verify bucket permissions in Storage > Policies

## Optional: Add More Test Data

To make the app more realistic, add more framers and submissions:

```sql
-- Add more framers (create in Auth first, then link here)
INSERT INTO users (id, email, full_name, role) VALUES
  ('uuid-3', 'john.davis@rasltd.ca', 'John Davis', 'framer'),
  ('uuid-4', 'sarah.wilson@rasltd.ca', 'Sarah Wilson', 'framer');

-- Add sample submissions
INSERT INTO safety_submissions (
  user_id, job_site_id, submission_date,
  ppe_worn, hard_hat, safety_vest, steel_toe_boots, eye_protection,
  fall_protection_in_place, ladders_inspected,
  tools_in_good_condition, hazards_identified,
  notes, status
) VALUES (
  'FRAMER-UUID',
  (SELECT id FROM job_sites WHERE site_name = 'Kestrel Ridge'),
  CURRENT_DATE,
  true, true, true, true, true,
  true, true, true, true,
  'All safety checks passed. Site conditions good.',
  'submitted'
);
```

## Next Steps

- Deploy your application to Vercel
- Add production environment variables in Vercel dashboard
- Test with real mobile devices
- Monitor usage in Supabase dashboard

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Check browser console for errors
3. Verify RLS policies are correctly applied
4. Check that Auth users and database users are synced

---

**Setup complete! 🎉 Your RAS Safety Forms app is now connected to Supabase.**
