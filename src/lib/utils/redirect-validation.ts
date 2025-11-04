// src/lib/utils/redirect-validation.ts

/**
 * Validates that a redirect URL is safe (internal to the application)
 * Prevents open redirect attacks by rejecting external URLs
 *
 * @param redirectUrl - The URL to validate
 * @param defaultRedirect - The default URL to use if validation fails
 * @returns A safe redirect URL (internal path only)
 */
export function validateRedirectUrl(redirectUrl: string | null, defaultRedirect = "/app/notes"): string {
  // If no redirect URL provided, use default
  if (!redirectUrl) {
    return defaultRedirect;
  }

  // Check if URL is external (contains protocol or starts with //)
  // External URLs are not allowed to prevent open redirect attacks
  if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://") || redirectUrl.startsWith("//")) {
    // eslint-disable-next-line no-console
    console.warn(`[Security] Blocked external redirect attempt: ${redirectUrl}`);
    return defaultRedirect;
  }

  // Ensure the URL starts with / (internal path)
  if (!redirectUrl.startsWith("/")) {
    return `/${redirectUrl}`;
  }

  // URL is safe - return it
  return redirectUrl;
}
