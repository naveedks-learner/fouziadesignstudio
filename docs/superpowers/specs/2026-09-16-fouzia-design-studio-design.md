# Fouzia Design Studio — E-commerce Site (v1)

## Purpose
A bespoke women's clothing brand (Indian + some western wear) needs a catalog
site: browse/search/filter products, add to cart/wishlist, checkout by
sending the order to a WhatsApp number, simple login with saved default
address, and an admin panel to manage products and order status.

## Stack
- Next.js (App Router), deployed to Cloudflare Pages via `@cloudflare/next-on-pages`
- Supabase: Postgres (DB), Auth (email magic-link now; swappable to phone OTP
  later via provider config only), Storage (product images)
- Tailwind CSS for styling

## Data model (Supabase/Postgres)
- `categories`: id, name, slug
- `products`: id, name, description, category_id, price, sizes (text[]),
  images (text[] of storage URLs), stock, active, created_at
- `profiles`: id (= auth.users.id), full_name, phone, default_address, is_admin
- `orders`: id, user_id, items (jsonb: [{product_id, name, size, qty, price}]),
  total, status (pending/confirmed/shipped/delivered/cancelled), created_at
- `wishlists`: id, user_id, product_id, created_at
- Row Level Security: users can only read/write their own profile, orders,
  wishlist; products/categories are public-read; admin (`is_admin=true`)
  can write products/categories and update any order status.

## Pages
- `/` — hero + featured products
- `/shop` — catalog grid, search box, category + size + price filters
- `/product/[id]` — detail, size picker, add to cart/wishlist
- `/cart` — line items, qty/remove, checkout button
- `/wishlist` — saved products
- `/login` — email magic-link
- `/account` — profile, default address, order history
- `/admin` — gated by `is_admin`; product CRUD + image upload; order list
  with status updates

## Cart / Wishlist
- Guest: kept in localStorage via React context.
- Logged-in: same context, persisted to `wishlists` table (products) and
  cart stays client-side (localStorage) until checkout, when it's written to
  `orders`.

## Checkout flow
1. User reviews cart, clicks "Checkout on WhatsApp".
2. Client builds an `orders` row (status `pending`) with the cart contents
   and total, tied to the logged-in user (login required to checkout, so the
   default address is available).
3. Opens `https://wa.me/<configured number>?text=<url-encoded order summary>`
   in a new tab.
4. Admin sees the order in `/admin` and updates status as it progresses.

## Auth
- Supabase email magic-link. `profiles` row auto-created on first login
  (DB trigger) with `is_admin = false`. Admin flag set manually in Supabase
  for the owner's account.

## Out of scope for v1
- Real payment gateway (Razorpay etc.) — noted as a future integration point,
  not built now.
- Phone/OTP login — deferred, but auth code is provider-agnostic.
- Inventory reservation / stock locking, multi-currency, shipping cost calc.

## Initial content
- ~10-15 placeholder products across 2-3 categories (Kurtas, Western Wear,
  maybe Accessories), placeholder pricing/sizes. Real Instagram photos to be
  swapped in by the user after initial build.
