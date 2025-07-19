import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better error handling for production
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables in production!');
  console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.');
  
  // Provide fallback for development
  if (import.meta.env.DEV) {
    console.warn('Using fallback values for development');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://zbmyjdnlkolaujgpemwt.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpibXlqZG5sa29sYXVqZ3BlbXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDQxMjksImV4cCI6MjA2NzIyMDEyOX0.v8TIhPkogl1t6zuF_wfDGnl65OGvKzy0uZxxV50x6SE'
);