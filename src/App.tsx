import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster as SonnerToaster } from "sonner";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {/* Sonner toaster with theme support */}
      <SonnerThemeBridge />
    </BrowserRouter>
  );
}

/** Sonner needs a theme prop to match light/dark. */
function SonnerThemeBridge() {
  // For now, use system theme as default to avoid useTheme hook issues
  return (
    <SonnerToaster 
      position="top-right" 
      richColors 
      expand 
      theme="system"
    />
  );
}
