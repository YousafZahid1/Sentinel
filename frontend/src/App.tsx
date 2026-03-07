import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import OpsCenter from "./pages/OpsCenter";
import Prevention from "./pages/Prevention";
import Privacy from "./pages/Privacy";
import ResponderConsole from "./pages/ResponderConsole";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/console" element={<Navigate to="/console/ops" replace />} />
          <Route path="/console/ops" element={<OpsCenter />} />
          <Route path="/console/prevention" element={<Prevention />} />
          <Route path="/console/privacy" element={<Privacy />} />
          <Route path="/console/responder" element={<ResponderConsole />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
