"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setProduct(data ?? null);
      if (data?.sizes?.length) setSelectedSize(data.sizes[0]);
      setLoading(false);

      if (user) {
        const { data: wish } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", id)
          .maybeSingle();
        setInWishlist(!!wish);
      }
    })();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addItem({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      qty,
      price: product.price,
      image: product.images?.[0] ?? null,
    });
    setMessage("Added to cart.");
  };

  const toggleWishlist = async () => {
    if (!user) {
      setMessage("Please log in to use the wishlist.");
      return;
    }
    if (!product) return;
    const supabase = createClient();
    if (inWishlist) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      setInWishlist(false);
    } else {
      await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: product.id });
      setInWishlist(true);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-stone-700">Product not found.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ["https://placehold.co/600x800?text=No+Image"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border ${
                    i === activeImage ? "border-accent" : "border-stone-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl text-stone-900">{product.name}</h1>
          <p className="mt-2 text-xl font-medium text-accent">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="mt-6 text-stone-600">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-stone-900">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-md border px-4 py-2 text-sm ${
                    selectedSize === s
                      ? "border-accent bg-accent text-white"
                      : "border-stone-300 text-stone-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-sm font-medium text-stone-900">Qty</p>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {product.stock <= 0 ? "Out of stock" : "Add to Cart"}
            </button>
            <button
              onClick={toggleWishlist}
              className="rounded-full border border-stone-300 px-8 py-3 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-stone-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
