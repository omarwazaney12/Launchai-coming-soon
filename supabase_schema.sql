-- LaunchAI Coming Soon Page Schema for Supabase

-- Table for storing early access emails
CREATE TABLE early_access_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    source VARCHAR(100) DEFAULT 'coming-soon-page'
);

-- Table for storing job applications
CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    position VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    current_position VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    experience_details TEXT NOT NULL,
    education VARCHAR(100) NOT NULL,
    portfolio_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    resume_filename VARCHAR(255) NOT NULL,
    resume_file_path VARCHAR(255) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    why_join TEXT NOT NULL,
    skills TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Table for storing application status history
CREATE TABLE application_status_history (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES job_applications(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Supabase RLS (Row Level Security) Policies

-- Allow any authenticated user to read all subscribers
ALTER TABLE early_access_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON early_access_subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow anyone to insert a subscriber
CREATE POLICY "Enable insert for anyone" ON early_access_subscribers
    FOR INSERT WITH CHECK (true);

-- Application security policies
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON job_applications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow anyone to insert an application
CREATE POLICY "Enable insert for anyone" ON job_applications
    FOR INSERT WITH CHECK (true);

-- History security policies
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON application_status_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update history
CREATE POLICY "Enable insert for authenticated users" ON application_status_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_applications_position ON job_applications(position);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_email ON job_applications(email);
CREATE INDEX idx_history_application_id ON application_status_history(application_id);

-- Create storage bucket for resumes
-- Note: Run this in the SQL Editor separately as it's not standard SQL
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Add anonymous access to storage for uploading resumes
-- Note: You'll need to configure this in the Supabase dashboard under Storage 