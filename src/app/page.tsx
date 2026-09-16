import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  let featured: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    featured = data ?? [];
  } catch {
    featured = [];
  }

  return (
    <div>
      <section className="border-b border-accent/20 bg-accent-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            Bespoke women&apos;s fashion
          </p>
          <h1 className="max-w-2xl font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
            Timeless Indian &amp; western wear, tailored for you
          </h1>
          <p className="max-w-xl text-stone-600">
            Hand-picked kurtas, dresses, and accessories designed to make
            everyday moments feel special.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-serif text-2xl text-stone-900">
          Featured Pieces
        </h2>
        {featured.length === 0 ? (
          <p className="text-stone-500">
            No products yet — add some from the admin panel once Supabase is
            connected.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
