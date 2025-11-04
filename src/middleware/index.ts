// src/middleware/index.ts

import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/forgot-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/forgot-password",
  // Public pages
  "/",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, url, request, redirect } = context;

  // Create Supabase client for all requests
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Always set supabase client in locals (TypeScript workaround)
  (locals as { supabase: typeof supabase }).supabase = supabase;

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set user in locals if authenticated
  if (user) {
    (locals as { user?: { id: string; email: string } }).user = {
      email: user.email || "",
      id: user.id,
    };
  }

  // Redirect to login for protected routes if not authenticated
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  return next();
});
