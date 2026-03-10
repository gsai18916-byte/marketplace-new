import archiver from 'archiver';
import { PassThrough } from 'stream';
import { supabaseAdmin } from './supabaseAdmin';
import { uploadFile } from './storage';

const BUCKET = 'products';

/**
 * Download a file from Supabase Storage as a Buffer.
 */
async function downloadFileAsBuffer(path) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(path);

  if (error) throw error;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate a ZIP of wallpaper files for a given product.
 * Files: desktop.jpg, mobile.jpg, mockup-d.jpg, mockup-m.jpg
 */
export async function generateWallpaperZip(categorySlug, productSlug) {
  const basePath = `wallpapers/${categorySlug}/${productSlug}`;
  const files = ['desktop.jpg', 'mobile.jpg', 'mockup-d.jpg', 'mockup-m.jpg'];

  return generateZip(basePath, files, productSlug);
}

/**
 * Generate a ZIP of prompt files for a given product.
 * Files: before.jpg, after.jpg, prompt.txt
 */
export async function generatePromptZip(categorySlug, productSlug) {
  const basePath = `prompts/${categorySlug}/${productSlug}`;
  const files = ['before.jpg', 'after.jpg', 'prompt.txt'];

  return generateZip(basePath, files, productSlug);
}

/**
 * Core ZIP generation: fetches files from storage and archives them.
 * Returns the path in storage where the ZIP was saved.
 */
async function generateZip(basePath, fileNames, productSlug) {
  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('error', reject);
    archive.on('end', async () => {
      const zipBuffer = Buffer.concat(chunks);
      const zipPath = `${basePath}/${productSlug}.zip`;

      try {
        await uploadFile(zipPath, zipBuffer, 'application/zip');
        resolve(zipPath);
      } catch (err) {
        reject(err);
      }
    });

    for (const fileName of fileNames) {
      const filePath = `${basePath}/${fileName}`;
      try {
        const buffer = await downloadFileAsBuffer(filePath);
        archive.append(buffer, { name: fileName });
      } catch (err) {
        // Skip files that don't exist
        console.warn(`Skipping missing file: ${filePath}`);
      }
    }

    archive.finalize();
  });
}
