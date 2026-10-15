"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Category, Order, OrderStatus, Product } from "@/lib/types";

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  category_id: "",
  price: "",
  sizes: "",
  images: "",
  stock: "",
  active: true,
};

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push("/");
    }
  }, [loading, user, profile, router]);

  const loadData = async () => {
    const supabase = createClient();
    const [{ data: prods }, { data: cats }, { data: ords }] =
      await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
    setProducts(prods ?? []);
    setCategories(cats ?? []);
    setOrders(ords ?? []);
  };

  useEffect(() => {
    if (user && profile?.is_admin) loadData();
  }, [user, profile]);

  const resetForm = () => setForm(EMPTY_FORM);

  const editProduct = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      category_id: p.category_id ?? "",
      price: String(p.price),
      sizes: p.sizes.join(", "),
      images: p.images.join("\n"),
      stock: String(p.stock),
      active: p.active,
    });
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        name: form.name,
        description: form.description,
        category_id: form.category_id || null,
        price: Number(form.price),
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: form.images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        stock: Number(form.stock),
        active: form.active,
      };

      if (form.id) {
        await supabase.from("products").update(payload).eq("id", form.id);
      } else {
        await supabase.from("products").insert(payload);
      }
      resetForm();
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const imageList = () =>
    form.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("FouziaDesignStudio")
          .upload(path, file);
        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage
          .from("FouziaDesignStudio")
          .getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      setForm((f) => ({
        ...f,
        images: [...imageList(), ...uploadedUrls].join("\n"),
      }));
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Failed to upload image(s)."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({
      ...f,
      images: imageList()
        .filter((u) => u !== url)
        .join("\n"),
    }));
  };

  const deleteProduct = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    await loadData();
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading || !user || !profile?.is_admin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-serif text-3xl text-stone-900">Admin</h1>

      <div className="mb-8 flex gap-4 border-b border-stone-200">
        <button
          onClick={() => setTab("products")}
          className={`pb-3 text-sm font-medium ${
            tab === "products"
              ? "border-b-2 border-stone-900 text-stone-900"
              : "text-stone-500"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`pb-3 text-sm font-medium ${
            tab === "orders"
              ? "border-b-2 border-stone-900 text-stone-900"
              : "text-stone-500"
          }`}
        >
          Orders
        </button>
      </div>

      {tab === "products" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={saveProduct}
            className="space-y-3 rounded-md border border-stone-200 p-4"
          >
            <h2 className="font-serif text-lg text-stone-900">
              {form.id ? "Edit Product" : "New Product"}
            </h2>
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              step="0.01"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Sizes (comma separated, e.g. S, M, L, XL)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <div className="space-y-2">
              <label className="block text-sm text-stone-700">
                Upload images from your computer
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  handleImageUpload(e.target.files);
                  e.target.value = "";
                }}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
              {uploading && (
                <p className="text-xs text-stone-500">Uploading...</p>
              )}
              {uploadError && (
                <p className="text-xs text-red-600">{uploadError}</p>
              )}
              {imageList().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageList().map((url) => (
                    <div key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-16 w-16 rounded border border-stone-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs text-white"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <textarea
              placeholder={"Image URLs, one per line\n(or paste external URLs here directly)"}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible on the site)
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : form.id ? "Update" : "Create"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-stone-300 px-6 py-2 text-sm text-stone-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border border-stone-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {p.name} {!p.active && "(inactive)"}
                  </p>
                  <p className="text-xs text-stone-500">
                    ₹{p.price} · stock {p.stock} · {p.sizes.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editProduct(p)}
                    className="text-xs text-stone-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-xs text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 && (
            <p className="text-stone-500">No orders yet.</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="rounded-md border border-stone-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-stone-500">{o.id}</p>
                  <p className="text-xs text-stone-500">
                    User: {o.user_id} · {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateOrderStatus(o.id, e.target.value as OrderStatus)
                  }
                  className="rounded-md border border-stone-300 px-3 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
  );
}
