import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserProfile, signOut } from "@/integrations/supabase/api";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function VetLayout() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await getUserProfile();
      if (!p || p.role !== 'vet') { navigate('/', { replace: true }); return; }
      if (mounted) setName(p.name || 'Vet');
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-lg font-semibold">{t("nav.vetPortal", "Biosecurity Vet Portal")}</div>
            <nav className="flex items-center gap-4 text-sm">
              <NavLink to="/vet" end className={({isActive})=>isActive?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>{t("nav.dashboard","Dashboard")}</NavLink>
              <NavLink to="/vet/farms" className={({isActive})=>isActive?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>{t("nav.farmOversight","Farm Oversight")}</NavLink>
              <NavLink to="/vet/compliance" className={({isActive})=>isActive?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>{t("nav.complianceReview","Compliance Review")}</NavLink>
              <NavLink to="/vet/outbreaks" className={({isActive})=>isActive?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>{t("nav.outbreakReporting","Outbreak Reporting")}</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{name}</div>
            <Button variant="outline" size="sm" onClick={async ()=>{ await signOut(); navigate('/auth'); }}>{t("common.logout","Logout")}</Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
