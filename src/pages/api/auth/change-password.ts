// src/pages/api/auth/change-password.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { SupabaseClient } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for password change request
const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

/**
 * POST /api/auth/change-password
 *
 * Changes the authenticated user's password.
 * Requires active user session and current password for verification.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Validate request body with Zod
    const validationResult = ChangePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { current_password, new_password } = validationResult.data;

    // Step 3: Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: locals.user.email,
      password: current_password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Obecne hasło jest nieprawidłowe",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Nie udało się zmienić hasła. Spróbuj ponownie.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Return success
    return new Response(
      JSON.stringify({
        message: "Password changed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in POST /api/auth/change-password:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while changing password",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
