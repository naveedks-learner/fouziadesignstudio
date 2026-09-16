import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project's URL and anon key."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    db: { schema: "fouzia_design_studio" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component without a surrounding
          // middleware/route handler to persist cookies — safe to ignore
          // when using middleware to refresh sessions.
        }
      },
    },
  });
}
