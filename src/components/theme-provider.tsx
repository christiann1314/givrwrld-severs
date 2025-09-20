import * as React from "react";

// Lightweight theme-provider shim to avoid next-themes runtime until needed
// Wraps children without adding context. Replace with next-themes when required.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
