
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
import Affiliate from "./pages/Affiliate";
import Discord from "./pages/Discord";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import Deploy from "./pages/Deploy";
import MinecraftConfig from "./pages/MinecraftConfig";
import FiveMConfig from "./pages/FiveMConfig";
import PalworldConfig from "./pages/PalworldConfig";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Status from "./pages/Status";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SLA from "./pages/SLA";
import Refund from "./pages/Refund";
import GivrwrldEssentials from "./pages/GivrwrldEssentials";
import GameExpansionPack from "./pages/GameExpansionPack";
import CommunityPack from "./pages/CommunityPack";
import PurchaseConfirmed from "./pages/PurchaseConfirmed";
import Dashboard from "./pages/Dashboard";
import DashboardSupport from "./pages/DashboardSupport";
import DashboardAffiliate from "./pages/DashboardAffiliate";
import DashboardOrder from "./pages/DashboardOrder";
import DashboardServices from "./pages/DashboardServices";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/discord" element={<Discord />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/configure/minecraft" element={<MinecraftConfig />} />
          <Route path="/configure/fivem" element={<FiveMConfig />} />
          <Route path="/configure/palworld" element={<PalworldConfig />} />
          <Route path="/status" element={<Status />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/sla" element={<SLA />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/upgrade/givrwrld-essentials" element={<GivrwrldEssentials />} />
          <Route path="/upgrade/game-expansion-pack" element={<GameExpansionPack />} />
          <Route path="/upgrade/community-pack" element={<CommunityPack />} />
          <Route path="/purchase-confirmed" element={<PurchaseConfirmed />} />
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><DashboardSupport /></ProtectedRoute>} />
          <Route path="/dashboard/affiliate" element={<ProtectedRoute><DashboardAffiliate /></ProtectedRoute>} />
          <Route path="/dashboard/order" element={<ProtectedRoute><DashboardOrder /></ProtectedRoute>} />
          <Route path="/dashboard/services" element={<ProtectedRoute><DashboardServices /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
