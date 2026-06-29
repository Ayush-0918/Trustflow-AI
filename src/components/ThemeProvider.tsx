"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, ComponentProps } from "react";

// Suppress the React 19 default script tag warning from next-themes
if (typeof console !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag while rendering React component")) {
      return;
    }
    originalError.call(console, ...args);
  };
}

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
