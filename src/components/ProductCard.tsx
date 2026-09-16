import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "https://placehold.co/600x800?text=No+Image";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:border-accent/40 hover:shadow-md"
    >
      <div className="aspect-[3/4] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-base text-stone-900">{product.name}</h3>
        <span className="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-medium text-accent">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      </div>
    </Link>
  );
}
