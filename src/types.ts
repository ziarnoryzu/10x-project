// src/types.ts

import type { Json } from "./db/database.types";

// DTOs and Command Models derived from database entities and aligned with the API plan

/**
 * ProfileDTO represents the public profile of a user.
 * Derived from the 'profiles' table.
 */
export interface ProfileDTO {
  id: string;
  name: string;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

/**
 * UpdateProfileDTO is used to update a user's profile.
 * It requires the 'name' field and optionally 'preferences'.
 */
export interface UpdateProfileDTO {
  name: string;
  preferences?: Json;
}

/**
 * NoteDTO represents a travel note.
 * Derived from the 'notes' table.
 */
export interface NoteDTO {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * CreateNoteDTO is used to create a new travel note.
 * The 'user_id' should be provided by the authentication context.
 */
export interface CreateNoteDTO {
  title: string;
  content?: string | null;
  user_id: string;
}

/**
 * UpdateNoteDTO is used to update an existing note.
 * Partial update of 'title' and 'content'.
 */
export type UpdateNoteDTO = Partial<Pick<NoteDTO, "title" | "content">>;

/**
 * TravelPlanDTO represents an AI-generated travel plan.
 * Derived from the 'travel_plans' table.
 */
export interface TravelPlanDTO {
  id: string;
  note_id: string;
  content: Json;
  created_at: string;
  updated_at: string;
}

// New common options type for travel plan commands
export interface TravelPlanOptions {
  style?: "adventure" | "leisure";
  transport?: "car" | "public" | "walking";
  budget?: "economy" | "standard" | "luxury";
}

/**
 * GenerateTravelPlanCommand is the payload for generating a new travel plan.
 * It supports optional personalization options.
 */
export interface GenerateTravelPlanCommand {
  options?: TravelPlanOptions;
}

/**
 * UpdateTravelPlanCommand is used to update an existing travel plan.
 * It requires a confirmation flag to overwrite the previous plan.
 */
export interface UpdateTravelPlanCommand {
  confirm: boolean;
  options?: TravelPlanOptions;
}
