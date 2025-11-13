/**
 * Navigate to a URL with View Transitions support
 * Astro's ViewTransitions component will automatically handle the transition
 */
export async function navigate(url: string, options?: { delay?: number }): Promise<void> {
  const { delay = 0 } = options || {};

  // Wait for optional delay (useful for showing toasts)
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Simply set location.href - Astro ViewTransitions will intercept and animate
  window.location.href = url;
}

/**
 * Reload current page with View Transitions
 */
export async function reload(): Promise<void> {
  window.location.reload();
}

/**
 * Build URL with query parameters
 */
export function buildUrl(basePath: string, params?: Record<string, string | number | null | undefined>): string {
  if (!params) return basePath;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Get query parameter from current URL
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * Get return URL from query params with fallback
 */
export function getReturnUrl(fallback = "/app/notes"): string {
  const returnPage = getQueryParam("returnPage");
  return returnPage && parseInt(returnPage, 10) > 1 ? `/app/notes?page=${returnPage}` : fallback;
}

// Type-safe route builder
export const Routes = {
  notes: {
    list: (page?: number) => buildUrl("/app/notes", { page }),
    detail: (noteId: string, returnPage?: number) => buildUrl(`/app/notes/${noteId}`, { returnPage }),
  },
  auth: {
    login: () => "/auth/login",
    signup: () => "/auth/signup",
  },
  profile: () => "/app/profile",
  home: () => "/",
} as const;
