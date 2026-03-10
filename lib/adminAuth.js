import { createClient } from '@supabase/supabase-js';
import supabaseAdmin from './supabaseAdmin';

const ADMIN_ROLE = process.env.ADMIN_ROLE || 'admin';

/**
 * Validates that the incoming request carries a valid admin session.
 * Returns { user, profile } on success or throws an error.
 */
export async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No authorization token provided' });
    return true;
  }

  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return true;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    res.status(403).json({ error: 'Forbidden: admin access required' });
    return true;
  }

  req.adminUser = user; // Attach for use in handler.
  return null;
}

/**
 * Promote a user to admin by setting app_metadata.role = 'admin'.
 * Call this from a secure setup script or a super-admin endpoint.
 *
 * @param {string} userId - Supabase user UUID.
 * @returns {Promise<void>}
 */
export async function promoteToAdmin(userId) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: ADMIN_ROLE },
  });

  if (error) {
    throw new Error(`Failed to promote user to admin: ${error.message}`);
  }
}

/**
 * Demote an admin user by removing their admin role.
 *
 * @param {string} userId - Supabase user UUID.
 * @returns {Promise<void>}
 */
export async function demoteFromAdmin(userId) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: null },
  });

  if (error) {
    throw new Error(`Failed to demote user: ${error.message}`);
  }
}

/**
 * Check if a user is an admin.
 *
 * @param {string} userId - Supabase user UUID.
 * @returns {Promise<boolean>}
 */
export async function isUserAdmin(userId) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return profile?.is_admin ?? false;
}
