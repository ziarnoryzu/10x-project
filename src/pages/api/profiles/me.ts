// src/pages/api/profiles/me.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { ProfileDTO } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { Json } from "../../../db/database.types";

export const prerender = false;

// Zod schema for update request body
const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  preferences: z.record(z.unknown()).optional(),
});

/**
 * GET /api/profiles/me
 *
 * Retrieves the authenticated user's profile.
 */
export const GET: APIRoute = async ({ locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Retrieve profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", DEFAULT_USER_ID)
      .single();

    // Step 2: Handle not found case
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Profile not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Prepare response
    const response: ProfileDTO = {
      id: profile.id,
      name: profile.name,
      preferences: profile.preferences,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in GET /api/profiles/me:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PUT /api/profiles/me
 *
 * Updates the authenticated user's profile data.
 * Name is required, preferences are optional.
 */
export const PUT: APIRoute = async ({ request, locals }) => {
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
    const validationResult = UpdateProfileSchema.safeParse(body);
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

    const { name, preferences } = validationResult.data;

    // Step 3: Prepare update data
    const updateData: { name: string; preferences?: Json } = { name };
    if (preferences !== undefined) {
      updateData.preferences = preferences as Json;
    }

    // Step 4: Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      // Check if profile doesn't exist
      if (updateError?.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Profile not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // eslint-disable-next-line no-console
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to update profile",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Prepare response
    const response: ProfileDTO = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      preferences: updatedProfile.preferences,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in PUT /api/profiles/me:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating the profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
