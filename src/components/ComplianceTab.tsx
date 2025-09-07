import { ComplianceTracker } from "@/components/ComplianceTracker";

const complianceRecords = [
  {
    id: "1",
    documentType: "Vaccination Certificate",
    fileName: "vaccination_Q1_2024.pdf",
    status: "approved" as const,
    submissionDate: "2024-01-15",
    reviewDate: "2024-01-18"
  },
  {
    id: "2",
    documentType: "Health Inspection Report", 
    fileName: "health_inspection_march.pdf",
    status: "pending" as const,
    submissionDate: "2024-03-10"
  },
  {
    id: "3",
    documentType: "Feed Quality Certificate",
    status: "rejected" as const,
    submissionDate: "2024-02-28",
    reviewDate: "2024-03-05"
  }
];

export const ComplianceTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-warning/10 to-warning/20 p-4 rounded-xl border border-warning/20">
        <h2 className="text-lg font-semibold text-warning mb-2">Compliance Status</h2>
        <p className="text-sm text-muted-foreground">2 documents pending review</p>
      </div>

      <ComplianceTracker 
        records={complianceRecords}
        completionRate={67}
      />
    </div>
  );
};