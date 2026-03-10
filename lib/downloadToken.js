import { randomBytes } from 'crypto';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Generate a secure 64-char hex token.
 */
export function generateToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Create a download token record linked to an order.
 */
export async function createDownloadToken(orderId) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('download_tokens')
    .insert({
      order_id: orderId,
      token,
      remaining_downloads: 5,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Validate a token and decrement its download count.
 * Returns the token record if valid.
 */
export async function consumeDownloadToken(token, ipAddress = null) {
  const { data, error } = await supabaseAdmin
    .from('download_tokens')
    .select('*, orders(*, products(*))')
    .eq('token', token)
    .single();

  if (error || !data) throw new Error('Invalid token');
  if (new Date(data.expires_at) < new Date()) throw new Error('Token has expired');
  if (data.remaining_downloads <= 0) throw new Error('No downloads remaining');

  // Decrement downloads
  const { error: updateError } = await supabaseAdmin
    .from('download_tokens')
    .update({
      remaining_downloads: data.remaining_downloads - 1,
      last_downloaded: new Date().toISOString(),
    })
    .eq('id', data.id);

  if (updateError) throw updateError;

  // Log the download
  await supabaseAdmin.from('download_logs').insert({
    token_id: data.id,
    downloaded_at: new Date().toISOString(),
    ip_address: ipAddress,
  });

  return data;
}

/**
 * Get download page info (without consuming the token).
 */
export async function getTokenInfo(token) {
  const { data, error } = await supabaseAdmin
    .from('download_tokens')
    .select('*, orders(*, products(title, thumbnail_url, type, description))')
    .eq('token', token)
    .single();

  if (error || !data) throw new Error('Invalid token');
  return data;
}
