import { createClient } from '@supabase/supabase-js';

/**
 * supabaseAdmin.js
 * Server-side Supabase client using the SERVICE ROLE key.
 * A. NEVER expose this client or the service role key to the browser.
 * Only import this file inside /pages/api/* or other server-only code.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase service role environment variables');
}

/**
 * Admin Supabase client — bypasses Row Level Security (RLS).
 * Use for admin API routes that need unrestricted database access.
 */
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;
