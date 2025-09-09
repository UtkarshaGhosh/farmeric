import { useEffect, useMemo, useState } from "react";
import { FarmHeader } from "@/components/FarmHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { DashboardTab } from "@/components/DashboardTab";
import { TrainingTab } from "@/components/TrainingTab";
import { ComplianceTab } from "@/components/ComplianceTab";
import { AlertsTab } from "@/components/AlertsTab";
import { getUserProfile, listMyFarms, listFarmAssessments } from "@/integrations/supabase/api";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface FarmInfo { id: string; name: string; livestock_type?: "pig" | "poultry"; }

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState("Farmer");
  const [farm, setFarm] = useState<FarmInfo | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.role === 'vet') { navigate('/vet', { replace: true }); return; }
        if (!profile || !profile.name || !(profile.language_preference || (profile as any).language)) {
          navigate("/onboarding", { replace: true });
          return;
        }
        if (!mounted) return;
        setFarmerName(profile.name || "Farmer");
        const farms = await listMyFarms();
        if (!farms || farms.length === 0) {
          navigate("/farm-setup", { replace: true });
          return;
        }
        if (!mounted) return;
        const f = farms[0] as FarmInfo;
        setFarm(f);
        try {
          const assessments = await listFarmAssessments(f.id);
          if (assessments && assessments.length) setRiskScore(assessments[0].score as number);
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const riskLevel = useMemo(() => {
    const score = riskScore ?? 65;
    if (score <= 40) return "low" as const;
    if (score <= 70) return "medium" as const;
    return "high" as const;
  }, [riskScore]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab farmerData={{ riskLevel }} />;
      case "training":
        return <TrainingTab />;
      case "compliance":
        return <ComplianceTab />;
      case "alerts":
        return <AlertsTab />;
      default:
        return <DashboardTab farmerData={{ riskLevel }} />;
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <FarmHeader 
        farmerName={farmerName}
        farmName={farm?.name || "Your Farm"}
        riskLevel={riskLevel}
        notifications={0}
      />
      <main className="p-4 max-w-md mx-auto">
        {renderTabContent()}
      </main>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
