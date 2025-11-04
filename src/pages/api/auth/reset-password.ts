// src/pages/api/auth/reset-password.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for reset password request
const ResetPasswordSchema = z.object({
  code: z.string().min(1, "Kod autoryzacyjny jest wymagany"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
    .regex(/\d/, "Hasło musi zawierać co najmniej jedną cyfrę"),
});

/**
 * POST /api/auth/reset-password
 *
 * Resets the user's password using the code from the email link.
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
    const validationResult = ResetPasswordSchema.safeParse(body);
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

    const { code, password } = validationResult.data;

    // Step 3: Create Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Step 4: Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Nieprawidłowy lub wygasły link do resetowania hasła",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
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

    // Step 6: Return success response
    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zmienione",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in POST /api/auth/reset-password:", error);
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

