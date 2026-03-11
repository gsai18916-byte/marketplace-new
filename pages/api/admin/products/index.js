import { withAdmin } from '../../../../lib/adminAuth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFile, deleteFolder } from '../../../../lib/storage';
import { generateWallpaperZip, generatePromptZip } from '../../../../lib/zipGenerator';

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
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const categorySlug = category.slug;

    // Upload thumbnail
    let thumbnailPath = null;
    if (files.thumbnail) {
      const thumbFile = Array.isArray(files.thumbnail) ? files.thumbnail[0] : files.thumbnail;
      thumbnailPath = await uploadFile(thumbFile, `products/${categorySlug}/${slug}`);
    }

    // Upload files/zip
    let filePath = null;
    if (files.file) {
      const fileToUpload = Array.isArray(files.file) ? files.file[0] : files.file;
      filePath = await uploadFile(fileToUpload, `products/${categorySlug}/${slug}`);
    }

    // Insert product
    const { data: newProduct, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description,
        category_id: categoryId,
        type,
        price_inr: priceInr,
        price_usd: priceUsd,
        thumbnail: thumbnailPath,
        file_path: filePath,
        active,
        slug
      })
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });
    return res.status(201).json({ product: newProduct });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
