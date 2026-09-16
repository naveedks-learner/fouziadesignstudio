# Fouzia Design Studio

An e-commerce catalog site for Fouzia Design Studio, a bespoke women's
clothing brand (Indian + western wear). Customers can browse/search/filter
products, add items to a cart or wishlist, and check out by sending their
order straight to a WhatsApp number. Logged-in customers get an order
history and a saved delivery address; the site owner gets an admin panel to
manage products and update order status.

## Tech stack

- **Next.js (App Router, TypeScript)** — pages and UI
- **Tailwind CSS v4** — styling
- **Supabase** — Postgres database, Auth (email magic-link), and (for real
  product photos) Storage
- **Cloudflare Pages** (`@cloudflare/next-on-pages`) — hosting/deployment
- Cart is kept in the browser (localStorage); wishlist and orders are stored
  in Supabase for logged-in users.

## Project structure

- `src/app` — pages (`/`, `/shop`, `/product/[id]`, `/cart`, `/wishlist`,
  `/login`, `/account`, `/admin`) and the magic-link auth callback route.
- `src/components` — `Navbar`, `Footer`, `ProductCard`.
- `src/context` — `CartContext` (localStorage cart) and `AuthContext`
  (Supabase session + profile).
- `src/lib/supabase` — browser (`client.ts`) and server (`server.ts`)
  Supabase clients built with `@supabase/ssr`.
- `src/lib/types.ts` — shared TypeScript types for the data model.
- `supabase/migrations/0001_init.sql` — full schema (under a
  `fouzia_design_studio` Postgres schema), RLS policies, and the
  auto-create-profile trigger.
- `supabase/seed.sql` — sample categories and ~12 placeholder products.

## Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor** and run the contents of
   `supabase/migrations/0001_init.sql`, then run `supabase/seed.sql` to add
   sample categories and products. This creates all tables under a
   `fouzia_design_studio` schema (not the default `public` schema).
3. Go to **Project Settings → Data API** and add `fouzia_design_studio` to
   **Exposed schemas** (Supabase only exposes `public`/`graphql_public` to
   the API by default — the app can't query the tables until you add this).
4. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public** key.
4. In this repo, copy the example env file and fill in your values:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
   ```

   `NEXT_PUBLIC_WHATSAPP_NUMBER` is the number that receives orders, in
   E.164 format without the leading `+` (country code + number).

5. In **Authentication → URL Configuration**, add your site URL (and
   `http://localhost:3000` for local dev) to the allowed redirect URLs so
   magic links work, and set the redirect to `<site>/auth/callback`.

### Making the first admin user

1. Sign in once on the site with the email you want to be the admin (via
   `/login` — this creates a `profiles` row automatically).
2. In the Supabase SQL editor, run:

   ```sql
   update fouzia_design_studio.profiles
   set is_admin = true
   where id = (select id from auth.users where email = 'owner@example.com');
   ```

3. Reload the site — an **Admin** link will appear in the navbar.

### Product photos

The seed data uses placeholder images from `placehold.co`. For real photos,
upload them to a Supabase Storage bucket (e.g. `product-images`, set to
public read), then paste the public URLs into the "Image URLs" field when
creating/editing a product in `/admin`.

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Building

```bash
npm run build
```

This runs the standard Next.js production build (type-checking included).

## Deploying to Cloudflare Pages

1. Push this repo to GitHub/GitLab.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages →
   Connect to Git** and select this repo.
3. Configure the build:
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
4. Add the environment variables from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`) in the
   Cloudflare Pages project settings.
5. Deploy. Cloudflare will rebuild on every push to the connected branch.

You can also build for Cloudflare locally with `npm run pages:build`
(requires a Cloudflare/Wrangler login for `wrangler pages dev`/deploy, so it
isn't run automatically here).

**Note:** `@cloudflare/next-on-pages` currently supports Next.js up to
`15.5.2`, while this project was scaffolded with Next.js `16.3.5`. The
package installs and `npm run build` (plain Next.js build) succeeds, but if
`npm run pages:build` fails on Cloudflare's Next version check, pin `next`
to `15.5.2` in `package.json` (or track next-on-pages' Next 16 support once
released) before deploying.

## Scope notes (v1)

- No payment gateway — checkout hands the order details to WhatsApp for the
  studio to confirm manually.
- No phone/OTP login yet (email magic-link only); the auth code is
  provider-agnostic so this can be added later.
- No stock reservation/locking, multi-currency, or shipping cost calculation.
