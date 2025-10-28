import { createClient } from '@supabase/supabase-js';

// Public client (anon key) - for client-side or limited server usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// Admin client (service role key) - server only, privileged operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string,
  {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'tajweedo-admin' } },
  }
);
