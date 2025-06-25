import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Success from "./pages/Success";
import About from "./pages/About";
import Discord from "./pages/Discord";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import Deploy from "./pages/Deploy";
import MinecraftConfig from "./pages/MinecraftConfig";
import FiveMConfig from "./pages/FiveMConfig";
import PalworldConfig from "./pages/PalworldConfig";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/success" element={<Success />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/discord" element={<Discord />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/configure/minecraft" element={<MinecraftConfig />} />
          <Route path="/configure/fivem" element={<FiveMConfig />} />
          <Route path="/configure/palworld" element={<PalworldConfig />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
