-- RAS Safety Forms Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('framer', 'admin');
CREATE TYPE submission_status AS ENUM ('submitted', 'reviewed');
CREATE TYPE photo_type AS ENUM ('site_condition', 'ppe', 'hazard', 'other');

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'framer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: job_sites
CREATE TABLE job_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: safety_submissions
CREATE TABLE safety_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_site_id UUID NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL,
  ppe_worn BOOLEAN DEFAULT false,
  hard_hat BOOLEAN DEFAULT false,
  safety_vest BOOLEAN DEFAULT false,
  steel_toe_boots BOOLEAN DEFAULT false,
  eye_protection BOOLEAN DEFAULT false,
  fall_protection_in_place BOOLEAN DEFAULT false,
  ladders_inspected BOOLEAN DEFAULT false,
  tools_in_good_condition BOOLEAN DEFAULT false,
  hazards_identified BOOLEAN DEFAULT false,
  notes TEXT,
  status submission_status DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_site_id, submission_date)
);

-- Table: submission_photos
CREATE TABLE submission_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES safety_submissions(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  photo_type photo_type DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_safety_submissions_user_id ON safety_submissions(user_id);
CREATE INDEX idx_safety_submissions_job_site_id ON safety_submissions(job_site_id);
CREATE INDEX idx_safety_submissions_submission_date ON safety_submissions(submission_date);
CREATE INDEX idx_submission_photos_submission_id ON submission_photos(submission_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for job_sites table
CREATE POLICY "Everyone can view active job sites"
  ON job_sites FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage job sites"
  ON job_sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for safety_submissions table
CREATE POLICY "Framers can view their own submissions"
  ON safety_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Framers can create their own submissions"
  ON safety_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Framers can update their own submissions"
  ON safety_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON safety_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all submissions"
  ON safety_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for submission_photos table
CREATE POLICY "Users can view photos of their own submissions"
  ON submission_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM safety_submissions
      WHERE safety_submissions.id = submission_photos.submission_id
      AND safety_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos to their own submissions"
  ON submission_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM safety_submissions
      WHERE safety_submissions.id = submission_photos.submission_id
      AND safety_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all photos"
  ON submission_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert seed data: Job Sites (including required "Kestrel Ridge")
INSERT INTO job_sites (site_name, location, is_active) VALUES
  ('Kestrel Ridge', 'Langford, BC', true),
  ('Royal Commons', 'Royal Bay, BC', true),
  ('Echo Townhouses', 'Royal Bay Colwood, BC', true),
  ('McCallum Lands', 'Langford, BC', true),
  ('Telus Living Nanaimo', 'Nanaimo, BC', true),
  ('Esquimalt Road Residential', 'Esquimalt, BC', true);

-- Insert seed data: Test Users
-- Note: You'll need to create these users in Supabase Auth first, then update with matching UUIDs
-- Or use Supabase Auth API to create users programmatically

-- For manual setup:
-- 1. Go to Authentication > Users in Supabase dashboard
-- 2. Create users with emails: admin@rasltd.ca and framer@rasltd.ca
-- 3. Note their UUIDs
-- 4. Run the following inserts with those UUIDs:

-- Example (replace with actual UUIDs from Auth):
-- INSERT INTO users (id, email, full_name, role) VALUES
--   ('auth-user-uuid-1', 'admin@rasltd.ca', 'Sarah Anderson', 'admin'),
--   ('auth-user-uuid-2', 'framer@rasltd.ca', 'Mike Thompson', 'framer'),
--   ('auth-user-uuid-3', 'john.framer@rasltd.ca', 'John Davis', 'framer');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_sites_updated_at BEFORE UPDATE ON job_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_submissions_updated_at BEFORE UPDATE ON safety_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Setup complete!
-- Next steps:
-- 1. Create a storage bucket named "safety-photos" in Supabase Storage
-- 2. Make the bucket public or configure signed URLs
-- 3. Create test users in Authentication
-- 4. Link auth users to the users table
