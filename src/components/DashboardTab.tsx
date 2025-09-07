import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";

interface DashboardTabProps {
  farmerData: {
    riskLevel: "low" | "medium" | "high";
  };
}

export const DashboardTab = ({ farmerData }: DashboardTabProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-xl border border-primary/20 shadow-sm">
          <div className="text-2xl font-bold text-primary">75</div>
          <div className="text-sm text-muted-foreground">Risk Score</div>
        </div>
        <div className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-xl border border-success/20 shadow-sm">
          <div className="text-2xl font-bold text-success">3/5</div>
          <div className="text-sm text-muted-foreground">Compliance</div>
        </div>
      </div>

      {/* Risk Assessment */}
      <RiskAssessmentCard
        currentScore={75}
        maxScore={100}
        riskLevel={farmerData.riskLevel}
        lastAssessment="2 weeks ago"
        daysUntilNext={30}
        onStartNewAssessment={() => setOpen(true)}
      />
      <RiskAssessmentForm open={open} onOpenChange={setOpen} />
    </div>
  );
};
