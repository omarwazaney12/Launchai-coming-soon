-- 1. Grant usage on the sequence to the anon role
GRANT USAGE ON SEQUENCE job_applications_id_seq TO anon;

-- 2. Grant insert permissions on the job_applications table
GRANT INSERT ON job_applications TO anon;

-- 3. Create storage bucket for resumes if it doesn't exist already
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Create a policy to allow anonymous users to upload resumes
BEGIN;
  DROP POLICY IF EXISTS "Allow anon resume uploads" ON storage.objects;
  
  CREATE POLICY "Allow anon resume uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (
      bucket_id = 'resumes'
    );
COMMIT; 