"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { count } = useCart();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/shop", label: "Shop" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: `Cart${count > 0 ? ` (${count})` : ""}` },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-accent bg-stone-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide text-accent"
        >
          Fouzia Design Studio
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-700 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
          {profile?.is_admin && (
            <Link href="/admin" className="hover:text-accent">
              Admin
            </Link>
          )}
          {user ? (
            <Link href="/account" className="hover:text-accent">
              Account
            </Link>
          ) : (
            <Link href="/login" className="hover:text-accent">
              Login
            </Link>
          )}
        </nav>

        <button
          className="text-accent sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-accent/20 px-4 pb-4 text-sm text-stone-700 sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {profile?.is_admin && (
            <Link href="/admin" className="py-2" onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
          {user ? (
            <Link href="/account" className="py-2" onClick={() => setOpen(false)}>
              Account
            </Link>
          ) : (
            <Link href="/login" className="py-2" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
