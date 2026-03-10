import supabaseAdmin from './supabaseAdmin';

/**
 * storage.js
 * Helper utilities for Supabase Storage (file uploads, downloads, signed URLs).
 * Uses the admin client so it can manage any bucket regardless of RLS policies.
 */

// ─── Bucket names ────────────────────────────────────────────────────────────
export const BUCKETS = {
  PRODUCTS: process.env.STORAGE_BUCKET_PRODUCTS || 'products',
  CATEGORIES: process.env.STORAGE_BUCKET_CATEGORIES || 'categories',
  AVATARS: process.env.STORAGE_BUCKET_AVATARS || 'avatars',
};

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer/blob to a Supabase Storage bucket.
 *
 * @param {string} bucket - Bucket name (use BUCKETS constants above).
 * @param {string} path - Destination path inside the bucket, e.g. "images/product-1.png".
 * @param {Buffer} fileBuffer - File data as a buffer.
 * @param {string} contentType - MIME type, e.g. "image/png".
 * @returns {Promise<{publicUrl: string}>}
 */
export async function uploadFile(bucket, path, fileBuffer, contentType = 'application/octet-stream') {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  return data;
}

// ─── Signed URLs ──────────────────────────────────────────────────────────────

/**
 * Create a signed URL for a file in Supabase Storage.
 * Signed URLs expire after a certain time (default 1 hour).
 *
 * @param {string} bucket - Bucket name.
 * @param {string} path - File path inside the bucket.
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour).
 * @returns {Promise<string>} Signed URL.
 */
export async function getSignedUrl(bucket, path) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw new Error(`Failed to create signed URL: ${error.message}`);

  return data.signedUrl;
}

/**
 * Get the public URL of a file in a public bucket.
 *
 * @param {string} bucket - Bucket name.
 * @param {string} path - File path inside the bucket.
 * @returns {string} Public URL.
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

// ─── List files ───────────────────────────────────────────────────────────────

/**
 * List files in a bucket folder.
 *
 * @param {string} bucket - Bucket name.
 * @param {string} [folder=''] - Folder path prefix.
 * @returns {Promise<Object[]>} Array of file metadata objects.
 */
export async function listFiles(bucket, folder = '') {
  const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder);

  if (error) {
    throw new Error(`Storage list failed: ${error.message}`);
  }

  return data;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a file from a bucket.
 *
 * @param {string} bucket - Bucket name.
 * @param {string} path - File path inside the bucket.
 * @returns {Promise<void>}
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) throw error;
}

/**
 * Delete a folder and all its contents.
 *
 * @param {string} bucket - Bucket name.
 * @param {string} prefix - Folder path prefix.
 * @returns {Promise<void>}
 */
export async function deleteFolder(bucket, prefix) {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(bucket)
    .list(prefix, { limit: 100 });

  if (listError) throw listError;

  if (files.length > 0) {
    const paths = files.map((file) => `${prefix}/${file.name}`);
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths);

    if (deleteError) throw deleteError;
  }
}
