"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const [{ data: prods, error: prodErr }, { data: cats }] =
          await Promise.all([
            supabase
              .from("products")
              .select("*")
              .eq("active", true)
              .order("created_at", { ascending: false }),
            supabase.from("categories").select("*").order("name"),
          ]);
        if (prodErr) throw prodErr;
        setProducts(prods ?? []);
        setCategories(cats ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (
        search &&
        !`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (category !== "all" && p.category_id !== category) return false;
      if (size !== "all" && !p.sizes?.includes(size)) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [products, search, category, size, minPrice, maxPrice]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl text-accent">Shop</h1>

      <div className="mb-8 grid gap-4 rounded-lg bg-accent-soft p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none lg:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="all">All sizes</option>
          {allSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {loading && <p className="text-stone-500">Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-stone-500">No products match your filters.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
