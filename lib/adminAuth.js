import { supabaseAdmin } from './supabaseAdmin';

/**
 * Validates that the incoming request carries a valid admin session.
 * Returns { user, profile } on success or throws an error.
 */
export async function requireAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    throw new Error('Invalid or expired token');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    throw new Error('Forbidden: admin access required');
  }

  return { user, profile };
}

/**
 * Wraps an API handler, returning 401/403 JSON errors for
 * unauthenticated or non-admin requests.
 */
export function withAdmin(handler) {
  return async function (req, res) {
    try {
      const { user, profile } = await requireAdmin(req);
      req.adminUser = user;
      req.adminProfile = profile;
      return handler(req, res);
    } catch (err) {
      const status = err.message.startsWith('Forbidden') ? 403 : 401;
      return res.status(status).json({ error: err.message });
    }
  };
}
