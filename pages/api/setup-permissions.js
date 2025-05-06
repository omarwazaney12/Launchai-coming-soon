import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with admin privileges
// This should be done using service_role key, not anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // This endpoint should be protected in production
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run SQL queries to set up permissions
    const { error: jobAppSeqError } = await supabase.rpc('grant_anon_sequence', {
      sequence_name: 'job_applications_id_seq'
    });

    if (jobAppSeqError) {
      throw jobAppSeqError;
    }

    // Grant storage permissions
    const { error: storageError } = await supabase.rpc('setup_storage_permissions');

    if (storageError) {
      throw storageError;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Permissions set up successfully' 
    });
  } catch (error) {
    console.error('Error setting up permissions:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
} 