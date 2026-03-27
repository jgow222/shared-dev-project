import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qpmjghocajyvugjxnkdn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbWpnaG9jYWp5dnVnanhua2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODM4MDQsImV4cCI6MjA5MDE1OTgwNH0.fzHBvHic5W6BZVUfD-dXEj0x6MaBeM6GyGEUsu8vQt0';

export const supabase = createClient(supabaseUrl, supabaseKey);
