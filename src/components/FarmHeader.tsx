import { Bell, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FarmHeaderProps {
  farmerName: string;
  farmName: string;
  riskLevel: "low" | "medium" | "high";
  notifications: number;
}

export function FarmHeader({ farmerName, farmName, riskLevel, notifications }: FarmHeaderProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-risk-low-bg text-risk-low border-risk-low";
      case "medium": return "bg-risk-medium-bg text-risk-medium border-risk-medium";
      case "high": return "bg-risk-high-bg text-risk-high border-risk-high";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="bg-white border-b border-border p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">Welcome, {farmerName}</h1>
            <p className="text-sm text-muted-foreground">{farmName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`${getRiskColor(riskLevel)} font-medium`}>
            Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </Badge>
          
          <Button variant="ghost" size="icon" className="relative">
            <Globe className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
                {notifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}