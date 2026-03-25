import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vytsmfnzaidhpopbleqr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dHNtZm56YWlkaHBvcGJsZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTIwNTMsImV4cCI6MjA4OTk2ODA1M30.Ff0mTzjIeXLNqkBmW5Sv16C9_YkANhqs6QqIINS_ARA';

export const supabase = createClient(supabaseUrl, supabaseKey);
