import { useLayoutEffect } from "react";

/**
 * Custom hook to lock/unlock body scroll.
 * Useful for modals, sheets, and other overlay components.
 *
 * @param isLocked - Whether the body scroll should be locked
 */
export function useLockBodyScroll(isLocked: boolean): void {
  useLayoutEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      // Explicitly ensure overflow is not hidden when not locked
      // This prevents issues with Astro View Transitions
      const currentOverflow = window.getComputedStyle(document.body).overflow;
      if (currentOverflow === "hidden") {
        document.body.style.overflow = "";
        document.body.style.removeProperty("overflow");
      }
    }
  }, [isLocked]);
}
