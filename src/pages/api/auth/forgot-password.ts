// src/pages/api/auth/forgot-password.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for forgot password request
const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

/**
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email to the user.
 * Always returns success to prevent user enumeration.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Step 1: Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Nieprawidłowe dane żądania",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Validate request body with Zod
    const validationResult = ForgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: validationResult.error.errors[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email } = validationResult.data;

    // Step 3: Create Supabase client and send reset email
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Note: This will send email only if the user exists
    // We don't check for errors to prevent user enumeration
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    // Step 4: Always return success to prevent user enumeration
    return new Response(
      JSON.stringify({
        message: "Jeśli konto istnieje, wysłaliśmy link do resetowania hasła.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in POST /api/auth/forgot-password:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
