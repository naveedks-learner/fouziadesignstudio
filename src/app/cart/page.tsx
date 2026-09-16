"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);

    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile?.default_address) {
      router.push("/account");
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    try {
      const supabase = createClient();
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        size: i.size,
        qty: i.qty,
        price: i.price,
      }));

      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: orderItems,
          total,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const lines = [
        `New order from Fouzia Design Studio`,
        `Order ID: ${order.id}`,
        ``,
        `Customer: ${profile.full_name ?? "N/A"}`,
        `Phone: ${profile.phone ?? "N/A"}`,
        `Delivery address: ${profile.default_address}`,
        ``,
        `Items:`,
        ...orderItems.map(
          (i) => `- ${i.name} (Size ${i.size}) x${i.qty} — ₹${i.price * i.qty}`
        ),
        ``,
        `Total: ₹${total.toLocaleString("en-IN")}`,
      ];
      const message = lines.join("\n");

      if (whatsappNumber) {
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      }

      clear();
      setConfirmation(order.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-2xl text-stone-900">Order placed!</h1>
        <p className="mt-3 text-stone-600">
          Your order <span className="font-mono">{confirmation}</span> has
          been recorded. Complete the checkout by sending the WhatsApp message
          we opened for you — we&apos;ll confirm your order there.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl text-stone-900">Your Cart</h1>

      {items.length === 0 ? (
        <div>
          <p className="text-stone-600">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-500">Size: {item.size}</p>
                  <p className="text-sm text-stone-500">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    updateQty(
                      item.product_id,
                      item.size,
                      Math.max(1, Number(e.target.value))
                    )
                  }
                  className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm"
                />
                <p className="w-20 text-right text-sm text-stone-900">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => removeItem(item.product_id, item.size)}
                  className="text-sm text-stone-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-end gap-2">
            <p className="text-lg font-medium text-accent">
              Total: ₹{total.toLocaleString("en-IN")}
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!user && (
              <p className="text-sm text-stone-500">
                You&apos;ll need to log in to checkout.
              </p>
            )}
            {user && !profile?.default_address && (
              <p className="text-sm text-stone-500">
                Add a default delivery address in your account before
                checking out.
              </p>
            )}
            <button
              onClick={handleCheckout}
              disabled={placing}
              className="rounded-full bg-green-700 px-8 py-3 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {placing ? "Placing order..." : "Checkout on WhatsApp"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
