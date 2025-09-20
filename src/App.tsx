import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from '@/integrations/supabase/client';

import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster as SonnerToaster } from "sonner";

import { AppRoutes } from "@/routes";

const queryClient = new QueryClient();

export default function App() {
  // ThemeProvider MUST wrap everything so any useTheme() calls are inside it.
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* One global Tooltip provider only */}
          <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
            <AppRoutes />
          </Tooltip.Provider>

          {/* One toast system only. No other toasters anywhere else. */}
          <SonnerToaster position="top-right" richColors expand theme="system" />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}