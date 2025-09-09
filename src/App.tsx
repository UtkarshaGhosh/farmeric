import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Logout from "./pages/Logout";
import Onboarding from "./pages/Onboarding";
import FarmSetup from "./pages/FarmSetup";
import VetLayout from "./pages/vet/Layout";
import VetDashboard from "./pages/vet/Dashboard";
import VetFarms from "./pages/vet/Farms";
import VetCompliance from "./pages/vet/Compliance";
import VetOutbreaks from "./pages/vet/Outbreaks";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession, onAuthStateChange } from "@/integrations/supabase/api";
import { I18nProvider } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactElement }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setAuthed] = useState(false);
  useEffect(() => {
    let mounted = true;
    getSession().then((res: any) => {
      if (!mounted) return;
      setAuthed(!!res.session);
      setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });

    const unsub = onAuthStateChange((session) => {
      setAuthed(!!session);
    });

    return () => {
      mounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, []);
  if (loading) return null;
  if (!isAuthed) return <Navigate to="/auth" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <LanguageSwitcher />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/farm-setup" element={<RequireAuth><FarmSetup /></RequireAuth>} />
            <Route path="/vet" element={<RequireAuth><VetLayout /></RequireAuth>}>
              <Route index element={<VetDashboard />} />
              <Route path="farms" element={<VetFarms />} />
              <Route path="compliance" element={<VetCompliance />} />
              <Route path="outbreaks" element={<VetOutbreaks />} />
            </Route>
            <Route path="/logout" element={<Logout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
