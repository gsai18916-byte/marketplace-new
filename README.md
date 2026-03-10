# Luminance — Digital Wallpaper & Prompt Marketplace

A production-ready marketplace for selling premium digital wallpapers and AI prompts, built with Next.js, Supabase, Razorpay, and Stripe.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend/Backend | Next.js 14 (Pages Router) + React |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments (India) | Razorpay |
| Payments (International) | Stripe |
| Charts | Recharts |
| ZIP Generation | Archiver |
| Deployment | Vercel |

---

## Project Structure

```
├── pages/
│   ├── index.js                      # Homepage
│   ├── wallpapers/
│   │   ├── index.js                  # All wallpaper categories
│   │   └── [category].js             # Products in a category
│   ├── prompts/
│   │   ├── index.js                  # All prompt categories
│   │   └── [category].js             # Products in a category
│   ├── product/[id].js               # Product detail + buy flow
│   ├── download/[token].js           # Post-purchase download page
│   ├── admin/
│   │   ├── login.js                  # Admin auth
│   │   ├── dashboard.js              # Sales charts & metrics
│   │   ├── categories.js             # Category CRUD
│   │   ├── products.js               # Product CRUD + file upload
│   │   └── orders.js                 # Order list + filters
│   └── api/
│       ├── categories.js
│       ├── categories/[slug]/products.js
│       ├── products/[id].js
│       ├── create-order.js           # Razorpay order
│       ├── verify-payment.js         # Razorpay verification
│       ├── create-stripe-session.js  # Stripe checkout
│       ├── stripe-success.js         # Stripe redirect handler
│       ├── download-page.js          # Token info
│       ├── get-download-url.js       # Signed URL + decrement
│       └── admin/
│           ├── dashboard/{stats,sales-over-time,top-products,recent-orders}.js
│           ├── categories/{index,\[id\]}.js
│           ├── products/{index,\[id\]}.js
│           └── orders/index.js
├── components/
│   ├── Layout.js
│   ├── AdminLayout.js
│   ├── Navbar.js
│   ├── Footer.js
│   ├── CategoryCard.js
│   ├── ProductCard.js
│   └── admin/
│       ├── StatsCard.js
│       ├── SalesChart.js
│       └── TopProductsChart.js
├── lib/
│   ├── supabase.js           # Client-side Supabase
│   ├── supabaseAdmin.js      # Server-side (service role)
│   ├── adminAuth.js          # withAdmin() middleware
│   ├── razorpay.js           # Razorpay client
│   ├── stripe.js             # Stripe client
│   ├── storage.js            # Storage helpers
│   ├── zipGenerator.js       # ZIP creation
│   └── downloadToken.js      # Token creation & validation
├── styles/globals.css
├── middleware.js             # Next.js edge middleware
├── supabase-schema.sql       # Full DB schema + RLS
└── .env.example
```

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd marketplace
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the full contents of `supabase-schema.sql`
3. Go to **Storage** → Create a new bucket named `products` with **private** visibility
4. Copy your Project URL, anon key, and service role key

### 3. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values
```

### 4. Create Admin User

1. Run the app: `npm run dev`
2. Navigate to `/admin/login`
3. Register a new user via Supabase Auth (Dashboard → Authentication → Users → Invite User)
4. Run in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
   ```

### 5. Razorpay Setup

1. Create an account at [razorpay.com](https://razorpay.com)
2. Get your Key ID and Key Secret from the dashboard
3. Add to `.env.local`

### 6. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your Secret Key and Publishable Key
3. Add to `.env.local`

---

## Payment Flow

### INR (Razorpay)
1. Customer clicks Buy → enters email/name
2. `POST /api/create-order` → creates Razorpay order + pending DB order
3. Razorpay checkout opens in modal
4. On success → `POST /api/verify-payment` → verifies HMAC signature → marks order completed → creates download token
5. Redirect to `/download/[token]`

### USD (Stripe)
1. Customer clicks Buy → selects USD → enters email
2. `POST /api/create-stripe-session` → creates Stripe Checkout session + pending DB order
3. Redirect to Stripe hosted checkout
4. On success → `GET /api/stripe-success?session_id=...` → verifies payment → marks completed → creates token
5. Redirect to `/download/[token]`

---

## Download Token System

- Token: 64-char hex (cryptographically random)
- Validity: 48 hours from purchase
- Max downloads: 5
- On each download: token is decremented, IP is logged
- Download link: Supabase signed URL (10-min expiry)

---

## Storage Structure

```
products/ (private bucket)
├── wallpapers/
│   └── [category-slug]/
│       └── [product-slug]/
│           ├── desktop.jpg
│           ├── mobile.jpg
│           ├── mockup-d.jpg
│           ├── mockup-m.jpg
│           └── [product-slug].zip   ← auto-generated
└── prompts/
    └── [category-slug]/
        └── [product-slug]/
            ├── before.jpg
            ├── after.jpg
            ├── prompt.txt
            └── [product-slug].zip   ← auto-generated
```

---

## Deployment to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example`
4. Deploy

Vercel automatically handles:
- ISR (Incremental Static Regeneration) for product/category pages
- Edge middleware for admin route protection
- Serverless API routes

---

## Price Format

Prices are stored in **smallest currency units**:
- INR: paise (₹19 = 1900)
- USD: cents ($2.49 = 249)

The USD price can be set manually or will fall back to `price_inr / 83` as an approximation.

---

## Security

- Admin routes protected by `middleware.js` (session check) + `withAdmin()` (is_admin check)
- All storage files are private — customers only get time-limited signed URLs
- Payment signatures verified via HMAC before order completion
- Service role key never exposed to the browser
- Download tokens expire and are rate-limited
