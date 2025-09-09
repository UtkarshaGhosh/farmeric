import { useState } from "react";
import { Shield, BookOpen, FileCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", labelKey: "tabs.dashboard", fallback: "Dashboard", icon: Shield },
  { id: "training", labelKey: "tabs.training", fallback: "Training", icon: BookOpen },
  { id: "compliance", labelKey: "tabs.compliance", fallback: "Compliance", icon: FileCheck },
  { id: "alerts", labelKey: "tabs.alerts", fallback: "Alerts", icon: AlertTriangle }
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const { t } = useI18n();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 h-auto min-w-0 flex-1",
                "transition-all duration-300 ease-in-out",
                activeTab === tab.id 
                  ? "text-primary bg-primary/10 shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  activeTab === tab.id && "scale-110"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
