-- Grant sequence permissions for job_applications
CREATE OR REPLACE FUNCTION grant_anon_sequence(sequence_name text)
RETURNS void AS $$
BEGIN
  EXECUTE 'GRANT USAGE ON SEQUENCE ' || sequence_name || ' TO anon';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set up storage permissions
CREATE OR REPLACE FUNCTION setup_storage_permissions()
RETURNS void AS $$
BEGIN
  -- Create resumes bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('resumes', 'resumes', false)
  ON CONFLICT (id) DO NOTHING;
  
  -- Set up storage policy for anonymous uploads
  DROP POLICY IF EXISTS "Allow anon resume uploads" ON storage.objects;
  
  CREATE POLICY "Allow anon resume uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (
      bucket_id = 'resumes' AND
      (storage.foldername(name))[1] = 'resumes'
    );

  -- Grant permissions on job_applications table
  GRANT INSERT ON job_applications TO anon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 