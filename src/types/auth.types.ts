// src/types/auth.types.ts

/**
 * Auth-related types and DTOs
 * Used across authentication components and API endpoints
 */

/**
 * LoginRequestDTO - payload sent to /api/auth/login
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/**
 * AuthUserDTO - basic authenticated user information
 */
export interface AuthUserDTO {
  id: string;
  email: string;
}

/**
 * LoginResponseDTO - response from /api/auth/login endpoint
 */
export interface LoginResponseDTO {
  user: AuthUserDTO;
  needsOnboarding: boolean;
}

/**
 * RegisterRequestDTO - payload sent to /api/auth/register
 */
export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

/**
 * RegisterResponseDTO - response from /api/auth/register endpoint
 */
export interface RegisterResponseDTO {
  user: AuthUserDTO;
  needsOnboarding: boolean;
}

/**
 * ForgotPasswordRequestDTO - payload sent to /api/auth/forgot-password
 */
export interface ForgotPasswordRequestDTO {
  email: string;
}

/**
 * ResetPasswordRequestDTO - payload sent to /api/auth/reset-password
 */
export interface ResetPasswordRequestDTO {
  code: string;
  newPassword: string;
}

/**
 * ChangePasswordRequestDTO - payload sent to /api/auth/change-password
 */
export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

/**
 * ProfilePreferencesDTO - user travel preferences
 */
export interface ProfilePreferencesDTO {
  preferences: string[];
}

/**
 * Predefined travel preferences organized by categories
 * Used in onboarding modal and profile preferences form
 * Consistent with US-005 requirements
 */
export const TRAVEL_PREFERENCES = {
  style: {
    label: "Styl podróży",
    description: "Wybierz preferowane style podróżowania",
    tags: ["Relaks", "Zwiedzanie", "Impreza", "Przygoda", "Kulinarny", "Aktywny"],
  },
  interests: {
    label: "Zainteresowania",
    description: "Co Cię interesuje podczas podróży?",
    tags: ["Historia", "Sztuka", "Przyroda", "Architektura", "Muzea", "Fotografia", "Sport", "Zakupy"],
  },
  cuisine: {
    label: "Preferencje kulinarne",
    description: "Jakie rodzaje kuchni preferujesz?",
    tags: [
      "Lokalna kuchnia",
      "Kuchnia włoska",
      "Kuchnia azjatycka",
      "Kuchnia japońska",
      "Street food",
      "Fine dining",
      "Wegetariańska",
      "Wegańska",
    ],
  },
  pace: {
    label: "Tempo zwiedzania",
    description: "W jakim tempie lubisz podróżować?",
    tags: ["Wolne", "Umiarkowane", "Intensywne"],
  },
} as const;
