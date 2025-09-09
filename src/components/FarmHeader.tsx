import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/integrations/supabase/api";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FarmHeaderProps {
  farmerName: string;
  farmName: string;
  riskLevel: "low" | "medium" | "high";
  notifications: number;
}

export function FarmHeader({ farmerName, farmName, riskLevel, notifications }: FarmHeaderProps) {
  const navigate = useNavigate();
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-risk-low-bg text-risk-low border-risk-low";
      case "medium": return "bg-risk-medium-bg text-risk-medium border-risk-medium";
      case "high": return "bg-risk-high-bg text-risk-high border-risk-high";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const { t } = useI18n();
  return (
    <header className="bg-white border-b border-border p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">{t("header.welcome","Welcome")}, {farmerName}</h1>
            <p className="text-sm text-muted-foreground">{farmName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${getRiskColor(riskLevel)} font-medium`}>
            {t("header.risk","Risk")}: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </Badge>

          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
                {notifications}
              </Badge>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate('/auth'); }}>
            <LogOut className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">{t("common.logout","Logout")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
