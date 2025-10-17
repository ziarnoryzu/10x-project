// src/pages/api/notes/[noteId]/generate-plan.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateTravelPlanCommand, TravelPlanDTO } from "../../../../types";
import { travelPlanService } from "../../../../lib/services/travel-plan.service";
import type { SupabaseClient } from "../../../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../../../db/supabase.client";

export const prerender = false;

// Zod schema for request body validation
const GenerateTravelPlanSchema = z.object({
  options: z
    .object({
      style: z.enum(["adventure", "leisure"]).optional(),
      transport: z.enum(["car", "public", "walking"]).optional(),
      budget: z.enum(["economy", "standard", "luxury"]).optional(),
    })
    .optional(),
});

// UUID validation schema
const UUIDSchema = z.string().uuid();

/**
 * POST /api/notes/{noteId}/generate-plan
 *
 * Generates a travel plan from a user's travel note.
 * Validates authentication, note ownership, content requirements,
 * and optional personalization options.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 2: Validate noteId parameter
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

    // Step 3: Parse and validate request body (optional)
    let command: GenerateTravelPlanCommand = {};

    // Check if request has a body
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const body = await request.json();
        const validatedBody = GenerateTravelPlanSchema.parse(body);
        command = validatedBody;
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message:
              error instanceof z.ZodError
                ? `Invalid request body: ${error.errors.map((e) => e.message).join(", ")}`
                : "Invalid request body format",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Step 4: Retrieve note from database
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

    // Step 5: Validate note content (minimum 10 words)
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

    // Step 6: Check if a travel plan already exists for this note
    const { data: existingPlan } = await supabase.from("travel_plans").select("id").eq("note_id", noteId).single();

    const isUpdate = !!existingPlan;

    // Step 7: Generate travel plan
    // TypeScript guard: we already validated content is not null/empty
    const noteContent = note.content as string;
    const planContent = await travelPlanService.generatePlan(noteContent, command.options);

    // Step 8: Save travel plan to database (upsert to handle unique constraint on note_id)
    const { data: travelPlan, error: planError } = await supabase
      .from("travel_plans")
      .upsert(
        {
          note_id: noteId,
          content: planContent,
        },
        {
          onConflict: "note_id",
        }
      )
      .select()
      .single();

    if (planError) {
      // eslint-disable-next-line no-console
      console.error("Error saving travel plan:", planError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to save travel plan",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 9: Prepare response
    const response: { travel_plan: TravelPlanDTO } = {
      travel_plan: {
        id: travelPlan.id,
        note_id: travelPlan.note_id,
        content: travelPlan.content,
        created_at: travelPlan.created_at,
        updated_at: travelPlan.updated_at,
      },
    };

    // Determine status code: 201 for new, 200 for updated
    const statusCode = isUpdate ? 200 : 201;

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in generate-plan endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while generating the travel plan",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
