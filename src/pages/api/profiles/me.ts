// src/pages/api/profiles/me.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { UserProfileDTO } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { Json } from "../../../db/database.types";

export const prerender = false;

// Zod schema for update request body
const UpdateProfileSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    preferences: z.array(z.string()).optional(),
  })
  .refine((data) => data.name !== undefined || data.preferences !== undefined, {
    message: "At least one field (name or preferences) must be provided",
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
      .eq("id", locals.user!.id)
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

    // Step 3: Parse preferences from Json to string[]
    let preferences: string[] = [];
    if (profile.preferences && typeof profile.preferences === "object" && !Array.isArray(profile.preferences)) {
      // If preferences is an object (Record<string, string[]>), flatten all values
      preferences = Object.values(profile.preferences as Record<string, unknown>)
        .flat()
        .filter((item): item is string => typeof item === "string");
    } else if (Array.isArray(profile.preferences)) {
      // If preferences is already an array, use it directly
      preferences = profile.preferences.filter((item): item is string => typeof item === "string");
    }

    // Step 4: Prepare response
    const response: UserProfileDTO = {
      id: profile.id,
      email: locals.user!.email || "",
      name: profile.name,
      preferences,
      created_at: profile.created_at,
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
    const updateData: { name?: string; preferences?: Json } = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (preferences !== undefined) {
      // Convert string[] to Json for database storage
      updateData.preferences = preferences as Json;
    }

    // Step 4: Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", locals.user!.id)
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

    // Step 5: Parse preferences from Json to string[]
    let updatedPreferences: string[] = [];
    if (
      updatedProfile.preferences &&
      typeof updatedProfile.preferences === "object" &&
      !Array.isArray(updatedProfile.preferences)
    ) {
      // If preferences is an object (Record<string, string[]>), flatten all values
      updatedPreferences = Object.values(updatedProfile.preferences as Record<string, unknown>)
        .flat()
        .filter((item): item is string => typeof item === "string");
    } else if (Array.isArray(updatedProfile.preferences)) {
      // If preferences is already an array, use it directly
      updatedPreferences = updatedProfile.preferences.filter((item): item is string => typeof item === "string");
    }

    // Step 6: Prepare response
    const response: UserProfileDTO = {
      id: updatedProfile.id,
      email: locals.user!.email || "",
      name: updatedProfile.name,
      preferences: updatedPreferences,
      created_at: updatedProfile.created_at,
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

/**
 * DELETE /api/profiles/me
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * This includes:
 * - All travel plans associated with user's notes
 * - All user's notes
 * - User's profile
 * - User's auth account (if implemented)
 */
export const DELETE: APIRoute = async ({ locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Delete all travel plans associated with user's notes
    // First, get all note IDs for the user
    const { data: userNotes, error: notesListError } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", locals.user!.id);

    if (notesListError) {
      // eslint-disable-next-line no-console
      console.error("Error fetching user notes for deletion:", notesListError);
      // Continue with deletion even if this fails
    }

    // Delete travel plans for these notes
    if (userNotes && userNotes.length > 0) {
      const noteIds = userNotes.map((note) => note.id);
      const { error: plansDeleteError } = await supabase.from("travel_plans").delete().in("note_id", noteIds);

      if (plansDeleteError) {
        // eslint-disable-next-line no-console
        console.error("Error deleting travel plans:", plansDeleteError);
        // Continue with deletion even if this fails
      }
    }

    // Step 2: Delete all user's notes
    const { error: notesDeleteError } = await supabase.from("notes").delete().eq("user_id", locals.user!.id);

    if (notesDeleteError) {
      // eslint-disable-next-line no-console
      console.error("Error deleting notes:", notesDeleteError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to delete user notes",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Delete user's profile
    const { error: profileDeleteError } = await supabase.from("profiles").delete().eq("id", locals.user!.id);

    if (profileDeleteError) {
      // eslint-disable-next-line no-console
      console.error("Error deleting profile:", profileDeleteError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to delete user profile",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Delete user from Supabase Auth (optional - requires admin privileges)
    // TODO: Implement when proper authentication is set up
    // const { error: authDeleteError } = await supabase.auth.admin.deleteUser(locals.user!.id);
    // if (authDeleteError) {
    //   console.error("Error deleting auth user:", authDeleteError);
    // }

    // Step 5: Return success
    return new Response(
      JSON.stringify({
        message: "Account deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in DELETE /api/profiles/me:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the account",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
