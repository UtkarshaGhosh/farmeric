import { ChevronRight, Shield, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RiskAssessmentCardProps {
  currentScore?: number;
  maxScore?: number;
  riskLevel: "low" | "medium" | "high";
  lastAssessment?: string;
  daysUntilNext?: number;
}

export function RiskAssessmentCard({ 
  currentScore = 75, 
  maxScore = 100, 
  riskLevel, 
  lastAssessment = "2 weeks ago",
  daysUntilNext = 30
}: RiskAssessmentCardProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low": return <Shield className="h-5 w-5 text-risk-low" />;
      case "medium": return <AlertTriangle className="h-5 w-5 text-risk-medium" />;
      case "high": return <AlertTriangle className="h-5 w-5 text-risk-high" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-risk-low";
      case "medium": return "text-risk-medium";
      case "high": return "text-risk-high";
      default: return "text-muted-foreground";
    }
  };

  const progressColor = riskLevel === "low" ? "bg-risk-low" : 
                       riskLevel === "medium" ? "bg-risk-medium" : "bg-risk-high";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon(riskLevel)}
            <h3 className="font-semibold">Risk Assessment</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Score</span>
            <span className={`font-semibold ${getRiskColor(riskLevel)}`}>
              {currentScore}/{maxScore}
            </span>
          </div>
          <Progress value={(currentScore / maxScore) * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Last Assessment</p>
            <p className="font-medium">{lastAssessment}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Next Due</p>
            <p className="font-medium">{daysUntilNext} days</p>
          </div>
        </div>
        
        <Button className="w-full">
          Start New Assessment
        </Button>
      </CardContent>
    </Card>
  );
}