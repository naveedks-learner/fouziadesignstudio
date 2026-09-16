"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data: wishes } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user.id);

      const ids = (wishes ?? []).map((w) => w.product_id);
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);
      setProducts(prods ?? []);
      setLoading(false);
    })();
  }, [user, authLoading]);

  const remove = async (productId: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-2xl text-stone-900">Wishlist</h1>
        <p className="mt-3 text-stone-600">
          Please log in to view and manage your wishlist.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl text-stone-900">Your Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-stone-600">No items saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white"
            >
              <Link href={`/product/${p.id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] ?? "https://placehold.co/600x800?text=No+Image"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <p className="font-serif text-base text-stone-900">{p.name}</p>
                <p className="mt-1 text-sm text-stone-600">
                  ₹{p.price.toLocaleString("en-IN")}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        product_id: p.id,
                        name: p.name,
                        size: p.sizes?.[0] ?? "One Size",
                        qty: 1,
                        price: p.price,
                        image: p.images?.[0] ?? null,
                      })
                    }
                    className="flex-1 rounded-md bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-md border border-stone-300 px-3 py-2 text-xs text-stone-700 hover:bg-stone-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
