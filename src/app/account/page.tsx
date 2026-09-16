"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user && !loggingOut) router.push("/login");
  }, [loading, user, loggingOut, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.default_address ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data ?? []);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const supabase = createClient();
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        phone,
        default_address: address,
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-stone-500">
          {loggingOut ? "Logging out..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-stone-900">My Account</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          Log out
        </button>
      </div>
      <p className="mt-1 text-sm text-stone-500">{user.email}</p>

      <form onSubmit={handleSave} className="mt-8 space-y-4">
        <h2 className="font-serif text-xl text-stone-900">Profile</h2>
        <div>
          <label className="mb-1 block text-sm text-stone-700">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-700">
            Default delivery address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <p className="text-sm text-green-700">Saved.</p>}
      </form>

      <div className="mt-12">
        <h2 className="font-serif text-xl text-stone-900">Order History</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">
            No orders yet.{" "}
            <Link href="/shop" className="underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-md border border-stone-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs text-stone-500">{o.id}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
                <ul className="mt-2 text-sm text-stone-700">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} (Size {it.size}) x{it.qty} — ₹{it.price * it.qty}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-medium text-stone-900">
                  Total: ₹{o.total.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
