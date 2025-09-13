"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "system"]}
      disableTransitionOnChange
      storageKey="czk-theme"
      enableColorScheme={false}
    >
      {children}
    </ThemeProvider>
  );
}
