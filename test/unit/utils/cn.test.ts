// test/unit/utils/cn.test.ts

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  /**
   * REGUŁA BIZNESOWA: Funkcja cn() łączy klasy CSS i inteligentnie merguje
   * konflikty Tailwind CSS (np. 'px-2 px-4' -> 'px-4').
   * Używa: clsx (warunkowe klasy) + tailwind-merge (rozwiązywanie konfliktów).
   */

  describe("basic className merging", () => {
    it("should merge simple class names", () => {
      // Arrange & Act
      const result = cn("text-red-500", "bg-blue-500");

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle single class name", () => {
      // Arrange & Act
      const result = cn("text-center");

      // Assert
      expect(result).toBe("text-center");
    });

    it("should handle empty input", () => {
      // Arrange & Act
      const result = cn();

      // Assert
      expect(result).toBe("");
    });

    it("should handle multiple class names as separate arguments", () => {
      // Arrange & Act
      const result = cn("flex", "items-center", "justify-between", "p-4");

      // Assert
      expect(result).toBe("flex items-center justify-between p-4");
    });

    it("should handle class names as array", () => {
      // Arrange
      const classes = ["flex", "items-center", "gap-2"];

      // Act
      const result = cn(classes);

      // Assert
      expect(result).toBe("flex items-center gap-2");
    });
  });

  describe("Tailwind conflict resolution", () => {
    it("should resolve padding conflicts (last one wins)", () => {
      // Arrange - konflikt padding
      const result = cn("px-2", "px-4");

      // Assert - ostatnia wartość wygrywa
      expect(result).toBe("px-4");
    });

    it("should resolve margin conflicts", () => {
      // Arrange
      const result = cn("m-2", "m-4");

      // Assert
      expect(result).toBe("m-4");
    });

    it("should resolve text size conflicts", () => {
      // Arrange
      const result = cn("text-sm", "text-base", "text-lg");

      // Assert
      expect(result).toBe("text-lg");
    });

    it("should resolve background color conflicts", () => {
      // Arrange
      const result = cn("bg-red-500", "bg-blue-500");

      // Assert
      expect(result).toBe("bg-blue-500");
    });

    it("should resolve width conflicts", () => {
      // Arrange
      const result = cn("w-1/2", "w-full");

      // Assert
      expect(result).toBe("w-full");
    });

    it("should keep non-conflicting classes from same category", () => {
      // Arrange - px i py nie konfliktują
      const result = cn("px-2", "py-4");

      // Assert
      expect(result).toBe("px-2 py-4");
    });

    it("should resolve complex conflicts with multiple properties", () => {
      // Arrange
      const result = cn("p-2 bg-red-500 text-sm", "p-4 bg-blue-500");

      // Assert - p i bg rozwiązane, text-sm pozostaje
      expect(result).toBe("text-sm p-4 bg-blue-500");
    });
  });

  describe("conditional classes (clsx functionality)", () => {
    it("should handle conditional object syntax", () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;

      // Act
      const result = cn({
        "bg-blue-500": isActive,
        "bg-gray-500": isDisabled,
        "cursor-pointer": !isDisabled,
      });

      // Assert
      expect(result).toBe("bg-blue-500 cursor-pointer");
    });

    it("should handle mixed string and conditional classes", () => {
      // Arrange
      const isActive = true;

      // Act
      const result = cn("base-class", { "active-class": isActive, "inactive-class": !isActive });

      // Assert
      expect(result).toBe("base-class active-class");
    });

    it("should handle ternary expressions", () => {
      // Arrange
      const variant = "primary";

      // Act
      const result = cn(variant === "primary" ? "bg-blue-500" : "bg-gray-500", "text-white");

      // Assert
      expect(result).toBe("bg-blue-500 text-white");
    });

    it("should handle complex conditional logic", () => {
      // Arrange - realistyczny przykład z komponentu Button
      // Używamy funkcji aby uniknąć TypeScript literal type inference
      const getVariant = (): "default" | "destructive" => "default";
      const getSize = (): "sm" | "md" | "lg" => "md";
      const isDisabled = (): boolean => false;

      const variant = getVariant();
      const size = getSize();
      const disabled = isDisabled();

      // Act
      const result = cn(
        "inline-flex items-center justify-center",
        {
          "bg-primary text-primary-foreground": variant === "default",
          "bg-destructive text-destructive-foreground": variant === "destructive",
        },
        {
          "h-10 px-4 py-2": size === "md",
          "h-9 px-3": size === "sm",
          "h-11 px-8": size === "lg",
        },
        {
          "opacity-50 cursor-not-allowed": disabled,
        }
      );

      // Assert
      expect(result).toContain("inline-flex");
      expect(result).toContain("bg-primary");
      expect(result).toContain("h-10");
      expect(result).not.toContain("opacity-50");
    });
  });

  describe("handling falsy values", () => {
    it("should ignore undefined values", () => {
      // Arrange & Act
      const result = cn("text-center", undefined, "bg-blue-500");

      // Assert
      expect(result).toBe("text-center bg-blue-500");
    });

    it("should ignore null values", () => {
      // Arrange & Act
      const result = cn("text-center", null, "bg-blue-500");

      // Assert
      expect(result).toBe("text-center bg-blue-500");
    });

    it("should ignore false boolean values", () => {
      // Arrange & Act
      const result = cn("text-center", false, "bg-blue-500");

      // Assert
      expect(result).toBe("text-center bg-blue-500");
    });

    it("should ignore empty strings", () => {
      // Arrange & Act
      const result = cn("text-center", "", "bg-blue-500");

      // Assert
      expect(result).toBe("text-center bg-blue-500");
    });

    it("should handle array with falsy values", () => {
      // Arrange
      const classes = ["flex", undefined, null, "gap-2", false, "", "items-center"];

      // Act
      const result = cn(classes);

      // Assert
      expect(result).toBe("flex gap-2 items-center");
    });

    it("should handle all falsy values", () => {
      // Arrange & Act
      const result = cn(undefined, null, false, "", 0);

      // Assert
      expect(result).toBe(""); // 0 jest falsy ale nie jest obsługiwane przez clsx specjalnie
    });
  });

  describe("realistic component usage patterns", () => {
    it("should work with component variant pattern", () => {
      // Arrange - pattern używany w shadcn/ui
      const baseClasses = "rounded-md font-semibold transition-colors";
      const variantClasses = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
      };
      const variant = "default";

      // Act
      const result = cn(baseClasses, variantClasses[variant]);

      // Assert
      expect(result).toContain("rounded-md");
      expect(result).toContain("bg-primary");
      expect(result).toContain("hover:bg-primary/90");
    });

    it("should handle className prop override pattern", () => {
      // Arrange - pattern z props.className
      const defaultClasses = "flex items-center gap-2 p-4";
      const userClassName = "gap-4 bg-red-500"; // user override gap-2 -> gap-4

      // Act
      const result = cn(defaultClasses, userClassName);

      // Assert
      expect(result).toContain("flex");
      expect(result).toContain("gap-4"); // override
      expect(result).not.toContain("gap-2");
      expect(result).toContain("bg-red-500");
    });

    it("should handle responsive classes", () => {
      // Arrange
      const result = cn("text-sm", "md:text-base", "lg:text-lg", "hover:text-blue-500");

      // Assert
      expect(result).toBe("text-sm md:text-base lg:text-lg hover:text-blue-500");
    });

    it("should resolve responsive class conflicts", () => {
      // Arrange - konflikt na poziomie responsive
      const result = cn("p-2", "md:p-4", "md:p-6"); // drugi md:p wygrywa

      // Assert
      expect(result).toBe("p-2 md:p-6");
    });

    it("should handle dark mode variants", () => {
      // Arrange
      const result = cn("bg-white text-black", "dark:bg-black dark:text-white");

      // Assert
      expect(result).toBe("bg-white text-black dark:bg-black dark:text-white");
    });

    it("should handle state variants (hover, focus, active)", () => {
      // Arrange
      const result = cn(
        "bg-blue-500",
        "hover:bg-blue-600",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "active:bg-blue-700"
      );

      // Assert
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("hover:bg-blue-600");
      expect(result).toContain("focus:outline-none");
      expect(result).toContain("active:bg-blue-700");
    });

    it("should handle group and peer modifiers", () => {
      // Arrange
      const result = cn("group-hover:text-blue-500", "peer-checked:bg-blue-500");

      // Assert
      expect(result).toBe("group-hover:text-blue-500 peer-checked:bg-blue-500");
    });
  });

  describe("edge cases", () => {
    it("should handle very long class string", () => {
      // Arrange - długi ciąg klas
      const longClasses = Array(50)
        .fill(null)
        .map((_, i) => `class-${i}`)
        .join(" ");

      // Act
      const result = cn(longClasses);

      // Assert
      expect(result).toBe(longClasses);
    });

    it("should handle duplicate classes", () => {
      // Arrange
      const result = cn("flex", "items-center", "flex", "gap-2");

      // Assert - tailwind-merge usuwa duplikaty, ale kolejność może się różnić
      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).toContain("gap-2");
      // Nie testujemy konkretnej kolejności, bo tailwind-merge może ją zmieniać
    });

    it("should handle classes with special characters", () => {
      // Arrange - arbitrary values w Tailwind
      const result = cn("w-[123px]", "h-[calc(100vh-64px)]");

      // Assert
      expect(result).toBe("w-[123px] h-[calc(100vh-64px)]");
    });

    it("should handle conflicting arbitrary values", () => {
      // Arrange
      const result = cn("w-[100px]", "w-[200px]");

      // Assert - ostatni wygrywa
      expect(result).toBe("w-[200px]");
    });

    it("should handle numbers in input", () => {
      // Arrange - clsx konwertuje liczby na stringi
      const result = cn("flex", 123, "items-center");

      // Assert - clsx przekształca liczby na stringi
      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).toContain("123");
    });

    it("should handle nested arrays", () => {
      // Arrange
      const result = cn(["flex", ["items-center", "gap-2"]], "bg-blue-500");

      // Assert
      expect(result).toBe("flex items-center gap-2 bg-blue-500");
    });

    it("should handle important modifier", () => {
      // Arrange
      const result = cn("!text-red-500", "text-blue-500");

      // Assert - !important powinno zostać
      expect(result).toContain("!text-red-500");
    });

    it("should handle CSS variable classes", () => {
      // Arrange - custom properties
      const result = cn("bg-[var(--primary)]", "text-[color:var(--foreground)]");

      // Assert
      expect(result).toBe("bg-[var(--primary)] text-[color:var(--foreground)]");
    });
  });

  describe("performance and optimization scenarios", () => {
    it("should efficiently handle commonly used class combinations", () => {
      // Arrange - często używany pattern flex
      const result = cn("flex", "items-center", "justify-between", "w-full", "p-4", "rounded-lg", "shadow-md");

      // Assert
      expect(result).toBe("flex items-center justify-between w-full p-4 rounded-lg shadow-md");
    });

    it("should handle empty arrays and objects efficiently", () => {
      // Arrange & Act
      const result = cn([], {}, "", null, undefined);

      // Assert
      expect(result).toBe("");
    });
  });
});
