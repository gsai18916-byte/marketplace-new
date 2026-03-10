import { withAdmin } from '../../../lib/adminAuth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFile, deleteFolder } from '../../../lib/storage';
import { generateWallpaperZip, generatePromptZip } from '../../../lib/zipGenerator';

export const config = { api: { bodyParser: false } };

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, maxFileSize: 20 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function flatField(val) {
  return Array.isArray(val) ? val[0] : val;
}

async function handler(req, res) {
  // GET — list products
  if (req.method === 'GET') {
    const { type, category_id } = req.query;
    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (category_id) query = query.eq('category_id', category_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ products: data });
  }

  // POST — create product
  if (req.method === 'POST') {
    const { fields, files } = await parseForm(req);

    const title = flatField(fields.title);
    const description = flatField(fields.description);
    const categoryId = flatField(fields.category_id);
    const type = flatField(fields.type);
    const priceInr = parseInt(flatField(fields.price_inr) || '0');
    const priceUsd = parseInt(flatField(fields.price_usd) || '0');
    const active = flatField(fields.active) === 'true';
    const slug = flatField(fields.slug) || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!title || !categoryId || !type || !priceInr) {
      return res.status(400).json({ error: 'title, category_id, type, and price_inr are required' });
    }

    // Get category slug
    const { data: category, error: catError } = await supabaseAdmin
      .from('categories')
      .select('slug')
      .eq('id', categoryId)
      .single();

    if (catError || !category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const basePath = `${type === 'wallpaper' ? 'wallpapers' : 'prompts'}/${category.slug}/${slug}`;
    const images = {};

    try {
      if (type === 'wallpaper') {
        const fileMap = { desktop: 'desktop.jpg', mobile: 'mobile.jpg', mockup_d: 'mockup-d.jpg', mockup_m: 'mockup-m.jpg' };
        for (const [field, fileName] of Object.entries(fileMap)) {
          const file = Array.isArray(files[field]) ? files[field][0] : files[field];
          if (file) {
            const buffer = fs.readFileSync(file.filepath);
            await uploadFile(`${basePath}/${fileName}`, buffer, file.mimetype || 'image/jpeg');
            images[field] = `${basePath}/${fileName}`;
          }
        }
      } else {
        const fileMap = { before: 'before.jpg', after: 'after.jpg' };
        for (const [field, fileName] of Object.entries(fileMap)) {
          const file = Array.isArray(files[field]) ? files[field][0] : files[field];
          if (file) {
            const buffer = fs.readFileSync(file.filepath);
            await uploadFile(`${basePath}/${fileName}`, buffer, file.mimetype || 'image/jpeg');
            images[field] = `${basePath}/${fileName}`;
          }
        }
        const promptText = flatField(fields.prompt_text) || '';
        await uploadFile(`${basePath}/prompt.txt`, Buffer.from(promptText), 'text/plain');
        images.prompt_text = promptText;
      }

      // Generate ZIP
      let zipPath;
      if (type === 'wallpaper') {
        zipPath = await generateWallpaperZip(category.slug, slug);
      } else {
        zipPath = await generatePromptZip(category.slug, slug);
      }

      const thumbnailUrl = flatField(fields.thumbnail_url) || null;

      const { data: product, error } = await supabaseAdmin
        .from('products')
        .insert({
          title, description, category_id: categoryId, type,
          price_inr: priceInr, price_usd: priceUsd,
          file_path: zipPath, thumbnail_url: thumbnailUrl,
          images, active,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ product });
    } catch (err) {
      console.error('Product create error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
