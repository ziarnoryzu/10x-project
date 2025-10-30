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
    }
  }, [isLocked]);
}
