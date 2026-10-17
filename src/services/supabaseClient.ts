import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for the frontend.
 *
 * This is kept for any edge-case that needs direct Supabase access
 * (e.g. realtime subscriptions, Supabase Storage).  All CRUD data
 * operations should go through {@link apiClient} → FastAPI instead.
 */
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || 'https://iwmatngjrrlrpwwlljel.supabase.co';

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bWF0bmdqcnJscnB3d2xsamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzQxNTYsImV4cCI6MjEwNTU1MDE1Nn0.FVfT0dg51-OVSwHT32BdKJL35USYKeptrHbWY8y7A08';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
