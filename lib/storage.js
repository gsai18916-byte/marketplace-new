import { supabaseAdmin } from './supabaseAdmin';

const BUCKET = 'products';

/**
 * Upload a file buffer to Supabase Storage.
 */
export async function uploadFile(path, buffer, contentType = 'application/octet-stream') {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(path) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/**
 * Delete a folder and all its contents.
 */
export async function deleteFolder(prefix) {
  const { data: files, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(prefix, { limit: 100 });

  if (error) throw error;
  if (!files || files.length === 0) return;

  const paths = files.map((f) => `${prefix}/${f.name}`);
  const { error: deleteError } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove(paths);

  if (deleteError) throw deleteError;
}

/**
 * Generate a signed URL for private access.
 */
export async function getSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Create a "folder" in Supabase Storage by uploading a .gitkeep placeholder.
 */
export async function createFolder(folderPath) {
  await uploadFile(`${folderPath}/.gitkeep`, Buffer.from(''), 'text/plain');
}
