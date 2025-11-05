// src/lib/schemas/travel-plan.schema.ts

import { z } from "zod";

/**
 * Schema for a single activity within a travel plan.
 * Defines the structure for individual activities with pricing and logistics information.
 */
export const ActivitySchema = z.object({
  name: z.string().describe("Nazwa aktywności."),
  description: z.string().describe("Szczegółowy opis aktywności."),
  priceCategory: z.enum(["free", "budget", "moderate", "expensive"]).describe("Kategoria cenowa aktywności."),
  logistics: z
    .object({
      address: z.string().optional().describe("Adres lokalizacji."),
      mapLink: z.string().url().optional().describe("Link do mapy Google."),
      estimatedTime: z.string().optional().describe("Szacowany czas trwania aktywności."),
    })
    .describe("Informacje logistyczne dotyczące aktywności."),
});

/**
 * Schema for activities organized by time of day.
 * Groups activities into morning, afternoon, and evening slots.
 * All fields are optional to support partial days (e.g., arrival in the evening, departure in the morning).
 * At least one time period should have activities, but this is not enforced at schema level.
 */
export const DayActivitiesSchema = z.object({
  morning: z.array(ActivitySchema).optional().describe("Aktywności zaplanowane na poranek (opcjonalne)."),
  afternoon: z.array(ActivitySchema).optional().describe("Aktywności zaplanowane na popołudnie (opcjonalne)."),
  evening: z.array(ActivitySchema).optional().describe("Aktywności zaplanowane na wieczór (opcjonalne)."),
});

/**
 * Schema for a single day in the travel itinerary.
 * Contains the day number, title, and activities organized by time of day.
 */
export const TravelDaySchema = z.object({
  day: z.number().int().positive().describe("Numer dnia w planie podróży (zaczynając od 1)."),
  title: z.string().describe("Tytuł lub temat dnia (np. 'Zwiedzanie centrum')."),
  activities: DayActivitiesSchema.describe("Aktywności pogrupowane według pory dnia."),
});

/**
 * Schema for the complete travel plan content.
 * Includes the daily itinerary and an optional disclaimer about AI-generated content.
 */
export const TravelPlanContentSchema = z.object({
  days: z.array(TravelDaySchema).min(1).describe("Plan podróży dzień po dniu."),
  disclaimer: z
    .string()
    .optional()
    .default("Zaleca się weryfikację godzin otwarcia i dostępności atrakcji przed wizytą.")
    .describe("Zastrzeżenie dotyczące planu wygenerowanego przez AI, przypominające o weryfikacji informacji."),
});

/**
 * Type inference for TravelPlanContent based on the schema.
 * Use this type for type-safe handling of travel plan data.
 */
export type TravelPlanContent = z.infer<typeof TravelPlanContentSchema>;

/**
 * Type inference for a single travel day.
 */
export type TravelDay = z.infer<typeof TravelDaySchema>;

/**
 * Type inference for a single activity.
 */
export type Activity = z.infer<typeof ActivitySchema>;
