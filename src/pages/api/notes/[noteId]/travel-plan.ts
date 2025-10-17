// src/pages/api/notes/[noteId]/travel-plan.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { TravelPlanDTO } from "../../../../types";
import { travelPlanService } from "../../../../lib/services/travel-plan.service";
import type { SupabaseClient } from "../../../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../../../db/supabase.client";

export const prerender = false;

// UUID validation schema
const UUIDSchema = z.string().uuid();

// Zod schema for update request body
const UpdateTravelPlanSchema = z.object({
  confirm: z.boolean(),
  options: z
    .object({
      style: z.enum(["adventure", "leisure"]).optional(),
      transport: z.enum(["car", "public", "walking"]).optional(),
      budget: z.enum(["economy", "standard", "luxury"]).optional(),
    })
    .optional(),
});

/**
 * GET /api/notes/{noteId}/travel-plan
 *
 * Retrieves the travel plan linked to the note.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Validate noteId parameter
    const noteIdValidation = UUIDSchema.safeParse(params.noteId);
    if (!noteIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid note ID format. Must be a valid UUID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const noteId = noteIdValidation.data;

    // Step 2: Check if note exists and user has access
    const { data: note } = await supabase
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (!note) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Note not found or you don't have access to it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Retrieve travel plan from database
    const { data: travelPlan, error: planError } = await supabase
      .from("travel_plans")
      .select("*")
      .eq("note_id", noteId)
      .single();

    // Step 4: Handle not found case
    if (planError || !travelPlan) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Travel plan not found for this note",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Prepare response
    const response: TravelPlanDTO = {
      id: travelPlan.id,
      note_id: travelPlan.note_id,
      content: travelPlan.content,
      created_at: travelPlan.created_at,
      updated_at: travelPlan.updated_at,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in GET /api/notes/{noteId}/travel-plan:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the travel plan",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PUT /api/notes/{noteId}/travel-plan
 *
 * Allows the user to re-generate or update the travel plan for the note.
 * Requires confirmation to overwrite the previous plan.
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Validate noteId parameter
    const noteIdValidation = UUIDSchema.safeParse(params.noteId);
    if (!noteIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid note ID format. Must be a valid UUID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const noteId = noteIdValidation.data;

    // Step 2: Parse and validate request body
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

    // Step 3: Validate request body with Zod
    const validationResult = UpdateTravelPlanSchema.safeParse(body);
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

    const { confirm, options } = validationResult.data;

    // Step 4: Check confirmation flag
    if (!confirm) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Confirmation required to overwrite existing travel plan. Set 'confirm' to true.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Retrieve note and validate content
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (noteError || !note) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Note not found or you don't have access to it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 6: Validate note content (minimum 10 words)
    if (!travelPlanService.validateNoteContent(note.content)) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Note content must contain at least 10 words to generate a travel plan",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 7: Check if travel plan exists
    const { data: existingPlan } = await supabase.from("travel_plans").select("id").eq("note_id", noteId).single();

    if (!existingPlan) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: "Travel plan not found for this note. Use POST /api/notes/{noteId}/generate-plan to create one.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 8: Regenerate travel plan
    const noteContent = note.content as string;
    const planContent = await travelPlanService.generatePlan(noteContent, options);

    // Step 9: Update travel plan in database
    const { data: updatedPlan, error: updateError } = await supabase
      .from("travel_plans")
      .update({ content: planContent })
      .eq("note_id", noteId)
      .select()
      .single();

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error("Error updating travel plan:", updateError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to update travel plan",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 10: Prepare response
    const response: TravelPlanDTO = {
      id: updatedPlan.id,
      note_id: updatedPlan.note_id,
      content: updatedPlan.content,
      created_at: updatedPlan.created_at,
      updated_at: updatedPlan.updated_at,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in PUT /api/notes/{noteId}/travel-plan:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating the travel plan",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
