// src/pages/api/notes/index.ts

import type { APIRoute } from "astro";
import { z } from "zod";
import type { NoteDTO } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for request body validation (POST)
const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  content: z.string().nullable().optional(),
});

// Zod schema for query params validation (GET)
const QueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["created_at", "updated_at", "title"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * GET /api/notes
 *
 * Retrieves a paginated list of travel notes for the authenticated user.
 * Supports pagination, sorting, and filtering.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  // Type assertion for Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (locals as any).supabase as SupabaseClient;

  try {
    // Step 1: Parse and validate query parameters
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
      sort: url.searchParams.get("sort") || "created_at",
      order: url.searchParams.get("order") || "desc",
    };

    const validationResult = QueryParamsSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: `Invalid query parameters: ${validationResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit, sort, order } = validationResult.data;

    // Step 2: Calculate pagination offsets
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Step 3: Get total count
    const { count, error: countError } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", DEFAULT_USER_ID);

    if (countError) {
      // eslint-disable-next-line no-console
      console.error("Error counting notes:", countError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to count notes",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Retrieve paginated notes
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", DEFAULT_USER_ID)
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    if (notesError) {
      // eslint-disable-next-line no-console
      console.error("Error fetching notes:", notesError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to fetch notes",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Prepare response with pagination metadata
    const response = {
      notes: notes.map((note) => ({
        id: note.id,
        user_id: note.user_id,
        title: note.title,
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in GET /api/notes:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching notes",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * POST /api/notes
 *
 * Creates a new travel note for the authenticated user.
 * Validates title (required) and content (optional).
 */
export const POST: APIRoute = async ({ request, locals }) => {
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
    const validationResult = CreateNoteSchema.safeParse(body);
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

    const { title, content } = validationResult.data;

    // Step 3: Create note in database
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: DEFAULT_USER_ID,
        title,
        content: content ?? null,
      })
      .select()
      .single();

    if (noteError) {
      // eslint-disable-next-line no-console
      console.error("Error creating note:", noteError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Failed to create note",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Prepare response
    const response: NoteDTO = {
      id: note.id,
      user_id: note.user_id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error in POST /api/notes:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating the note",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
